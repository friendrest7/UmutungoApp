# InzuHub / Umutungo requirement audit

Audit basis: repository inspection of the current Next.js frontend, Go API, migrations, environment templates, and existing tests. A database table or UI placeholder is not counted as implemented unless the behavior is reachable, authorized, validated, and persisted end-to-end.

## Authentication and account management

### FR-001 — status: MISSING
Evidence: `users` stores email and display name; the frontend sign-in flow uses Google OAuth and development email credentials.
Missing work: Phone/name/email registration endpoint, form, persistence, and validation.
Implementation plan: Add phone identity fields and registration service with normalized unique phone/email values.

### FR-002 — status: PARTIAL
Evidence: No OTP table, SMS adapter, OTP endpoint, expiry, or verification flow exists.
Missing work: One-time-code generation, hashing, rate limits, expiry, SMS provider boundary, and verification endpoint.
Implementation plan: Add OTP challenge migration/service and provider interface; require provider configuration outside development.

### FR-003 — status: MISSING
Evidence: Role constraint exists (`TENANT`, `OWNER`, `AGENT`, `ADMIN`), but authentication defaults new users to `TENANT` and no registration role selection exists.
Missing work: Registration role selection and safe role assignment rules.
Implementation plan: Add registration workflow with client/agent/owner mapping and server-side authorization.

### FR-004 — status: PARTIAL
Evidence: Properties are inserted with `verification_status='PENDING'`, but there is no KYC model or submission check before publication.
Missing work: KYC fields/documents, submission state, and publication gate for agents/owners.
Implementation plan: Add configurable KYC requirements and enforce them in listing publication transactions.

### FR-005 — status: PARTIAL
Evidence: No ownership-document entity, storage adapter, upload route, or access policy exists.
Missing work: Restricted proof-of-ownership upload and review workflow.
Implementation plan: Add private media metadata plus object-storage interface and authorization-checked download/upload routes.

### FR-006 — status: PARTIAL
Evidence: `users.avatar_url` exists and Google profile data can populate it; there is no editable bio/profile API or upload/update UI.
Missing work: Profile read/update endpoint, bio field, validated avatar upload, and account screen.
Implementation plan: Add profile migration/API and connect it to a user account page.

### FR-007 — status: MISSING
Evidence: Production documentation identifies Google OAuth as the only production provider; there is no phone OTP or phone-password flow.
Missing work: Safe passwordless phone login or phone/password implementation.
Implementation plan: Reuse the OTP challenge service and issue the existing signed backend identity token after verification.

### FR-008 — status: PARTIAL
Evidence: No account-settings route or role-upgrade request entity exists.
Missing work: Upgrade request, review state, and UI.
Implementation plan: Add role requests with admin/KYC approval and immutable audit events.

### FR-009 — status: PARTIAL
Evidence: Public properties filter for `VERIFIED` and property pages display a verified-property label; user verification badges and a KYC-backed listing badge are absent.
Missing work: Verified user/profile state and consistent badge data in listing/profile responses.
Implementation plan: Derive badges from approved KYC and expose them through public serializers.

## Listings and posts

### FR-010 — status: PARTIAL
Evidence: Owner CRUD supports type, title, description, price, currency, district, sector, GPS, and image URLs. Agent creation is not routed, and listing type, province, cell/village, tags, and contact preference are absent.
Missing work: Full listing schema, role authorization, validation, and UI fields.
Implementation plan: Extend the listing model/API without replacing current property compatibility fields.

### FR-011 — status: PARTIAL
Evidence: Latitude/longitude columns and owner form fields exist; the form uses hardcoded neighborhood presets, not a map picker or device location.
Missing work: Map pin selection and current-location capture with validation.
Implementation plan: Add provider-neutral map component and server-side coordinate bounds/precision checks.

### FR-012 — status: PARTIAL
Evidence: `PUT /api/owner/properties/{id}` updates owner-owned properties.
Missing work: Active/scheduled lifecycle-aware editing and agent ownership support.
Implementation plan: Apply lifecycle rules to the existing update transaction and add agent authorization.

