/*
  # Complete School Management System Redesign

  1. New Tables
    - `schools` - Simple school management
    - `classes` - Classes linked to schools  
    - `students` - Students linked to classes
    - `teacher_classes` - Many-to-many relationship for teacher assignments

  2. Security
    - Simple RLS policies that actually work
    - School managers can manage everything
    - Teachers can only read their assigned data
    - No complex nested queries that cause RLS failures

  3. Changes
    - Removed complex foreign key constraints that cause RLS issues
    - Added manager_id to schools for ownership
    - Simplified all policies to use direct user checks
    - Added proper indexes for performance
*/

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS event_classes CASCADE;
DROP TABLE IF EXISTS teacher_classes CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Create schools table with manager ownership
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  address text,
  contact_email text,
  manager_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  grade_level integer CHECK (grade_level >= 1 AND grade_level <= 13),
  subject text,
  teacher_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  email text NOT NULL CHECK (length(trim(email)) > 0),
  first_name text,
  last_name text,
  student_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teacher_classes junction table
CREATE TABLE teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  class_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, class_id)
);

-- Add indexes for performance
CREATE INDEX idx_schools_manager_id ON schools(manager_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_teacher_classes_teacher_id ON teacher_classes(teacher_id);
CREATE INDEX idx_teacher_classes_class_id ON teacher_classes(class_id);

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;

-- SCHOOLS POLICIES - Simple and reliable
CREATE POLICY "School managers can create schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (
    manager_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (is_school_manager = true OR is_admin = true)
    )
  );

CREATE POLICY "School managers can read their schools"
  ON schools FOR SELECT
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "School managers can update their schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "School managers can delete their schools"
  ON schools FOR DELETE
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- CLASSES POLICIES - Simple ownership through schools
CREATE POLICY "School managers can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE id = school_id 
      AND (
        manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "School managers and teachers can read classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE id = school_id 
      AND manager_id = auth.uid()
    ) OR
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "School managers can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE id = school_id 
      AND (
        manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "School managers can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE id = school_id 
      AND (
        manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

-- STUDENTS POLICIES - Through class ownership
CREATE POLICY "School managers can create students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN schools s ON c.school_id = s.id
      WHERE c.id = class_id 
      AND (
        s.manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "School managers and teachers can read students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN schools s ON c.school_id = s.id
      WHERE c.id = class_id 
      AND (
        s.manager_id = auth.uid() OR
        c.teacher_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "School managers can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN schools s ON c.school_id = s.id
      WHERE c.id = class_id 
      AND (
        s.manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "School managers can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN schools s ON c.school_id = s.id
      WHERE c.id = class_id 
      AND (
        s.manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

-- TEACHER_CLASSES POLICIES
CREATE POLICY "School managers can manage teacher assignments"
  ON teacher_classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN schools s ON c.school_id = s.id
      WHERE c.id = class_id 
      AND (
        s.manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN schools s ON c.school_id = s.id
      WHERE c.id = class_id 
      AND (
        s.manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "Teachers can read their assignments"
  ON teacher_classes FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());