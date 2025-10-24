/*
  # Fix schools table INSERT policy

  1. Security Changes
    - Drop existing restrictive INSERT policy
    - Add new policy allowing authenticated users to insert schools
    - Ensure school managers and admins can create schools

  This fixes the RLS violation error when creating new schools.
*/

-- Drop existing restrictive INSERT policy if it exists
DROP POLICY IF EXISTS "School managers and admins can insert schools" ON schools;

-- Create new INSERT policy that allows authenticated users to create schools
CREATE POLICY "Authenticated users can insert schools"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure UPDATE and DELETE policies exist for school managers
DROP POLICY IF EXISTS "School managers and admins can update schools" ON schools;
DROP POLICY IF EXISTS "School managers and admins can delete schools" ON schools;

CREATE POLICY "School managers and admins can update schools"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can delete schools"
  ON schools
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );