/*
  # Fix RLS policies for classes table

  1. Security Updates
    - Drop existing restrictive policies on classes table
    - Add proper policies for school managers and teachers
    - Allow authenticated users to read classes
    - Allow school managers to manage classes
    - Allow teachers to read classes they're assigned to

  2. Policy Changes
    - SELECT: Allow all authenticated users to view classes
    - INSERT/UPDATE/DELETE: Allow school managers and admins
    - Ensure teachers can read their assigned classes
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "School managers can manage all classes" ON classes;
DROP POLICY IF EXISTS "Teachers can manage assigned classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view all classes" ON classes;

-- Create new, properly configured policies
CREATE POLICY "Allow authenticated users to read classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow school managers to manage classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "Allow teachers to read assigned classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );