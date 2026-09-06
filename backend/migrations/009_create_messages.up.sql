-- Migration 009 UP: Create messages table
-- Individual messages within a conversation.

CREATE TABLE messages (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id  UUID        NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_id        UUID        NOT NULL REFERENCES users (id)         ON DELETE RESTRICT,
    body             TEXT        NOT NULL,
    is_read          BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT messages_body_not_empty
        CHECK (length(trim(body)) > 0)
);

CREATE INDEX idx_messages_conversation_id
    ON messages (conversation_id);

CREATE INDEX idx_messages_sender_id
    ON messages (sender_id);

CREATE INDEX idx_messages_created_at
    ON messages (conversation_id, created_at DESC);

-- Partial index for unread-count queries
CREATE INDEX idx_messages_unread
    ON messages (conversation_id, is_read)
    WHERE is_read = FALSE;