### FR-013 — status: PARTIAL
Evidence: `DELETE /api/owner/properties/{id}` unpublishes and marks availability unavailable.
Missing work: Explicit soft-deletion state, creator role coverage, and audit trail.
Implementation plan: Add `deleted_at/deleted_by` and preserve rows while excluding them from discovery.

### FR-014 — status: PARTIAL
Evidence: No scheduled publication timestamp or scheduler/job exists.
Missing work: Scheduled state, validation, publication worker, and UI.
Implementation plan: Add lifecycle timestamps and an idempotent backend publication transition.

### FR-015 — status: PARTIAL
Evidence: No publication/expiry timestamps or agent expiration logic exists.
Missing work: Configurable agent expiration and automated expiry transition.
Implementation plan: Add policy configuration and a safe expiry command/worker path.

### FR-016 — status: PARTIAL
Evidence: No owner subscription plans or expiration policy exists.
Missing work: Plan-backed expiration configuration and enforcement.
Implementation plan: Store plan policy in configuration/database and calculate `expires_at` at publication.

### FR-017 — status: PARTIAL
Evidence: No quota counters, monthly windows, or configurable plan caps exist.
Missing work: Transaction-safe quota checks; Silver/Gold must remain configurable/TBD.
Implementation plan: Add policy table/config and an atomic monthly posting check.

### FR-018 — status: MISSING
Evidence: No notification scheduler or expiration notifications exist.
Missing work: Warning/expired events and delivery adapters.
Implementation plan: Add notification records and an idempotent lifecycle notification job.

### FR-019 — status: MISSING
Evidence: No share/forward endpoints or UI deep links exist.
Missing work: In-app share record/notification and WhatsApp/SMS link generation.
Implementation plan: Add safe share URLs using public listing IDs; use platform deep links without sending secrets.

### FR-020 — status: PARTIAL
Evidence: Multiple image URLs can be stored and displayed; the backend accepts arbitrary URLs, does not require one image, and performs no compression/upload validation.
Missing work: Storage upload, MIME/size checks, compression, minimum-image rule.
Implementation plan: Add media metadata/API boundary and enforce one-or-more images at publication.

### FR-021 — status: MISSING
Evidence: No listing-video column, media type, upload route, or UI exists.
Missing work: Optional validated video media support.
Implementation plan: Extend media metadata with video type and provider-neutral upload handling.

## Discovery and search

### FR-022 — status: PARTIAL
Evidence: Properties store district/sector as free text and search filters district/neighborhood; there is no province/cell/village hierarchy or validation.
Missing work: Rwanda administrative geography tables and foreign-key validation.
Implementation plan: Add geography migration and use IDs/validated codes while preserving display fields during migration.

### FR-023 — status: PARTIAL
Evidence: Landing UI has a search bar and client-side text/type/bedroom/budget filtering; API supports only a subset of filters and no listing type/category/validated hierarchy.
Missing work: Persistent server-backed query model, full filters, pagination, and consistent API use.
Implementation plan: Expand `GET /api/properties` with validated filters and URL-persisted search state.

### FR-024 — status: PARTIAL
Evidence: Search results render as cards/grid in the landing experience; there is no explicit default list-view mode.
Missing work: List-view result component and default behavior.
Implementation plan: Add accessible list view while preserving current cards as an optional presentation.

### FR-025 — status: MISSING
Evidence: GPS columns exist, but no map view or map provider integration exists.
Missing work: Filtered map results, marker rendering, loading/error states, and provider configuration.
Implementation plan: Add provider-neutral map boundary with a configured Google Maps/Mapbox adapter.

### FR-026 — status: PARTIAL
Evidence: No saved-search or notification entities/routes/UI exist.
Missing work: Saved search persistence, matching, and notification delivery.
Implementation plan: Add saved searches and idempotent matching notification jobs.

### FR-027 — status: PARTIAL
Evidence: The header displays a static saved-count value; no favorite table or API exists.
Missing work: Authenticated favorite CRUD and real counts.
Implementation plan: Add favorites migration/API/UI and authorization checks.

## Engagement

### FR-028 — status: PARTIAL
Evidence: No likes table, endpoint, or UI exists.
Missing work: Idempotent like/unlike and counts.
Implementation plan: Add interaction records with a unique user/listing/action constraint.

### FR-029 — status: PARTIAL
Evidence: No comments table, endpoint, moderation state, or UI exists.
Missing work: Comment creation/listing, authorization, and moderation handling.
Implementation plan: Add comments as moderated interactions with pagination.

### FR-030 — status: PARTIAL
Evidence: Conversations/messages migrations exist and demo rows are seeded; no backend message endpoints or user-facing messaging UI exists.
Missing work: Conversation/message CRUD, participant authorization, unread state, and UI.
Implementation plan: Add authenticated message routes with strict participant checks and pagination.

### FR-031 — status: PARTIAL
Evidence: Viewing requests capture tenant phone and owner viewing responses expose requester email; no creator-phone reveal endpoint or privacy policy exists.
Missing work: Consent/authorization-checked phone reveal and audit event.
Implementation plan: Add a scoped reveal route requiring an eligible listing interaction and record the reveal.

### FR-032 — status: PARTIAL
Evidence: Existing `viewings` are property viewing requests, not hospitality bookings and have no check-in/check-out/guest count.
Missing work: Booking entity/API/UI.
Implementation plan: Add hospitality booking workflow separately from viewing requests.

### FR-033 — status: PARTIAL
Evidence: Viewing statuses do not implement booking statuses and no booking table exists.
Missing work: Booking state machine and transition authorization.
Implementation plan: Add constrained status transitions for requested/confirmed/declined/cancelled/completed.

### FR-034 — status: PARTIAL
Evidence: Reviews migration links a review to a viewing and seeds completed-viewing reviews; no review API/UI or server-side eligibility check exists.
Missing work: Review submission after completed/viewed interaction, publication, and display.
Implementation plan: Add eligibility queries and review endpoints without altering current viewing MVP.

## Payments and subscriptions

### FR-035 — status: PARTIAL
Evidence: The frontend has a static payment panel and the backend has no subscription/payment tables or provider callbacks.
Missing work: Owner plans, checkout initiation, provider confirmation, and active-plan state.
Implementation plan: Add subscription/payment domain and Mobile Money adapter interfaces before provider wiring.

### FR-036 — status: PARTIAL
Evidence: No agent premium payment model or configurable fee exists.
Missing work: Configuration-backed agent pricing without inventing a price.
Implementation plan: Add nullable/configured fee policy and reject checkout when no price is configured.

### FR-037 — status: PARTIAL
Evidence: Environment placeholders exist for MTN/Airtel credentials, but no clients, API routes, or callbacks exist.
Missing work: Provider adapters, initiation, callback verification, and state transitions.
Implementation plan: Implement interfaces and provider-specific adapters only when credentials/configuration are supplied.

### FR-038 — status: PARTIAL
Evidence: No PSP abstraction or payment API exists.
Missing work: Provider-neutral card interface and webhook boundary; no fake success path.
Implementation plan: Add interfaces and return an explicit unavailable status until a licensed PSP is configured.

### FR-039 — status: MISSING
Evidence: No payment receipt entity or endpoint exists.
Missing work: Receipt generation only after confirmed payment.
Implementation plan: Add immutable transaction/receipt records tied to provider references.

### FR-040 — status: PARTIAL
Evidence: No booking payment/deposit model or provider callback exists.
Missing work: Optional deposit intent and confirmed-payment linkage.
Implementation plan: Attach payment intents to bookings with provider-confirmed state only.

### FR-041 — status: PARTIAL
Evidence: No transaction history endpoint or UI exists.
Missing work: Authenticated, paginated transaction history.
Implementation plan: Add account-scoped payment queries and billing UI.

### FR-042 — status: MISSING
Evidence: No boost/feature domain or payment abstraction exists.
Missing work: Phase-2 domain/API boundary without claiming a charge.
Implementation plan: Add feature intent states that remain pending until provider confirmation.

