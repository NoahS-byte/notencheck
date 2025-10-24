import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Clock,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  StatisticsService,
  UserStatistics,
} from '../services/statisticsService';

interface StatisticsViewProps {
  currentUserId: string;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ currentUserId }) => {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>(
    'month'
  );
  const [selectedMetric, setSelectedMetric] = useState<
    'grades' | 'todos' | 'notes' | 'activity'
  >('grades');

  useEffect(() => {
    loadStatistics();
  }, [currentUserId, timeRange]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const statisticsData = await StatisticsService.getUserStatistics(
        currentUserId,
        timeRange
      );
      setStats(statisticsData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = [
    '#1f2937',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
  ];

  const getMetricData = () => {
    if (!stats) return [];

    switch (selectedMetric) {
      case 'grades':
        return stats.gradeDistribution.map((item, index) => ({
          name: `Note ${item.grade}`,
          value: item.count,
          fill: COLORS[index % COLORS.length],
        }));
      case 'todos':
        return [
          {
            name: 'Erledigt',
            value: stats.todoStats.completed,
            fill: '#10b981',
          },
          { name: 'Offen', value: stats.todoStats.pending, fill: '#f59e0b' },
          {
            name: 'Überfällig',
            value: stats.todoStats.overdue,
            fill: '#ef4444',
          },
        ];
      case 'notes':
        return stats.notesByCategory.map((item, index) => ({
          name: item.category,
          value: item.count,
          fill: COLORS[index % COLORS.length],
        }));
      case 'activity':
        return stats.activityOverTime.map((item) => ({
          date: new Date(item.date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
          }),
          profiles: item.profilesCreated,
          todos: item.todosCompleted,
          notes: item.notesCreated,
        }));
      default:
        return [];
    }
  };

  const renderChart = () => {
    const data = getMetricData();

    if (selectedMetric === 'activity') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#374151" fontSize={12} />
            <YAxis stroke="#374151" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '2px solid #1f2937',
                borderRadius: '0',
              }}
            />
            <Line
              type="monotone"
              dataKey="profiles"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Profile"
            />
            <Line
              type="monotone"
              dataKey="todos"
              stroke="#10b981"
              strokeWidth={3}
              name="Todos"
            />
            <Line
              type="monotone"
              dataKey="notes"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Notizen"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '2px solid #1f2937',
              borderRadius: '0',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mr-4" />
          <span className="text-lg font-medium text-gray-700">
            Statistiken werden geladen...
          </span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Keine Statistiken verfügbar</p>
          <p className="text-sm">Verwenden Sie die App, um Daten zu sammeln</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-900">
        <BarChart3 className="h-8 w-8 text-gray-900" />
        <h2 className="text-3xl font-bold text-gray-900">
          Leistungsstatistiken
        </h2>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-900" />
          <span className="font-bold text-gray-900">Zeitraum:</span>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'week', label: 'Woche' },
            { key: 'month', label: 'Monat' },
            { key: 'year', label: 'Jahr' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeRange(option.key as any)}
              className={`px-4 py-2 font-bold transition-colors ${
                timeRange === option.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-8">
          <Target className="h-5 w-5 text-gray-900" />
          <span className="font-bold text-gray-900">Ansicht:</span>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'grades', label: 'Noten', icon: Award },
            { key: 'todos', label: 'Aufgaben', icon: CheckSquare },
            { key: 'notes', label: 'Notizen', icon: BookOpen },
            { key: 'activity', label: 'Aktivität', icon: TrendingUp },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedMetric(option.key as any)}
              className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${
                selectedMetric === option.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border-2 border-blue-200 p-6 text-center">
          <div className="text-3xl font-black text-blue-600">
            {stats.totalProfiles}
          </div>
          <div className="text-sm font-medium text-blue-700">Notenprofile</div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 p-6 text-center">
          <div className="text-3xl font-black text-green-600">
            {stats.averageGrade.toFixed(1)}
          </div>
          <div className="text-sm font-medium text-green-700">
            Ø Notenpunkte
          </div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 p-6 text-center">
          <div className="text-3xl font-black text-purple-600">
            {stats.todoStats.completed}
          </div>
          <div className="text-sm font-medium text-purple-700">
            Erledigte Aufgaben
          </div>
        </div>
        <div className="bg-orange-50 border-2 border-orange-200 p-6 text-center">
          <div className="text-3xl font-black text-orange-600">
            {stats.totalNotes}
          </div>
          <div className="text-sm font-medium text-orange-700">Notizen</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 border-4 border-gray-900 p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {selectedMetric === 'grades' && 'Notenverteilung'}
          {selectedMetric === 'todos' && 'Aufgaben-Status'}
          {selectedMetric === 'notes' && 'Notizen nach Kategorie'}
          {selectedMetric === 'activity' && 'Aktivitätsverlauf'}
        </h3>

        {renderChart()}
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 border-2 border-gray-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-gray-900" />
            <h4 className="text-xl font-bold text-gray-900">Leistungstrend</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Beste Note:</span>
              <span className="font-bold text-green-600">
                {stats.bestGrade} Punkte
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Schlechteste Note:</span>
              <span className="font-bold text-red-600">
                {stats.worstGrade} Punkte
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Verbesserung möglich:</span>
              <span className="font-bold text-blue-600">
                {stats.bestGrade - stats.averageGrade > 0
                  ? `+${(stats.bestGrade - stats.averageGrade).toFixed(
                      1
                    )} Punkte`
                  : 'Bereits optimal'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Produktivitätsrate:</span>
              <span className="font-bold text-purple-600">
                {stats.todoStats.total > 0
                  ? `${Math.round(
                      (stats.todoStats.completed / stats.todoStats.total) * 100
                    )}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-gray-900" />
            <h4 className="text-xl font-bold text-gray-900">
              Aktivitätsübersicht
            </h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Aktive Tage:</span>
              <span className="font-bold text-blue-600">
                {stats.activeDays}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Ø Aktivität/Tag:</span>
              <span className="font-bold text-green-600">
                {stats.activeDays > 0
                  ? `${Math.round(
                      (stats.totalProfiles +
                        stats.todoStats.completed +
                        stats.totalNotes) /
                        stats.activeDays
                    )} Aktionen`
                  : '0 Aktionen'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Längste Serie:</span>
              <span className="font-bold text-purple-600">
                {stats.longestStreak} Tage
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Letzte Aktivität:</span>
              <span className="font-bold text-gray-600">
                {stats.lastActivity
                  ? new Date(stats.lastActivity).toLocaleDateString('de-DE')
                  : 'Keine Daten'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="mt-8 bg-gray-50 border-2 border-gray-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-6 w-6 text-gray-900" />
          <h4 className="text-xl font-bold text-gray-900">
            Erfolge & Meilensteine
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: 'Erste Schritte',
              description: 'Erstes Notenprofil erstellt',
              achieved: stats.totalProfiles > 0,
              icon: '🎯',
            },
            {
              title: 'Fleißiger Schreiber',
              description: '10+ Notizen erstellt',
              achieved: stats.totalNotes >= 10,
              icon: '📝',
            },
            {
              title: 'Aufgaben-Meister',
              description: '50+ Aufgaben erledigt',
              achieved: stats.todoStats.completed >= 50,
              icon: '✅',
            },
            {
              title: 'Konsistenz',
              description: '7 Tage aktiv',
              achieved: stats.longestStreak >= 7,
              icon: '🔥',
            },
            {
              title: 'Spitzenleistung',
              description: 'Durchschnitt über 12 Punkte',
              achieved: stats.averageGrade >= 12,
              icon: '🏆',
            },
            {
              title: 'Organisiert',
              description: '5+ Kategorien verwendet',
              achieved: stats.notesByCategory.length >= 5,
              icon: '📚',
            },
            {
              title: 'Produktiv',
              description: '90%+ Aufgaben erledigt',
              achieved:
                stats.todoStats.total > 0 &&
                stats.todoStats.completed / stats.todoStats.total >= 0.9,
              icon: '⚡',
            },
            {
              title: 'Veteran',
              description: '30+ Tage aktiv',
              achieved: stats.activeDays >= 30,
              icon: '🎖️',
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 border-2 text-center transition-all duration-300 ${
                achievement.achieved
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <div className="font-bold text-sm mb-1">{achievement.title}</div>
              <div className="text-xs">{achievement.description}</div>
              {achievement.achieved && (
                <div className="mt-2 text-xs font-bold text-yellow-700">
                  ERREICHT!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-8 bg-gray-50 border-2 border-gray-900 p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          Daten exportieren
        </h4>
        <div className="flex gap-4">
          <button
            onClick={() => StatisticsService.exportStatistics(stats, timeRange)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Statistiken exportieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
