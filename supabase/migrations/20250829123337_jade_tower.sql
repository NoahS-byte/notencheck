/*
  # Fix RLS policies for schools table

  1. Security Updates
    - Update INSERT policy to properly check for school managers and admins
    - Fix policy to use auth.uid() for current user identification
    - Ensure school managers can create and manage schools

  2. Policy Changes
    - Allow authenticated school managers and admins to insert schools
    - Maintain existing read permissions for all authenticated users
    - Keep update/delete permissions for school managers and admins only
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone authenticated can read schools" ON schools;
DROP POLICY IF EXISTS "Authenticated users can insert schools" ON schools;
DROP POLICY IF EXISTS "School managers and admins can update schools" ON schools;
DROP POLICY IF EXISTS "School managers and admins can delete schools" ON schools;

-- Create new, properly working policies
CREATE POLICY "Anyone authenticated can read schools"
  ON schools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers and admins can insert schools"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

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