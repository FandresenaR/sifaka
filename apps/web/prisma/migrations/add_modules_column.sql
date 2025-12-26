-- Add missing modules column to Project table
ALTER TABLE "Project" 
ADD COLUMN IF NOT EXISTS "modules" JSONB;
