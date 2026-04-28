-- Add is_lead_notified column to potential_leads table
ALTER TABLE potential_leads ADD COLUMN is_lead_notified BOOLEAN DEFAULT FALSE;
