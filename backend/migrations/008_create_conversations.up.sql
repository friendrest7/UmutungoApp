-- Migration 008 UP: Create conversations table
-- A messaging thread between exactly two participants.
-- The CHECK constraint (a < b) prevents mirror-duplicate threads.

CREATE TABLE conversations (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_a_id UUID        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    participant_b_id UUID        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    property_id      UUID                 REFERENCES properties (id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at  TIMESTAMPTZ,

    -- Enforce a < b so (A,B) and (B,A) are the same conversation
    CONSTRAINT conversations_ordered_participants
        CHECK (participant_a_id < participant_b_id)
);

-- One thread per pair per property context
CREATE UNIQUE INDEX idx_conversations_unique_pair
    ON conversations (participant_a_id, participant_b_id, property_id)
    WHERE property_id IS NOT NULL;

CREATE UNIQUE INDEX idx_conversations_unique_pair_direct
    ON conversations (participant_a_id, participant_b_id)
    WHERE property_id IS NULL;

CREATE INDEX idx_conversations_participant_a  ON conversations (participant_a_id);
CREATE INDEX idx_conversations_participant_b  ON conversations (participant_b_id);
CREATE INDEX idx_conversations_property_id   ON conversations (property_id);
CREATE INDEX idx_conversations_last_message  ON conversations (last_message_at DESC NULLS LAST);
