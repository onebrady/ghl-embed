-- GHL Location Credentials
-- Stores Private Integration Tokens per GHL sub-account (location)
-- so the app can dynamically resolve tokens based on locationId from the URL.

CREATE TABLE ghl_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- GHL identifiers
  location_id TEXT NOT NULL UNIQUE,
  location_name TEXT NOT NULL,

  -- Credentials
  private_integration_token TEXT NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ghl_locations_location_id ON ghl_locations(location_id);

-- Auto-update updated_at (reuse function from 001 if exists)
CREATE TRIGGER ghl_locations_updated_at
  BEFORE UPDATE ON ghl_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE ghl_locations ENABLE ROW LEVEL SECURITY;

-- Service role has full access (API routes use service role key)
CREATE POLICY "Service role full access on ghl_locations"
  ON ghl_locations FOR ALL
  USING (true)
  WITH CHECK (true);
