/*
  # Fix schools table RLS INSERT policy

  1. Security Changes
    - Drop existing INSERT policy that's causing conflicts
    - Create new INSERT policy that allows authenticated users to create schools
    - Ensure manager_id is automatically set to current user
    - Allow both school managers and admins to create schools

  2. Policy Details
    - INSERT policy: Allows authenticated users to insert schools where they are the manager
    - Uses auth.uid() to automatically set manager_id
    - Validates that user is either school manager or admin
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "School managers can create schools" ON schools;
DROP POLICY IF EXISTS "Allow school creation" ON schools;
DROP POLICY IF EXISTS "Authenticated users can create schools" ON schools;

-- Create new INSERT policy that works properly
CREATE POLICY "School managers and admins can create schools"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    manager_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_school_manager = true OR is_admin = true)
    )
  );

-- Ensure SELECT policy exists for reading schools
DROP POLICY IF EXISTS "School managers can read their schools" ON schools;
CREATE POLICY "School managers can read their schools"
  ON schools
  FOR SELECT
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Ensure UPDATE policy exists
DROP POLICY IF EXISTS "School managers can update their schools" ON schools;
CREATE POLICY "School managers can update their schools"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Ensure DELETE policy exists
DROP POLICY IF EXISTS "School managers can delete their schools" ON schools;
CREATE POLICY "School managers can delete their schools"
  ON schools
  FOR DELETE
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );