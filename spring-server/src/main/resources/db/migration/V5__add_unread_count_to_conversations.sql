-- Add unread_count column to conversations table
ALTER TABLE conversations ADD COLUMN unread_count INTEGER DEFAULT 0;