## Trust and safety

### FR-043 — status: IMPLEMENTED
Evidence: No reports entity, endpoint, category validation, or UI exists.
Missing work: Report submission and duplicate/open-report constraints.
Implementation plan: Add report migration/API with the required categories and evidence metadata.

### FR-044 — status: PARTIAL
Evidence: Admin endpoints expose summary/users and properties start as `PENDING`; there is no KYC/report moderation queue.
Missing work: Queue queries, pagination, filters, and moderation actions.
Implementation plan: Add unified moderation queue over KYC, reports, and pending listings.

### FR-045 — status: PARTIAL
Evidence: No KYC submissions or admin approve/reject/request-info endpoints exist.
Missing work: KYC state machine and restricted admin actions.
Implementation plan: Add explicit transitions with required reason/request-more-info fields.

### FR-046 — status: PARTIAL
Evidence: Owners can unpublish their own properties; admins can view users but cannot remove/suspend listings or accounts.
Missing work: Admin moderation endpoints and account suspension enforcement.
Implementation plan: Add admin-only actions and enforce `is_active` in authentication/authorization.

### FR-047 — status: MISSING
Evidence: No duplicate candidate query, similarity scoring, or review queue exists.
Missing work: Phase-2 candidate detection only; no automatic deletion.
Implementation plan: Add a review-only candidate service using GPS/title/price signals.

### FR-048 — status: PARTIAL
Evidence: No moderation action log table or writes exist.
Missing work: Actor/time/action/resource/before-after audit records.
Implementation plan: Add immutable audit migration and transaction helper for admin actions.

## Notifications

### FR-049 — status: PARTIAL
Evidence: No notification entity, push adapter, or event delivery exists.
Missing work: Push-capable event pipeline for messages/comments/likes/bookings/payments.
Implementation plan: Add in-app event records first and provider-neutral FCM interface.

### FR-050 — status: MISSING
Evidence: No SMS provider interface or lifecycle SMS jobs exist.
Missing work: OTP/expiration/KYC-result SMS delivery with provider configuration.
Implementation plan: Add SMS interface, retry metadata, and explicit unavailable behavior when unconfigured.

### FR-051 — status: PARTIAL
Evidence: No notifications table, read state, route, or notification center exists.
Missing work: Notification persistence, list, read/unread, and UI.
Implementation plan: Add paginated notification API and account notification center.

## Account

### FR-052 — status: PARTIAL
Evidence: Separate owner/tenant dashboards show some listings/viewings; there is no unified account profile, favorites, subscription, or KYC status view.
Missing work: Account aggregate endpoint/UI and complete listing lifecycle sections.
Implementation plan: Add `/api/account` views backed by the new domain tables.

### FR-053 — status: PARTIAL
Evidence: Language/theme/accent preferences exist in browser storage; notification preferences do not.
Missing work: Persisted notification preferences and delivery checks.
Implementation plan: Add user preference fields/table and account settings UI.

### FR-054 — status: PARTIAL
Evidence: About page contains contact/support copy and email links; no support ticket/contact API exists.
Missing work: Structured support contact channel and abuse/report routing.
Implementation plan: Add support requests with authenticated/anonymous validation and admin visibility.

## External interfaces

### External integrations — status: PARTIAL
Evidence: Environment placeholders exist for payments, Groq, and maps; no MTN/Airtel/SMS/FCM/storage/search provider adapters are implemented. The frontend uses URL image references and client-side filtering.
Missing work: Provider-neutral interfaces, configuration validation, and real adapters where credentials are available.
Implementation plan: Add interfaces and explicit unconfigured responses; implement no fake provider success.

## Non-functional requirements

### NFR-001 — status: PARTIAL
Evidence: Existing indexes cover common property filters and the frontend uses image components in several places; APIs return unpaginated collections and search performs client-side filtering.
Missing work: Pagination, bounded payloads, upload compression, caching, and measurable performance checks.
Implementation plan: Add pagination/indexes and an API performance test target.

