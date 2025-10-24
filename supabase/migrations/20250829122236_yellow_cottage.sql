/*
  # Fix Classes Table RLS Policy

  1. Security Changes
    - Drop existing restrictive policies on classes table
    - Add proper SELECT policy for teachers to read their assigned classes
    - Add proper management policies for school managers and admins
    - Ensure teachers can read classes where they are assigned as teacher_id

  2. Policy Details
    - Teachers can SELECT classes where auth.uid() = teacher_id
    - School managers and admins can perform all operations
    - Authenticated users can read basic class information
*/

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read classes" ON classes;
DROP POLICY IF EXISTS "Allow school managers to manage classes" ON classes;
DROP POLICY IF EXISTS "Teachers can read assigned classes" ON classes;

-- Create new, clear policies
CREATE POLICY "Teachers can read their assigned classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "School managers and admins can manage all classes"
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

-- Additional policy for teachers assigned through teacher_classes junction table
CREATE POLICY "Teachers can read classes through assignments"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teacher_classes 
      WHERE teacher_classes.class_id = classes.id 
      AND teacher_classes.teacher_id = auth.uid()
    )
  );