/*
  Add unique constraint to users.email
*/

-- Make email required
ALTER TABLE "users"
ALTER COLUMN "email" SET NOT NULL;

-- Make email unique
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");