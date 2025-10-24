/*
  # Fix School Management RLS Policies

  1. Security Changes
    - Drop all existing problematic RLS policies
    - Create simple, working RLS policies for school management
    - Allow authenticated users to manage schools, classes, and students
    - Use proper auth.uid() checks

  2. Policy Structure
    - Schools: Authenticated users can manage all schools (simplified for school managers)
    - Classes: Authenticated users can manage all classes
    - Students: Authenticated users can manage all students
    - Teacher Classes: Authenticated users can manage teacher assignments
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "School managers and admins can create schools" ON schools;
DROP POLICY IF EXISTS "School managers can read their schools" ON schools;
DROP POLICY IF EXISTS "School managers can update their schools" ON schools;
DROP POLICY IF EXISTS "School managers can delete their schools" ON schools;

DROP POLICY IF EXISTS "School managers and teachers can read classes" ON classes;
DROP POLICY IF EXISTS "School managers can create classes" ON classes;
DROP POLICY IF EXISTS "School managers can update classes" ON classes;
DROP POLICY IF EXISTS "School managers can delete classes" ON classes;

DROP POLICY IF EXISTS "School managers and teachers can read students" ON students;
DROP POLICY IF EXISTS "School managers can create students" ON students;
DROP POLICY IF EXISTS "School managers can update students" ON students;
DROP POLICY IF EXISTS "School managers can delete students" ON students;

DROP POLICY IF EXISTS "School managers can manage teacher assignments" ON teacher_classes;
DROP POLICY IF EXISTS "Teachers can read their assignments" ON teacher_classes;

-- Create simple, working policies for schools
CREATE POLICY "Authenticated users can read schools"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers can create schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

CREATE POLICY "School managers can update schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "School managers can delete schools"
  ON schools FOR DELETE
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create simple policies for classes
CREATE POLICY "Authenticated users can read classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

CREATE POLICY "School managers can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

CREATE POLICY "School managers can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

-- Create simple policies for students
CREATE POLICY "Authenticated users can read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers can create students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

CREATE POLICY "School managers can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

CREATE POLICY "School managers can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );

-- Create simple policies for teacher_classes
CREATE POLICY "Authenticated users can read teacher assignments"
  ON teacher_classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers can manage teacher assignments"
  ON teacher_classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_school_manager = true OR users.is_admin = true)
    )
  );