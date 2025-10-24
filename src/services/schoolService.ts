import { supabase } from '../lib/supabase';

export interface School {
  id: string;
  name: string;
  address?: string;
  contactEmail?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel?: number;
  subject?: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
  school?: School;
  teacher?: {
    id: string;
    displayName?: string;
    email: string;
  };
  studentCount?: number;
}

export interface SchoolStudent {
  id: string;
  classId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  studentNumber?: string;
  createdAt: string;
  updatedAt: string;
  class?: SchoolClass;
}

// Neue Interfaces für Lehrer-Schule-Zuordnung
export interface TeacherSchoolAssignment {
  id: string;
  teacherId: string;
  schoolId: string;
  role: 'teacher' | 'head_teacher' | 'subject_teacher' | 'school_manager';
  subject?: string;
  isActive: boolean;
  assignedBy?: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    displayName?: string;
    email: string;
    phone?: string;
  };
  school?: School;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: string;
  isAdmin: boolean;
  isSchoolManager: boolean;
  lastLogin?: string;
  createdAt: string;
}

export class SchoolService {
  // SCHOOLS
  static async getSchools(userId: string): Promise<School[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        return [];
      }

      return (data || []).map((school) => ({
        id: school.id,
        name: school.name,
        address: school.address,
        contactEmail: school.contact_email,
        managerId: school.manager_id,
        createdAt: school.created_at,
        updatedAt: school.updated_at,
      }));
    } catch (error) {
      console.error('Unexpected error in getSchools:', error);
      return [];
    }
  }

  static async createSchool(
    userId: string,
    name: string,
    address?: string,
    contactEmail?: string
  ): Promise<School> {
    try {
      console.log('🔍 DEBUG createSchool started:', {
        userId,
        name,
        address,
        contactEmail,
      });

      if (!name.trim()) {
        throw new Error('Schulname ist erforderlich');
      }

      // 1. Aktuellen Benutzer prüfen
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log('🔍 DEBUG Current auth user:', { user, userError });

      // 2. School data mit manager_id
      const schoolData = {
        name: name.trim(),
        address: address?.trim() || null,
        contact_email: contactEmail?.trim() || null,
        manager_id: userId, // WICHTIG: manager_id setzen
      };

      console.log('🔍 DEBUG School data with manager_id:', schoolData);

      // 3. Insert
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        throw new Error(`Fehler beim Erstellen der Schule: ${error.message}`);
      }

      console.log('✅ School created successfully:', data);
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        contactEmail: data.contact_email,
        managerId: data.manager_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('💥 Error in createSchool:', error);
      throw error;
    }
  }

  static async updateSchool(
    id: string,
    updates: Partial<School>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: updates.name?.trim(),
          address: updates.address?.trim() || null,
          contact_email: updates.contactEmail?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating school:', error);
        throw new Error(
          'Fehler beim Aktualisieren der Schule: ' + error.message
        );
      }
    } catch (error) {
      console.error('Error in updateSchool:', error);
      throw error;
    }
  }

  static async deleteSchool(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('schools').delete().eq('id', id);

      if (error) {
        console.error('Error deleting school:', error);
        throw new Error('Fehler beim Löschen der Schule: ' + error.message);
      }
    } catch (error) {
      console.error('Error in deleteSchool:', error);
      throw error;
    }
  }

  // CLASSES
  static async getClasses(
    userId: string,
    schoolId?: string
  ): Promise<SchoolClass[]> {
    try {
      let query = supabase
        .from('classes')
        .select(
          `
          *,
          schools (
            id,
            name,
            address,
            contact_email,
            created_at,
            updated_at
          ),
          users (
            id,
            display_name,
            email
          ),
          students (
            id
          )
        `
        )
        .order('name');

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching classes:', error);
        return [];
      }

      return (data || []).map((cls) => ({
        id: cls.id,
        schoolId: cls.school_id,
        name: cls.name,
        gradeLevel: cls.grade_level,
        subject: cls.subject,
        teacherId: cls.teacher_id,
        createdAt: cls.created_at,
        updatedAt: cls.updated_at,
        studentCount: cls.students?.length || 0,
        school: cls.schools
          ? {
              id: cls.schools.id,
              name: cls.schools.name,
              address: cls.schools.address,
              contactEmail: cls.schools.contact_email,
              createdAt: cls.schools.created_at,
              updatedAt: cls.schools.updated_at,
            }
          : undefined,
        teacher: cls.users
          ? {
              id: cls.users.id,
              displayName: cls.users.display_name,
              email: cls.users.email,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Unexpected error in getClasses:', error);
      return [];
    }
  }

  // FEHLENDE METHODE HINZUGEFÜGT
  static async createClass(
    schoolId: string,
    name: string,
    gradeLevel?: number,
    subject?: string,
    teacherId?: string
  ): Promise<SchoolClass> {
    try {
      console.log('🔍 [CREATE CLASS SIMPLE] Starting...', {
        schoolId,
        name,
        gradeLevel,
        subject,
        teacherId,
      });

      // Einfache Validierung
      if (!name.trim()) {
        throw new Error('Klassenname ist erforderlich');
      }

      if (!schoolId) {
        throw new Error('Schul-ID ist erforderlich');
      }

      // Einfacher Insert ohne komplexe Auth-Prüfung
      const classData = {
        name: name.trim(),
        school_id: schoolId,
        grade_level: gradeLevel || null,
        subject: subject?.trim() || null,
        teacher_id: teacherId || null,
      };

      console.log('🔍 [CREATE CLASS SIMPLE] Insert data:', classData);

      // Direkter Insert
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select('id, name, school_id')
        .single();

      if (error) {
        console.error('❌ [CREATE CLASS SIMPLE] Insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        throw new Error(`Fehler beim Erstellen der Klasse: ${error.message}`);
      }

      console.log('✅ [CREATE CLASS SIMPLE] Class created:', data);

      // Einfache Rückgabe
      return {
        id: data.id,
        schoolId: data.school_id,
        name: data.name,
        gradeLevel: gradeLevel,
        subject: subject,
        teacherId: teacherId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentCount: 0,
      };
    } catch (error) {
      console.error('💥 [CREATE CLASS SIMPLE] Error:', error);
      throw error;
    }
  }

  static async updateClass(
    id: string,
    updates: Partial<SchoolClass>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: updates.name?.trim(),
          school_id: updates.schoolId,
          grade_level: updates.gradeLevel || null,
          subject: updates.subject?.trim() || null,
          teacher_id: updates.teacherId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating class:', error);
        throw new Error(
          'Fehler beim Aktualisieren der Klasse: ' + error.message
        );
      }
    } catch (error) {
      console.error('Error in updateClass:', error);
      throw error;
    }
  }

  static async deleteClass(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);

      if (error) {
        console.error('Error deleting class:', error);
        throw new Error('Fehler beim Löschen der Klasse: ' + error.message);
      }
    } catch (error) {
      console.error('Error in deleteClass:', error);
      throw error;
    }
  }

  // STUDENTS
  static async getStudents(classId: string): Promise<SchoolStudent[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(
          `
          *,
          classes (
            id,
            name,
            grade_level,
            subject,
            school_id,
            schools (
              id,
              name
            )
          )
        `
        )
        .eq('class_id', classId)
        .order('last_name');

      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }

      return (data || []).map((student) => ({
        id: student.id,
        classId: student.class_id,
        email: student.email,
        firstName: student.first_name,
        lastName: student.last_name,
        studentNumber: student.student_number,
        createdAt: student.created_at,
        updatedAt: student.updated_at,
        class: student.classes
          ? {
              id: student.classes.id,
              schoolId: student.classes.school_id,
              name: student.classes.name,
              gradeLevel: student.classes.grade_level,
              subject: student.classes.subject,
              createdAt: student.classes.created_at,
              updatedAt: student.classes.updated_at,
              school: student.classes.schools
                ? ({
                    id: student.classes.schools.id,
                    name: student.classes.schools.name,
                  } as School)
                : undefined,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Unexpected error in getStudents:', error);
      return [];
    }
  }

  static async createStudent(
    classId: string,
    email: string,
    firstName?: string,
    lastName?: string,
    studentNumber?: string
  ): Promise<SchoolStudent> {
    try {
      console.log('🔍 [CREATE STUDENT] Starting...', {
        classId,
        email,
        firstName,
        lastName,
        studentNumber,
      });

      if (!email.trim()) {
        throw new Error('E-Mail ist erforderlich');
      }

      if (!classId) {
        throw new Error('Klasse ist erforderlich');
      }

      const studentData = {
        class_id: classId,
        email: email.trim(),
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        student_number: studentNumber?.trim() || null,
      };

      console.log('🔍 [CREATE STUDENT] Insert data:', studentData);

      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select(
          `
          *,
          classes (
            id,
            name,
            grade_level,
            subject,
            school_id,
            schools (
              id,
              name
            )
          )
        `
        )
        .single();

      if (error) {
        console.error('Error creating student:', error);
        throw new Error('Fehler beim Erstellen des Schülers: ' + error.message);
      }

      console.log('✅ [CREATE STUDENT] Student created successfully:', data);

      return {
        id: data.id,
        classId: data.class_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        studentNumber: data.student_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        class: data.classes
          ? {
              id: data.classes.id,
              schoolId: data.classes.school_id,
              name: data.classes.name,
              gradeLevel: data.classes.grade_level,
              subject: data.classes.subject,
              createdAt: data.classes.created_at,
              updatedAt: data.classes.updated_at,
              school: data.classes.schools
                ? ({
                    id: data.classes.schools.id,
                    name: data.classes.schools.name,
                  } as School)
                : undefined,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  static async bulkCreateStudents(
    classId: string,
    inputData: string
  ): Promise<SchoolStudent[]> {
    try {
      console.log('🔍 [BULK CREATE STUDENTS] Starting...', {
        classId,
        inputData,
      });

      if (!classId) {
        throw new Error('Klasse ist erforderlich');
      }

      if (!inputData || inputData.trim().length === 0) {
        throw new Error('Eingabedaten sind erforderlich');
      }

      // Parse das Eingabeformat
      const studentsData = this.parseBulkInput(inputData);

      console.log('🔍 [BULK CREATE STUDENTS] Parsed data:', studentsData);

      if (studentsData.length === 0) {
        throw new Error('Keine gültigen Schülerdaten gefunden');
      }

      // Transformiere Daten für Supabase
      const supabaseData = studentsData.map((student) => ({
        class_id: classId,
        email: student.email.trim(),
        first_name: student.firstName?.trim() || null,
        last_name: student.lastName?.trim() || null,
        student_number: student.studentNumber?.trim() || null,
      }));

      console.log('🔍 [BULK CREATE STUDENTS] Supabase data:', supabaseData);

      // Insert in die Datenbank
      const { data, error } = await supabase
        .from('students')
        .insert(supabaseData)
        .select(
          `
          *,
          classes (
            id,
            name,
            grade_level,
            subject,
            school_id,
            schools (
              id,
              name
            )
          )
        `
        );

      if (error) {
        console.error('❌ [BULK CREATE STUDENTS] Insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        throw new Error(
          `Fehler beim Massenimport der Schüler: ${error.message}`
        );
      }

      console.log(
        '✅ [BULK CREATE STUDENTS] Students created successfully:',
        data
      );

      return (data || []).map((student) => ({
        id: student.id,
        classId: student.class_id,
        email: student.email,
        firstName: student.first_name,
        lastName: student.last_name,
        studentNumber: student.student_number,
        createdAt: student.created_at,
        updatedAt: student.updated_at,
        class: student.classes
          ? {
              id: student.classes.id,
              schoolId: student.classes.school_id,
              name: student.classes.name,
              gradeLevel: student.classes.grade_level,
              subject: student.classes.subject,
              createdAt: student.classes.created_at,
              updatedAt: student.classes.updated_at,
              school: student.classes.schools
                ? ({
                    id: student.classes.schools.id,
                    name: student.classes.schools.name,
                  } as School)
                : undefined,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('💥 [BULK CREATE STUDENTS] Error:', error);
      throw error;
    }
  }

  // Neue Hilfsfunktion zum Parsen des Eingabeformats
  private static parseBulkInput(inputData: string): Array<{
    firstName: string;
    lastName: string;
    email: string;
    studentNumber: string;
  }> {
    const lines = inputData
      .split('\n')
      .filter((line) => line.trim().length > 0);
    const students: Array<{
      firstName: string;
      lastName: string;
      email: string;
      studentNumber: string;
    }> = [];

    console.log('🔍 [PARSE BULK INPUT] Raw lines:', lines);

    for (const line of lines) {
      try {
        // Entferne das "U[" am Anfang und "]" am Ende
        const cleanLine = line.trim();
        if (!cleanLine.startsWith('U[') || !cleanLine.endsWith(']')) {
          console.warn('⚠️ Ungültiges Format in Zeile:', line);
          continue;
        }

        // Extrahiere den Inhalt innerhalb der Klammern
        const content = cleanLine.substring(2, cleanLine.length - 1);

        // Teile an den Semikolons auf, aber ignoriere Semikolons in Klammern
        const parts: string[] = [];
        let currentPart = '';
        let inParentheses = 0;

        for (const char of content) {
          if (char === '(') {
            inParentheses++;
            currentPart += char;
          } else if (char === ')') {
            inParentheses--;
            currentPart += char;
          } else if (char === ';' && inParentheses === 0) {
            parts.push(currentPart.trim());
            currentPart = '';
          } else {
            currentPart += char;
          }
        }

        // Füge den letzten Teil hinzu
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
        }

        console.log('🔍 [PARSE BULK INPUT] Parsed parts:', parts);

        // Überprüfe ob wir genau 4 Teile haben
        if (parts.length !== 4) {
          console.warn(
            '⚠️ Ungültige Anzahl von Teilen in Zeile:',
            line,
            'Teile:',
            parts
          );
          continue;
        }

        // Extrahiere Werte aus den Klammern
        const firstName = this.extractValueFromParentheses(parts[0]);
        const lastName = this.extractValueFromParentheses(parts[1]);
        const email = this.extractValueFromParentheses(parts[2]);
        const studentNumber = this.extractValueFromParentheses(parts[3]);

        console.log('🔍 [PARSE BULK INPUT] Extracted values:', {
          firstName,
          lastName,
          email,
          studentNumber,
        });

        // Validiere erforderliche Felder
        if (!firstName || !lastName || !email) {
          console.warn('⚠️ Fehlende erforderliche Felder in Zeile:', line);
          continue;
        }

        // Validiere E-Mail Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.warn('⚠️ Ungültiges E-Mail-Format in Zeile:', line);
          continue;
        }

        students.push({
          firstName,
          lastName,
          email,
          studentNumber: studentNumber || '',
        });
      } catch (error) {
        console.error('💥 Fehler beim Parsen der Zeile:', line, error);
        continue;
      }
    }

    console.log('✅ [PARSE BULK INPUT] Final parsed students:', students);
    return students;
  }

  // Hilfsfunktion zum Extrahieren von Werten aus Klammern
  private static extractValueFromParentheses(text: string): string {
    const trimmed = text.trim();

    // Überprüfe ob der Text mit Klammern umschlossen ist
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      return trimmed.substring(1, trimmed.length - 1).trim();
    }

    // Falls keine Klammern, gebe den originalen Text zurück
    return trimmed;
  }

  static async updateStudent(
    id: string,
    updates: Partial<SchoolStudent>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          class_id: updates.classId,
          email: updates.email?.trim(),
          first_name: updates.firstName?.trim() || null,
          last_name: updates.lastName?.trim() || null,
          student_number: updates.studentNumber?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating student:', error);
        throw new Error(
          'Fehler beim Aktualisieren des Schülers: ' + error.message
        );
      }
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  }

  static async deleteStudent(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        throw new Error('Fehler beim Löschen des Schülers: ' + error.message);
      }
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  }

  // UTILITY METHODS
  static async getTeachers(): Promise<
    Array<{ id: string; displayName?: string; email: string }>
  > {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email')
        .order('display_name');

      if (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }

      return (data || []).map((user) => ({
        id: user.id,
        displayName: user.display_name,
        email: user.email,
      }));
    } catch (error) {
      console.error('Unexpected error in getTeachers:', error);
      return [];
    }
  }

  static async exportClassData(classId: string): Promise<any> {
    try {
      const [classData, studentsData] = await Promise.all([
        supabase
          .from('classes')
          .select(
            `
            *,
            schools (*),
            users (*)
          `
          )
          .eq('id', classId)
          .single(),
        this.getStudents(classId),
      ]);

      if (classData.error) {
        throw new Error('Fehler beim Laden der Klassendaten');
      }

      return {
        class: {
          id: classData.data.id,
          name: classData.data.name,
          gradeLevel: classData.data.grade_level,
          subject: classData.data.subject,
          school: classData.data.schools,
          teacher: classData.data.users,
        },
        students: studentsData,
        exportDate: new Date().toISOString(),
        totalStudents: studentsData.length,
      };
    } catch (error) {
      console.error('Error exporting class data:', error);
      throw error;
    }
  }

  // NEUE METHODEN FÜR LEHRER-SCHULE-ZUORDNUNG
  static async getTeacherSchoolAssignments(
    schoolId?: string
  ): Promise<TeacherSchoolAssignment[]> {
    try {
      let query = supabase
        .from('teacher_schools')
        .select(`
          *,
          teacher:teacher_id (
            id,
            display_name,
            email,
            phone
          ),
          school:school_id (
            id,
            name,
            address,
            contact_email,
            manager_id,
            created_at,
            updated_at
          ),
          assigned_by_user:assigned_by (
            id,
            display_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
  
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
  
      const { data, error } = await query;
  
      if (error) {
        console.error('Error fetching teacher school assignments:', error);
        return [];
      }
  
      return (data || []).map((assignment) => ({
        id: assignment.id,
        teacherId: assignment.teacher_id,
        schoolId: assignment.school_id,
        role: assignment.role,
        subject: assignment.subject,
        isActive: assignment.is_active,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.assigned_at,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        teacher: assignment.teacher
          ? {
              id: assignment.teacher.id,
              displayName: assignment.teacher.display_name,
              email: assignment.teacher.email,
              phone: assignment.teacher.phone,
            }
          : undefined,
        school: assignment.school
          ? {
              id: assignment.school.id,
              name: assignment.school.name,
              address: assignment.school.address,
              contactEmail: assignment.school.contact_email,
              managerId: assignment.school.manager_id,
              createdAt: assignment.school.created_at,
              updatedAt: assignment.school.updated_at,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Unexpected error in getTeacherSchoolAssignments:', error);
      return [];
    }
  }

  static async assignTeacherToSchool(
    teacherId: string,
    schoolId: string,
    role:
      | 'teacher'
      | 'head_teacher'
      | 'subject_teacher'
      | 'school_manager' = 'teacher',
    subject?: string,
    assignedBy?: string
  ): Promise<TeacherSchoolAssignment> {
    try {
      console.log('🔍 [ASSIGN TEACHER TO SCHOOL] Starting...', {
        teacherId,
        schoolId,
        role,
        subject,
        assignedBy,
      });
  
      // Validierung
      if (!teacherId || !schoolId) {
        throw new Error('Lehrer-ID und Schul-ID sind erforderlich');
      }
  
      const assignmentData = {
        teacher_id: teacherId,
        school_id: schoolId,
        role: role,
        subject: subject?.trim() || null,
        assigned_by: assignedBy || null,
        is_active: true,
      };
  
      console.log('🔍 [ASSIGN TEACHER TO SCHOOL] Insert data:', assignmentData);
  
      // KORRIGIERT: Explizite Benennung der Beziehungen
      const { data, error } = await supabase
        .from('teacher_schools')
        .insert([assignmentData])
        .select(`
          *,
          teacher:teacher_id (
            id,
            display_name,
            email,
            phone
          ),
          school:school_id (
            id,
            name,
            address,
            contact_email,
            manager_id,
            created_at,
            updated_at
          ),
          assigned_by_user:assigned_by (
            id,
            display_name,
            email
          )
        `)
        .single();
  
      if (error) {
        console.error('❌ [ASSIGN TEACHER TO SCHOOL] Insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
  
        // Spezifische Fehlerbehandlung für Duplikate
        if (error.code === '23505') {
          throw new Error('Dieser Lehrer ist bereits dieser Schule zugeordnet');
        }
  
        throw new Error(`Fehler beim Zuweisen des Lehrers: ${error.message}`);
      }
  
      console.log('✅ [ASSIGN TEACHER TO SCHOOL] Assignment created:', data);
  
      return {
        id: data.id,
        teacherId: data.teacher_id,
        schoolId: data.school_id,
        role: data.role,
        subject: data.subject,
        isActive: data.is_active,
        assignedBy: data.assigned_by,
        assignedAt: data.assigned_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        teacher: data.teacher
          ? {
              id: data.teacher.id,
              displayName: data.teacher.display_name,
              email: data.teacher.email,
              phone: data.teacher.phone,
            }
          : undefined,
        school: data.school
          ? {
              id: data.school.id,
              name: data.school.name,
              address: data.school.address,
              contactEmail: data.school.contact_email,
              managerId: data.school.manager_id,
              createdAt: data.school.created_at,
              updatedAt: data.school.updated_at,
            }
          : undefined,
      };
    } catch (error) {
      console.error('💥 [ASSIGN TEACHER TO SCHOOL] Error:', error);
      throw error;
    }
  }

  static async updateTeacherSchoolAssignment(
    assignmentId: string,
    updates: {
      role?: 'teacher' | 'head_teacher' | 'subject_teacher' | 'school_manager';
      subject?: string;
      isActive?: boolean;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('teacher_schools')
        .update({
          role: updates.role,
          subject: updates.subject?.trim() || null,
          is_active: updates.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (error) {
        console.error('Error updating teacher school assignment:', error);
        throw new Error(
          'Fehler beim Aktualisieren der Lehrer-Zuordnung: ' + error.message
        );
      }
    } catch (error) {
      console.error('Error in updateTeacherSchoolAssignment:', error);
      throw error;
    }
  }

  static async removeTeacherFromSchool(assignmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('teacher_schools')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        console.error('Error removing teacher from school:', error);
        throw new Error(
          'Fehler beim Entfernen des Lehrers von der Schule: ' + error.message
        );
      }
    } catch (error) {
      console.error('Error in removeTeacherFromSchool:', error);
      throw error;
    }
  }

  static async getTeachersBySchool(schoolId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('teacher_schools')
        .select(
          `
          users (
            id,
            email,
            display_name,
            phone,
            is_admin,
            is_school_manager,
            last_login,
            created_at
          )
        `
        )
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching teachers by school:', error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.users.id,
        email: item.users.email,
        displayName: item.users.display_name,
        phone: item.users.phone,
        role: item.users.is_admin
          ? 'admin'
          : item.users.is_school_manager
          ? 'school_manager'
          : 'teacher',
        isAdmin: item.users.is_admin,
        isSchoolManager: item.users.is_school_manager,
        lastLogin: item.users.last_login,
        createdAt: item.users.created_at,
      }));
    } catch (error) {
      console.error('Unexpected error in getTeachersBySchool:', error);
      return [];
    }
  }

  static async getSchoolsByTeacher(teacherId: string): Promise<School[]> {
    try {
      const { data, error } = await supabase
        .from('teacher_schools')
        .select(
          `
          schools (
            id,
            name,
            address,
            contact_email,
            manager_id,
            created_at,
            updated_at
          )
        `
        )
        .eq('teacher_id', teacherId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching schools by teacher:', error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.schools.id,
        name: item.schools.name,
        address: item.schools.address,
        contactEmail: item.schools.contact_email,
        managerId: item.schools.manager_id,
        createdAt: item.schools.created_at,
        updatedAt: item.schools.updated_at,
      }));
    } catch (error) {
      console.error('Unexpected error in getSchoolsByTeacher:', error);
      return [];
    }
  }

  // ERWEITERTE USER-METHODEN FÜR ADMIN PANEL
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
        return [];
      }

      return (data || []).map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        phone: user.phone,
        role: user.is_admin
          ? 'admin'
          : user.is_school_manager
          ? 'school_manager'
          : 'teacher',
        isAdmin: user.is_admin,
        isSchoolManager: user.is_school_manager,
        lastLogin: user.last_login,
        createdAt: user.created_at,
      }));
    } catch (error) {
      console.error('Unexpected error in getAllUsers:', error);
      return [];
    }
  }

  static async updateUserRole(
    userId: string,
    updates: {
      isAdmin?: boolean;
      isSchoolManager?: boolean;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_admin: updates.isAdmin,
          is_school_manager: updates.isSchoolManager,
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw new Error(
          'Fehler beim Aktualisieren der Benutzerrolle: ' + error.message
        );
      }
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  }
}
