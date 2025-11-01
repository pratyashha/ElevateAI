-- Revert NextAuth changes and restore Clerk schema

-- Drop NextAuth tables if they exist
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;

-- Remove NextAuth columns from User table if they exist
ALTER TABLE "User" 
  DROP COLUMN IF EXISTS "emailVerified",
  DROP COLUMN IF EXISTS "password";

-- Add back clerkUserId if it doesn't exist
-- Note: If the column was already dropped, we need to add it back
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'clerkUserId'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "clerkUserId" TEXT;
        -- Create unique index for clerkUserId
        CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkUserId_key" ON "User"("clerkUserId");
    END IF;
END $$;
