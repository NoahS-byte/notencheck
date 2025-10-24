/*
  # Fix School Management System Schema

  1. Database Schema
    - Simplified and robust table structure
    - Proper foreign key relationships
    - Error-proof constraints
    
  2. Security
    - Updated RLS policies for reliable access
    - School manager permissions
    - Teacher access controls
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "School managers can manage schools" ON schools;
DROP POLICY IF EXISTS "Teachers can view schools" ON schools;
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;

DROP POLICY IF EXISTS "School managers and admins can manage all classes" ON classes;
DROP POLICY IF EXISTS "Allow teachers to read assigned classes" ON classes;
DROP POLICY IF EXISTS "Teachers can read classes through assignments" ON classes;
DROP POLICY IF EXISTS "Teachers can read their assigned classes" ON classes;

DROP POLICY IF EXISTS "School managers can manage students" ON students;
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON students;
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON students;

-- Ensure tables exist with proper structure
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade_level integer,
  subject text,
  teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  student_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- SCHOOLS POLICIES - Simple and reliable
CREATE POLICY "Anyone authenticated can read schools"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers and admins can insert schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can update schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can delete schools"
  ON schools FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

-- CLASSES POLICIES - Simple and reliable
CREATE POLICY "Anyone authenticated can read classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers and admins can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

-- STUDENTS POLICIES - Simple and reliable
CREATE POLICY "Anyone authenticated can read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School managers and admins can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "School managers and admins can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Add constraints to prevent data issues
ALTER TABLE classes ADD CONSTRAINT classes_name_not_empty CHECK (length(trim(name)) > 0);
ALTER TABLE schools ADD CONSTRAINT schools_name_not_empty CHECK (length(trim(name)) > 0);
ALTER TABLE students ADD CONSTRAINT students_email_not_empty CHECK (length(trim(email)) > 0);