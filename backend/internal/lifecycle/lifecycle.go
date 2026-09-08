// Package lifecycle contains idempotent database transitions for listings.
// It is safe to run repeatedly from a single backend instance or an external
// scheduler; it never creates schema or seeds data.
package lifecycle

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RunOnce(ctx context.Context, pool *pgxpool.Pool) error {
	if _, err := pool.Exec(ctx, `
		UPDATE properties p
		SET is_published=TRUE, published_at=COALESCE(published_at,NOW()), scheduled_for=NULL, updated_at=NOW()
		FROM users u
		WHERE p.owner_id=u.id
		  AND p.is_published=FALSE AND p.deleted_at IS NULL
		  AND p.scheduled_for IS NOT NULL AND p.scheduled_for <= NOW()
		  AND u.verification_status='VERIFIED'
		  AND (u.role='AGENT' OR EXISTS (
			SELECT 1 FROM subscriptions s
			JOIN subscription_plans sp ON sp.code=s.plan_code
			WHERE s.user_id=u.id AND s.status='ACTIVE'
			  AND (s.ends_at IS NULL OR s.ends_at > NOW()) AND sp.is_active=TRUE
		  ))`); err != nil {
		return err
	}

	if _, err := pool.Exec(ctx, `
		INSERT INTO notifications (user_id,kind,title,body,data)
		SELECT COALESCE(p.agent_id,p.owner_id), 'LISTING_EXPIRING', 'Listing expires soon',
		       'Your listing "' || p.title || '" expires within three days.',
		       jsonb_build_object('listing_id',p.id,'expires_at',p.expires_at)
		FROM properties p
		WHERE p.is_published=TRUE AND p.deleted_at IS NULL
		  AND p.expires_at > NOW() AND p.expires_at <= NOW()+INTERVAL '3 days'
		  AND NOT EXISTS (
			SELECT 1 FROM notifications n
			WHERE n.user_id=COALESCE(p.agent_id,p.owner_id)
			  AND n.kind='LISTING_EXPIRING'
			  AND n.data->>'listing_id'=p.id::text
			  AND n.created_at >= NOW()-INTERVAL '4 days'
		  )`); err != nil {
		return err
	}

	if _, err := pool.Exec(ctx, `
		WITH expired AS (
			UPDATE properties
			SET is_published=FALSE, availability_status='UNAVAILABLE', updated_at=NOW()
			WHERE is_published=TRUE AND deleted_at IS NULL AND expires_at IS NOT NULL AND expires_at <= NOW()
			RETURNING id, COALESCE(agent_id,owner_id) AS user_id, title
		)
		INSERT INTO notifications (user_id,kind,title,body,data)
		SELECT e.user_id, 'LISTING_EXPIRED', 'Listing expired',
		       'Your listing "' || e.title || '" has expired.',
		       jsonb_build_object('listing_id',e.id)
		FROM expired e
		WHERE NOT EXISTS (
			SELECT 1 FROM notifications n
			WHERE n.user_id=e.user_id AND n.kind='LISTING_EXPIRED'
			  AND n.data->>'listing_id'=e.id::text
			  AND n.created_at >= NOW()-INTERVAL '2 days'
		)`); err != nil {
		return err
	}
	return nil
}
