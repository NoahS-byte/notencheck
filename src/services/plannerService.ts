import { supabase } from '../lib/supabase';

export interface School {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level?: number;
  subject?: string;
  teacher_id?: string;
  school?: School;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber?: string;
  class_id: string;
}

export interface PlannerEvent {
  id: string;
  title: string;
  type: 'Klausur' | 'Klassenarbeit' | 'Leistungskontrolle' | 'Hausaufgabe' | 'Selbstarbeit';
  description?: string;
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate?: string;
  location?: string;
  teacher_id: string;
  classes?: Class[];
}

export class PlannerService {
  static async getClasses(teacherId: string): Promise<Class[]> {
    try {
      // Direct query without schools relationship to avoid RLS issues
      const { data: classes, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          grade_level,
          subject,
          teacher_id
        `)
        .eq('teacher_id', teacherId)
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        return [];
      }

      return (classes || []).map(cls => ({
        id: cls.id,
        name: cls.name,
        grade_level: cls.grade_level,
        subject: cls.subject,
        teacher_id: cls.teacher_id
      }));
    } catch (error) {
      console.error('Unexpected error in getClasses:', error);
      return [];
    }
  }

  static async createClass(
    teacherId: string,
    name: string,
    subject?: string,
    gradeLevel?: number
  ): Promise<Class> {
    try {
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert([{
          name,
          subject,
          grade_level: gradeLevel,
          teacher_id: teacherId
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: newClass.id,
        name: newClass.name,
        grade_level: newClass.grade_level,
        subject: newClass.subject,
        teacher_id: newClass.teacher_id
      };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  static async getStudents(classId: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('last_name');

      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }

      return (data || []).map(student => ({
        id: student.id,
        firstName: student.first_name || '',
        lastName: student.last_name || '',
        email: student.email,
        studentNumber: student.student_number,
        class_id: student.class_id
      }));
    } catch (error) {
      console.error('Unexpected error in getStudents:', error);
      return [];
    }
  }

  static async getEvents(teacherId: string): Promise<PlannerEvent[]> {
    try {
      // Simple query for events
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return (events || []).map(e => ({
        id: e.id,
        title: e.title,
        type: e.type,
        description: e.description,
        priority: e.priority,
        startDate: e.start_date,
        endDate: e.end_date,
        location: e.location,
        teacher_id: e.teacher_id,
        classes: [] // Will be loaded separately if needed
      }));
    } catch (error) {
      console.error('Unexpected error in getEvents:', error);
      return [];
    }
  }

  static async createEvent(
    teacherId: string,
    title: string,
    type: PlannerEvent['type'],
    startDate: string,
    classIds: string[],
    description?: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    endDate?: string,
    location?: string
  ) {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .insert([{ 
          teacher_id: teacherId, 
          title, 
          type, 
          start_date: startDate, 
          end_date: endDate, 
          description, 
          priority, 
          location 
        }])
        .select()
        .single();

      if (error) throw error;

      if (classIds.length > 0) {
        const { error: classError } = await supabase
          .from('event_classes')
          .insert(classIds.map(class_id => ({ event_id: event.id, class_id })));
        if (classError) {
          console.error('Error linking classes to event:', classError);
          // Don't throw - event was created successfully
        }
      }

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async deleteEvent(eventId: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Helper methods for iCal functionality
  static async generateICalFeed(classId: string): Promise<string> {
    try {
      // Get events for this class
      const { data: eventClasses, error } = await supabase
        .from('event_classes')
        .select(`
          event_id,
          events (*)
        `)
        .eq('class_id', classId);

      if (error) {
        console.error('Error fetching events for iCal:', error);
        return this.generateEmptyICalFeed();
      }

      const events = eventClasses?.map(ec => ec.events).filter(Boolean) || [];
      
      let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Notenrechner//Schulplaner//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      events.forEach((event: any) => {
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 60 * 60 * 1000);
        
        icalContent.push(
          'BEGIN:VEVENT',
          `UID:${event.id}@notenrechner.app`,
          `DTSTART:${this.formatICalDate(startDate)}`,
          `DTEND:${this.formatICalDate(endDate)}`,
          `SUMMARY:${event.title}`,
          `DESCRIPTION:${event.description || ''}`,
          `LOCATION:${event.location || ''}`,
          `PRIORITY:${event.priority === 'high' ? '1' : event.priority === 'medium' ? '5' : '9'}`,
          'END:VEVENT'
        );
      });

      icalContent.push('END:VCALENDAR');
      return icalContent.join('\r\n');
    } catch (error) {
      console.error('Error generating iCal feed:', error);
      return this.generateEmptyICalFeed();
    }
  }

  static generateEmptyICalFeed(): string {
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Notenrechner//Schulplaner//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  static formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  static getICalFeedUrl(classId: string): string {
    return `${window.location.origin}/api/ical/${classId}`;
  }
}