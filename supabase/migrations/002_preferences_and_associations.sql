-- User Preferences
-- Stores per-user, per-location UI customization

CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ghl_location_id TEXT NOT NULL,
  
  -- Layout preferences
  contact_field_order JSONB DEFAULT '[]',     -- Ordered list of field group IDs for contact left column
  deal_field_order JSONB DEFAULT '[]',        -- Ordered list of field group IDs for deal left column
  hidden_field_groups JSONB DEFAULT '[]',     -- Field groups the user has collapsed/hidden
  column_widths JSONB DEFAULT '{"left": 320, "right": 300}',
  
  -- Default filters
  default_contact_filters JSONB DEFAULT '{}',
  default_deal_filters JSONB DEFAULT '{}',
  
  -- Display preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  timeline_density TEXT DEFAULT 'comfortable' CHECK (timeline_density IN ('compact', 'comfortable', 'spacious')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, ghl_location_id)
);

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Custom Associations
-- For record relationships GHL doesn't support natively

CREATE TABLE custom_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ghl_location_id TEXT NOT NULL,
  
  -- Source record
  source_type TEXT NOT NULL CHECK (source_type IN ('contact', 'opportunity', 'company')),
  source_id TEXT NOT NULL,              -- GHL record ID
  
  -- Target record
  target_type TEXT NOT NULL CHECK (target_type IN ('contact', 'opportunity', 'company')),
  target_id TEXT NOT NULL,              -- GHL record ID
  
  -- Association metadata
  association_type TEXT NOT NULL,       -- e.g., 'decision_maker', 'financing_partner', 'referral'
  label TEXT,                           -- Human-readable label
  notes TEXT,
  
  -- Who created it
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ghl_location_id, source_type, source_id, target_type, target_id, association_type)
);

CREATE INDEX idx_associations_source ON custom_associations(ghl_location_id, source_type, source_id);
CREATE INDEX idx_associations_target ON custom_associations(ghl_location_id, target_type, target_id);

ALTER TABLE custom_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view associations for their locations"
  ON custom_associations FOR SELECT
  USING (true);

CREATE POLICY "Users can manage associations"
  ON custom_associations FOR ALL
  USING (true);
