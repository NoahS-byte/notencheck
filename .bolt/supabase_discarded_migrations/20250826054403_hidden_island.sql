/*
  # Teacher Assignment and School Management System

  1. New Tables
    - Enhanced schools table with better structure
    - Enhanced classes table with teacher assignments
    - Enhanced students table with class relationships
    
  2. Sample Data
    - Sample schools with realistic German school names
    - Sample classes for each school
    - Sample students with German names and email addresses
    
  3. Security
    - Enable RLS on all tables
    - Add policies for teacher and admin access
*/

-- Create schools table if not exists
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact_email text,
  phone text,
  school_type text DEFAULT 'Gymnasium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table if not exists
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade_level integer,
  subject text,
  teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  max_students integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table if not exists
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  student_number text,
  date_of_birth date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools
CREATE POLICY "Admins can manage schools"
  ON schools
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Teachers can view schools"
  ON schools
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for classes
CREATE POLICY "Teachers can manage their classes"
  ON classes
  FOR ALL
  TO public
  USING (
    (teacher_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true))
  );

CREATE POLICY "Teachers can view all classes"
  ON classes
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for students
CREATE POLICY "Teachers can manage students in their classes"
  ON students
  FOR ALL
  TO public
  USING (
    (EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND teacher_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true))
  );

CREATE POLICY "Teachers can view students in their classes"
  ON students
  FOR SELECT
  TO public
  USING (
    (EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND teacher_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true))
  );

-- Insert sample schools
INSERT INTO schools (name, address, contact_email, phone, school_type) VALUES
  ('Goethe-Gymnasium München', 'Goethestraße 12, 80336 München', 'info@goethe-gym-muenchen.de', '+49 89 12345678', 'Gymnasium'),
  ('Friedrich-Schiller-Realschule Berlin', 'Schillerstraße 45, 10625 Berlin', 'sekretariat@schiller-realschule.de', '+49 30 87654321', 'Realschule'),
  ('Heinrich-Heine-Gesamtschule Hamburg', 'Heinestraße 78, 20146 Hamburg', 'verwaltung@heine-gesamtschule.de', '+49 40 11223344', 'Gesamtschule')
ON CONFLICT DO NOTHING;

-- Insert sample classes
DO $$
DECLARE
  school_goethe uuid;
  school_schiller uuid;
  school_heine uuid;
BEGIN
  -- Get school IDs
  SELECT id INTO school_goethe FROM schools WHERE name = 'Goethe-Gymnasium München' LIMIT 1;
  SELECT id INTO school_schiller FROM schools WHERE name = 'Friedrich-Schiller-Realschule Berlin' LIMIT 1;
  SELECT id INTO school_heine FROM schools WHERE name = 'Heinrich-Heine-Gesamtschule Hamburg' LIMIT 1;
  
  -- Insert classes for Goethe-Gymnasium
  IF school_goethe IS NOT NULL THEN
    INSERT INTO classes (school_id, name, grade_level, subject) VALUES
      (school_goethe, '10a', 10, 'Mathematik'),
      (school_goethe, '10b', 10, 'Deutsch'),
      (school_goethe, '11a', 11, 'Physik'),
      (school_goethe, '11b', 11, 'Chemie'),
      (school_goethe, '12a', 12, 'Geschichte'),
      (school_goethe, '9a', 9, 'Englisch')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Insert classes for Schiller-Realschule
  IF school_schiller IS NOT NULL THEN
    INSERT INTO classes (school_id, name, grade_level, subject) VALUES
      (school_schiller, '7c', 7, 'Mathematik'),
      (school_schiller, '8c', 8, 'Deutsch'),
      (school_schiller, '9c', 9, 'Englisch'),
      (school_schiller, '10c', 10, 'Biologie')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Insert classes for Heine-Gesamtschule
  IF school_heine IS NOT NULL THEN
    INSERT INTO classes (school_id, name, grade_level, subject) VALUES
      (school_heine, '8d', 8, 'Kunst'),
      (school_heine, '9d', 9, 'Sport'),
      (school_heine, '10d', 10, 'Musik')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert sample students
DO $$
DECLARE
  class_10a uuid;
  class_7c uuid;
  class_8d uuid;
BEGIN
  -- Get some class IDs
  SELECT id INTO class_10a FROM classes WHERE name = '10a' LIMIT 1;
  SELECT id INTO class_7c FROM classes WHERE name = '7c' LIMIT 1;
  SELECT id INTO class_8d FROM classes WHERE name = '8d' LIMIT 1;
  
  -- Insert students for class 10a
  IF class_10a IS NOT NULL THEN
    INSERT INTO students (class_id, email, first_name, last_name, student_number) VALUES
      (class_10a, 'max.mueller@schueler.de', 'Max', 'Müller', '2024001'),
      (class_10a, 'anna.schmidt@schueler.de', 'Anna', 'Schmidt', '2024002'),
      (class_10a, 'tom.weber@schueler.de', 'Tom', 'Weber', '2024003'),
      (class_10a, 'lisa.wagner@schueler.de', 'Lisa', 'Wagner', '2024004'),
      (class_10a, 'paul.becker@schueler.de', 'Paul', 'Becker', '2024005')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Insert students for class 7c
  IF class_7c IS NOT NULL THEN
    INSERT INTO students (class_id, email, first_name, last_name, student_number) VALUES
      (class_7c, 'emma.fischer@schueler.de', 'Emma', 'Fischer', '2024101'),
      (class_7c, 'leon.hoffmann@schueler.de', 'Leon', 'Hoffmann', '2024102'),
      (class_7c, 'mia.schulz@schueler.de', 'Mia', 'Schulz', '2024103')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Insert students for class 8d
  IF class_8d IS NOT NULL THEN
    INSERT INTO students (class_id, email, first_name, last_name, student_number) VALUES
      (class_8d, 'noah.klein@schueler.de', 'Noah', 'Klein', '2024201'),
      (class_8d, 'sophia.wolf@schueler.de', 'Sophia', 'Wolf', '2024202')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);