/*
  # Add teacher-class assignment functionality

  1. New Tables
    - `teacher_classes` - Junction table for many-to-many relationship between teachers and classes
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, foreign key to users)
      - `class_id` (uuid, foreign key to classes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `teacher_classes` table
    - Add policies for school managers and admins to manage assignments
    - Add policies for teachers to view their own assignments

  3. Changes
    - Remove single teacher_id from classes table (replaced by junction table)
    - Add indexes for performance
*/

-- Create teacher_classes junction table
CREATE TABLE IF NOT EXISTS teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, class_id)
);

-- Enable RLS
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class_id ON teacher_classes(class_id);

-- RLS Policies for teacher_classes
CREATE POLICY "School managers can manage teacher assignments"
  ON teacher_classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "Teachers can view their own assignments"
  ON teacher_classes
  FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

-- Update existing classes policies to work with new structure
DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
DROP POLICY IF EXISTS "School managers can manage classes" ON classes;

CREATE POLICY "School managers can manage all classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

CREATE POLICY "Teachers can manage assigned classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teacher_classes 
      WHERE teacher_classes.class_id = classes.id 
      AND teacher_classes.teacher_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.is_school_manager = true)
    )
  );

-- Migrate existing teacher_id assignments to junction table
DO $$
BEGIN
  INSERT INTO teacher_classes (teacher_id, class_id)
  SELECT teacher_id, id
  FROM classes
  WHERE teacher_id IS NOT NULL
  ON CONFLICT (teacher_id, class_id) DO NOTHING;
END $$;

-- Remove teacher_id column from classes (optional - can keep for backward compatibility)
-- ALTER TABLE classes DROP COLUMN IF EXISTS teacher_id;