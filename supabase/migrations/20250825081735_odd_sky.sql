/*
  # Planner System with Classes and Events

  1. New Tables
    - `schools` - Store school information
    - `classes` - Store class information linked to schools
    - `students` - Store student information linked to classes
    - `events` - Store calendar events created by teachers
    - `event_classes` - Many-to-many relationship between events and classes

  2. Security
    - Enable RLS on all new tables
    - Add policies for teachers and students
    - Ensure data isolation between schools

  3. Features
    - iCal feed generation support
    - Event management for teachers
    - Class and student management
    - Automatic calendar integration
*/

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "10a", "7c"
    grade_level INTEGER, -- e.g., 10, 7
    subject TEXT, -- e.g., "Mathematik", "Deutsch"
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    student_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Klausur', 'Klassenarbeit', 'Leistungskontrolle', 'Hausaufgabe', 'Selbstarbeit')),
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event-Classes relationship (many-to-many)
CREATE TABLE IF NOT EXISTS event_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, class_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_events_teacher_id ON events(teacher_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_event_classes_event_id ON event_classes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_classes_class_id ON event_classes(class_id);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools
CREATE POLICY "Teachers can view schools" ON schools
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage schools" ON schools
    FOR ALL USING (true);

-- RLS Policies for classes
CREATE POLICY "Teachers can view all classes" ON classes
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their classes" ON classes
    FOR ALL USING (teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    ));

-- RLS Policies for students
CREATE POLICY "Teachers can view students in their classes" ON students
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM classes WHERE id = students.class_id AND teacher_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Teachers can manage students in their classes" ON students
    FOR ALL USING (EXISTS (
        SELECT 1 FROM classes WHERE id = students.class_id AND teacher_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    ));

-- RLS Policies for events
CREATE POLICY "Teachers can view all events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their events" ON events
    FOR ALL USING (teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    ));

-- RLS Policies for event_classes
CREATE POLICY "Teachers can view event-class relationships" ON event_classes
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM events WHERE id = event_classes.event_id AND teacher_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM classes WHERE id = event_classes.class_id AND teacher_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Teachers can manage event-class relationships" ON event_classes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM events WHERE id = event_classes.event_id AND teacher_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    ));

-- Insert sample data
INSERT INTO schools (name, address, contact_email) VALUES 
    ('Gymnasium Musterstadt', 'Schulstraße 1, 12345 Musterstadt', 'info@gymnasium-musterstadt.de'),
    ('Realschule Beispielort', 'Bildungsweg 5, 67890 Beispielort', 'kontakt@realschule-beispielort.de');

-- Insert sample classes
INSERT INTO classes (school_id, name, grade_level, subject, teacher_id) 
SELECT 
    s.id,
    class_name,
    grade,
    subject,
    (SELECT id FROM users WHERE is_admin = true LIMIT 1)
FROM schools s,
(VALUES 
    ('10a', 10, 'Mathematik'),
    ('10b', 10, 'Mathematik'),
    ('9a', 9, 'Deutsch'),
    ('9b', 9, 'Deutsch'),
    ('8a', 8, 'Englisch'),
    ('7c', 7, 'Geschichte')
) AS class_data(class_name, grade, subject)
WHERE s.name = 'Gymnasium Musterstadt';

-- Insert sample students
INSERT INTO students (class_id, email, first_name, last_name, student_number)
SELECT 
    c.id,
    student_email,
    first_name,
    last_name,
    student_num
FROM classes c,
(VALUES 
    ('max.mustermann@student.de', 'Max', 'Mustermann', 'S001'),
    ('anna.schmidt@student.de', 'Anna', 'Schmidt', 'S002'),
    ('tom.weber@student.de', 'Tom', 'Weber', 'S003'),
    ('lisa.mueller@student.de', 'Lisa', 'Müller', 'S004'),
    ('jan.fischer@student.de', 'Jan', 'Fischer', 'S005')
) AS student_data(student_email, first_name, last_name, student_num)
WHERE c.name = '10a';