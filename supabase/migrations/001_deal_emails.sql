-- Deal-Scoped Emails
-- Stores email conversations that are associated with a deal/opportunity
-- rather than a contact (which GHL doesn't support natively)

CREATE TABLE deal_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- GHL references
  ghl_location_id TEXT NOT NULL,
  ghl_opportunity_id TEXT NOT NULL,
  
  -- Email metadata
  message_id TEXT UNIQUE,              -- Postmark MessageID for tracking
  in_reply_to TEXT,                     -- For threading
  thread_id UUID,                       -- Groups emails into threads
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  
  -- Participants
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB NOT NULL DEFAULT '[]',   -- [{email, name}]
  cc_emails JSONB DEFAULT '[]',
  
  -- Content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  
  -- Attachments metadata (store refs, not files)
  attachments JSONB DEFAULT '[]',       -- [{name, size, content_type, url}]
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'bounced', 'failed')),
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deal_emails_opportunity ON deal_emails(ghl_location_id, ghl_opportunity_id);
CREATE INDEX idx_deal_emails_thread ON deal_emails(thread_id);
CREATE INDEX idx_deal_emails_message_id ON deal_emails(message_id);
CREATE INDEX idx_deal_emails_sent_at ON deal_emails(sent_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_emails_updated_at
  BEFORE UPDATE ON deal_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE deal_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deal emails for their locations"
  ON deal_emails FOR SELECT
  USING (true);  -- Refine with actual auth logic

CREATE POLICY "Users can insert deal emails"
  ON deal_emails FOR INSERT
  WITH CHECK (true);  -- Refine with actual auth logic
