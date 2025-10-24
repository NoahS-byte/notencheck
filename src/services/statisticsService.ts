import { supabase } from '../lib/supabase';

export interface UserStatistics {
  totalProfiles: number;
  totalNotes: number;
  averageGrade: number;
  bestGrade: number;
  worstGrade: number;
  activeDays: number;
  longestStreak: number;
  lastActivity: string | null;
  gradeDistribution: Array<{ grade: string; count: number }>;
  todoStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  notesByCategory: Array<{ category: string; count: number }>;
  activityOverTime: Array<{
    date: string;
    profilesCreated: number;
    todosCompleted: number;
    notesCreated: number;
  }>;
}

export class StatisticsService {
  static async getUserStatistics(
    userId: string,
    timeRange: 'week' | 'month' | 'year'
  ): Promise<UserStatistics> {
    try {
      // Calculate date range
      const now = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch all user data
      const [profilesResult, todosResult, notesResult] = await Promise.all([
        supabase
          .from('grade_profiles')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString()),

        supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString()),

        supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString()),
      ]);

      const profiles = profilesResult.data || [];
      const todos = todosResult.data || [];
      const notes = notesResult.data || [];

      // Calculate grade statistics
      const allGrades: number[] = [];
      profiles.forEach((profile) => {
        if (profile.main_tasks) {
          profile.main_tasks.forEach((task: any) => {
            if (task.notenpunkte && task.notenpunkte > 0) {
              allGrades.push(task.notenpunkte);
            }
          });
        }
      });

      const averageGrade =
        allGrades.length > 0
          ? allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length
          : 0;
      const bestGrade = allGrades.length > 0 ? Math.max(...allGrades) : 0;
      const worstGrade = allGrades.length > 0 ? Math.min(...allGrades) : 0;

      // Grade distribution
      const gradeDistribution = this.calculateGradeDistribution(allGrades);

      // Todo statistics
      const completedTodos = todos.filter((todo) => todo.completed);
      const overdueTodos = todos.filter(
        (todo) =>
          !todo.completed &&
          todo.due_date &&
          new Date(todo.due_date) < new Date()
      );

      const todoStats = {
        total: todos.length,
        completed: completedTodos.length,
        pending: todos.length - completedTodos.length,
        overdue: overdueTodos.length,
      };

      // Notes by category
      const notesByCategory = this.calculateNotesByCategory(notes);

      // Activity over time
      const activityOverTime = this.calculateActivityOverTime(
        profiles,
        todos,
        notes,
        timeRange
      );

      // Calculate active days and streak
      const activeDays = this.calculateActiveDays(profiles, todos, notes);
      const longestStreak = this.calculateLongestStreak(profiles, todos, notes);

      // Last activity
      const allActivities = [
        ...profiles.map((p) => p.updated_at),
        ...todos.map((t) => t.updated_at || t.created_at),
        ...notes.map((n) => n.updated_at),
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const lastActivity = allActivities.length > 0 ? allActivities[0] : null;

      return {
        totalProfiles: profiles.length,
        totalNotes: notes.length,
        averageGrade,
        bestGrade,
        worstGrade,
        activeDays,
        longestStreak,
        lastActivity,
        gradeDistribution,
        todoStats,
        notesByCategory,
        activityOverTime,
      };
    } catch (error) {
      console.error('Get user statistics error:', error);
      throw error;
    }
  }

  private static calculateGradeDistribution(
    grades: number[]
  ): Array<{ grade: string; count: number }> {
    const distribution: { [key: string]: number } = {};

    grades.forEach((grade) => {
      const roundedGrade = Math.round(grade).toString();
      distribution[roundedGrade] = (distribution[roundedGrade] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => parseInt(b.grade) - parseInt(a.grade));
  }

  private static calculateNotesByCategory(
    notes: any[]
  ): Array<{ category: string; count: number }> {
    const categoryCount: { [key: string]: number } = {};

    notes.forEach((note) => {
      const category = note.category || 'Allgemein';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateActivityOverTime(
    profiles: any[],
    todos: any[],
    notes: any[],
    timeRange: 'week' | 'month' | 'year'
  ): Array<{
    date: string;
    profilesCreated: number;
    todosCompleted: number;
    notesCreated: number;
  }> {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const activity: {
      [key: string]: {
        profilesCreated: number;
        todosCompleted: number;
        notesCreated: number;
      };
    } = {};

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      activity[dateKey] = {
        profilesCreated: 0,
        todosCompleted: 0,
        notesCreated: 0,
      };
    }

    // Count profiles
    profiles.forEach((profile) => {
      const dateKey = profile.created_at.split('T')[0];
      if (activity[dateKey]) {
        activity[dateKey].profilesCreated++;
      }
    });

    // Count completed todos
    todos
      .filter((todo) => todo.completed && todo.completed_at)
      .forEach((todo) => {
        const dateKey = todo.completed_at.split('T')[0];
        if (activity[dateKey]) {
          activity[dateKey].todosCompleted++;
        }
      });

    // Count notes
    notes.forEach((note) => {
      const dateKey = note.created_at.split('T')[0];
      if (activity[dateKey]) {
        activity[dateKey].notesCreated++;
      }
    });

    return Object.entries(activity)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private static calculateActiveDays(
    profiles: any[],
    todos: any[],
    notes: any[]
  ): number {
    const activeDates = new Set<string>();

    profiles.forEach((profile) => {
      activeDates.add(profile.created_at.split('T')[0]);
      if (profile.updated_at !== profile.created_at) {
        activeDates.add(profile.updated_at.split('T')[0]);
      }
    });

    todos.forEach((todo) => {
      activeDates.add(todo.created_at.split('T')[0]);
      if (todo.completed_at) {
        activeDates.add(todo.completed_at.split('T')[0]);
      }
    });

    notes.forEach((note) => {
      activeDates.add(note.created_at.split('T')[0]);
      if (note.updated_at !== note.created_at) {
        activeDates.add(note.updated_at.split('T')[0]);
      }
    });

    return activeDates.size;
  }

  private static calculateLongestStreak(
    profiles: any[],
    todos: any[],
    notes: any[]
  ): number {
    const activeDates = new Set<string>();

    // Collect all activity dates
    profiles.forEach((profile) => {
      activeDates.add(profile.created_at.split('T')[0]);
      if (profile.updated_at !== profile.created_at) {
        activeDates.add(profile.updated_at.split('T')[0]);
      }
    });

    todos.forEach((todo) => {
      activeDates.add(todo.created_at.split('T')[0]);
      if (todo.completed_at) {
        activeDates.add(todo.completed_at.split('T')[0]);
      }
    });

    notes.forEach((note) => {
      activeDates.add(note.created_at.split('T')[0]);
      if (note.updated_at !== note.created_at) {
        activeDates.add(note.updated_at.split('T')[0]);
      }
    });

    // Convert to sorted array
    const sortedDates = Array.from(activeDates).sort();

    if (sortedDates.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currentDate = new Date(sortedDates[i]);
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  static exportStatistics(stats: UserStatistics, timeRange: string): void {
    const exportData = {
      statistics: stats,
      timeRange,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiken-${timeRange}-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