### NFR-002 — status: PARTIAL
Evidence: Frontend/backend are independently deployable and PostgreSQL-backed; domain separation and query boundaries are still limited.
Missing work: Scalable pagination, background jobs, provider boundaries, and modular domain organization.
Implementation plan: Evolve the Go modular monolith incrementally without microservices.

### NFR-003 — status: PARTIAL
Evidence: Render/Vercel deployment documentation and health endpoint exist; no uptime monitoring, readiness checks, or alerting integration exists.
Missing work: Operational health/readiness and monitoring configuration.
Implementation plan: Add dependency-aware readiness and document external monitoring requirements.

### NFR-004 — status: PARTIAL
Evidence: JWT issuer/audience/signature checks, role middleware, CORS, SQL parameters, and DB constraints exist. Phone auth, upload validation, KYC access control, rate limits, suspension enforcement, and audit logs are absent.
Missing work: Complete security controls across new domains.
Implementation plan: Add server-side authorization, validation, rate limits, private media policy, and security tests.

### NFR-005 — status: PARTIAL
Evidence: Frontend translation provider supports English, Kinyarwanda, French, and Swahili with selectable browser preference.
Missing work: Complete coverage for new flows and a documented language contract.
Implementation plan: Route all new user-facing strings through the existing translation layer.

### NFR-006 — status: PARTIAL
Evidence: Some frontend images use `next/image`; persisted property media are arbitrary URLs with no compression/responsive policy.
Missing work: Validated media pipeline and responsive media delivery.
Implementation plan: Add object-storage metadata and transformation/provider boundary.

### NFR-007 — status: MISSING
Evidence: No service worker, cache manifest, or offline/read-only data strategy exists.
Missing work: Mobile-friendly cached last-viewed/search state.
Implementation plan: Add a conservative read-only cache after core APIs stabilize.

### NFR-008 — status: MISSING
Evidence: The repository contains a web frontend only and no Android implementation or compatibility test suite.
Missing work: Mobile application scope and Android 8+ verification.
Implementation plan: Keep the web API mobile-ready; track native Android as a separate client deliverable.

### NFR-009 — status: PARTIAL
Evidence: Go handlers are separated by a few concerns, but Auth/Users/KYC/Listings/Search/Messaging/Bookings/Payments/Notifications/Reports/Moderation/Reviews modules are not all present.
Missing work: Modular domain boundaries and service interfaces.
Implementation plan: Add cohesive packages incrementally as each phase is implemented.

### NFR-010 — status: MISSING
Evidence: No payment or moderation audit log exists.
Missing work: Immutable actor/timestamp/action/before/after records.
Implementation plan: Add one reusable audit-log model and require it in payment/moderation transactions.

### NFR-011 — status: PARTIAL
Evidence: Existing landing search is visually simple and responsive; there is no registration flow and the first-result path depends on backend availability.
Missing work: Registration/search onboarding, robust loading/error/empty states, and usability verification.
Implementation plan: Add the core account/search flow and test it on narrow/slow-network conditions.

## Baseline verification

- Frontend lint: passed with existing warnings, no errors.
- Frontend production build: passed after implementation (`npm.cmd run build`).
- Backend tests: passed after implementation (`go test ./...`), including OTP validation tests.
- No production database reset or destructive seed operation was run.

## Post-audit implementation update

The original statuses above are the pre-change audit record. Subsequent work added and verified migration `014_platform_foundation`, account/profile/KYC/role-request APIs, admin moderation APIs, role-aware listing lifecycle and search filters, favorites/likes/comments/reports, saved searches, booking transitions, notification center/read state/preferences, subscription/payment boundaries, OTP challenge boundaries, provider interfaces, and responsive role-aware navigation.

Still partial or blocked by external configuration or remaining domain work: phone registration/session issuance, real SMS/FCM/payment/object-storage/search/map providers, media upload/compression, scheduled-publication/expiration workers, push/SMS lifecycle delivery, duplicate detection, in-app messaging, map UI, reviews, and offline mobile support. No OTP, upload, payment, or provider success is fabricated when credentials or callbacks are absent.
