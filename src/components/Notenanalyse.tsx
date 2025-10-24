import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, BarChart3, Filter, Download, Users, Award, AlertTriangle,
  X, ChevronDown, ChevronUp, Eye, EyeOff, Settings, Calculator,
  Calendar, BookOpen, Target, Zap, Clock, Search, Plus,
  ArrowUpRight, ArrowDownRight, Minus, MoreVertical, DownloadCloud
} from 'lucide-react';

interface NotenanalyseProps {
  currentUserId: string;
}

interface AnalysisData {
  id: string;
  class: string;
  subject: string;
  averageGrade: number;
  averagePoints: number;
  gradeDistribution: { grade: number; count: number; percentage: number }[];
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  topStudents: { name: string; average: number; improvement: number }[];
  weakStudents: { name: string; average: number; decline: number; riskLevel: 'high' | 'medium' | 'low' }[];
  comparisonData: {
    period: string;
    average: number;
    change: number;
  }[];
  subjectComparison: { subject: string; average: number; rank: number }[];
  detailedMetrics: {
    standardDeviation: number;
    passRate: number;
    excellenceRate: number;
    riskRate: number;
  };
  predictions: {
    nextPeriod: number;
    confidence: number;
    recommendation: string;
  };
}

const Notenanalyse: React.FC<NotenanalyseProps> = ({ currentUserId }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester' | 'year'>('semester');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metrics', 'distribution']));
  const [customMetrics, setCustomMetrics] = useState({
    showPredictions: true,
    showRiskAnalysis: true,
    showTrends: true,
    showBenchmarks: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data für Entwicklung
  useEffect(() => {
    const mockData: AnalysisData[] = [
      {
        id: '1',
        class: '10a',
        subject: 'Mathematik',
        averageGrade: 2.4,
        averagePoints: 11.2,
        gradeDistribution: [
          { grade: 1.0, count: 3, percentage: 9.7 },
          { grade: 1.3, count: 2, percentage: 6.5 },
          { grade: 1.7, count: 4, percentage: 12.9 },
          { grade: 2.0, count: 5, percentage: 16.1 },
          { grade: 2.3, count: 6, percentage: 19.4 },
          { grade: 2.7, count: 4, percentage: 12.9 },
          { grade: 3.0, count: 3, percentage: 9.7 },
          { grade: 3.3, count: 2, percentage: 6.5 },
          { grade: 3.7, count: 1, percentage: 3.2 },
          { grade: 4.0, count: 1, percentage: 3.2 }
        ],
        trend: 'improving',
        trendPercentage: 8.3,
        topStudents: [
          { name: 'Anna Schmidt', average: 1.3, improvement: 12.5 },
          { name: 'Tom Weber', average: 1.7, improvement: 8.2 },
          { name: 'Lisa Meyer', average: 1.8, improvement: 5.6 },
          { name: 'Paul Wagner', average: 1.9, improvement: 4.3 }
        ],
        weakStudents: [
          { name: 'Max Mustermann', average: 4.2, decline: 15.8, riskLevel: 'high' },
          { name: 'Sarah Klein', average: 4.0, decline: 12.3, riskLevel: 'high' },
          { name: 'Jan Fischer', average: 3.8, decline: 8.7, riskLevel: 'medium' },
          { name: 'Laura Hoffmann', average: 3.5, decline: 5.2, riskLevel: 'low' }
        ],
        comparisonData: [
          { period: 'Q1', average: 2.8, change: 0 },
          { period: 'Q2', average: 2.6, change: -7.1 },
          { period: 'Q3', average: 2.4, change: -7.7 },
          { period: 'Q4', average: 2.3, change: -4.2 }
        ],
        subjectComparison: [
          { subject: 'Mathematik', average: 2.4, rank: 1 },
          { subject: 'Physik', average: 2.6, rank: 2 },
          { subject: 'Chemie', average: 2.7, rank: 3 },
          { subject: 'Deutsch', average: 2.8, rank: 4 },
          { subject: 'Englisch', average: 2.9, rank: 5 }
        ],
        detailedMetrics: {
          standardDeviation: 0.8,
          passRate: 87.1,
          excellenceRate: 29.0,
          riskRate: 12.9
        },
        predictions: {
          nextPeriod: 2.2,
          confidence: 78,
          recommendation: 'Weiterhin individuelle Förderung für Risikoschüler'
        }
      },
      {
        id: '2',
        class: '10a',
        subject: 'Deutsch',
        averageGrade: 2.8,
        averagePoints: 9.8,
        gradeDistribution: [
          { grade: 1.0, count: 1, percentage: 3.2 },
          { grade: 1.3, count: 2, percentage: 6.5 },
          { grade: 1.7, count: 3, percentage: 9.7 },
          { grade: 2.0, count: 4, percentage: 12.9 },
          { grade: 2.3, count: 6, percentage: 19.4 },
          { grade: 2.7, count: 5, percentage: 16.1 },
          { grade: 3.0, count: 4, percentage: 12.9 },
          { grade: 3.3, count: 3, percentage: 9.7 },
          { grade: 3.7, count: 2, percentage: 6.5 },
          { grade: 4.0, count: 1, percentage: 3.2 }
        ],
        trend: 'stable',
        trendPercentage: 0.5,
        topStudents: [
          { name: 'Maria Schulz', average: 1.5, improvement: 3.2 },
          { name: 'Sophie Becker', average: 2.0, improvement: 1.8 },
          { name: 'David Schmitz', average: 2.1, improvement: 0.9 }
        ],
        weakStudents: [
          { name: 'Kevin Richter', average: 4.5, decline: 18.4, riskLevel: 'high' },
          { name: 'Julia Neumann', average: 4.1, decline: 14.2, riskLevel: 'high' },
          { name: 'Michael Bauer', average: 3.9, decline: 9.8, riskLevel: 'medium' }
        ],
        comparisonData: [
          { period: 'Q1', average: 2.9, change: 0 },
          { period: 'Q2', average: 2.8, change: -3.4 },
          { period: 'Q3', average: 2.8, change: 0 },
          { period: 'Q4', average: 2.8, change: 0 }
        ],
        subjectComparison: [
          { subject: 'Deutsch', average: 2.8, rank: 4 },
          { subject: 'Mathematik', average: 2.4, rank: 1 },
          { subject: 'Englisch', average: 2.9, rank: 5 },
          { subject: 'Geschichte', average: 2.7, rank: 3 },
          { subject: 'Biologie', average: 2.6, rank: 2 }
        ],
        detailedMetrics: {
          standardDeviation: 0.7,
          passRate: 83.9,
          excellenceRate: 19.4,
          riskRate: 16.1
        },
        predictions: {
          nextPeriod: 2.8,
          confidence: 65,
          recommendation: 'Fokus auf Textverständnis und Aufsatztraining'
        }
      }
    ];
    
    setAnalysisData(mockData);
    setSelectedClass('10a');
    setSelectedSubject('Mathematik');
  }, []);

  const currentAnalysis = analysisData.find(
    data => data.class === selectedClass && data.subject === selectedSubject
  );

  const filteredAnalysis = useMemo(() => {
    if (!searchTerm) return analysisData;
    return analysisData.filter(data => 
      data.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analysisData, searchTerm]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const exportAnalysis = () => {
    if (!currentAnalysis) return;
    
    const report = `
NOTENANALYSE BERICHT
====================

Klasse: ${currentAnalysis.class}
Fach: ${currentAnalysis.subject}
Zeitraum: ${timeRange}
Erstellt: ${new Date().toLocaleDateString('de-DE')}

ZUSAMMENFASSUNG
---------------
Durchschnittsnote: ${currentAnalysis.averageGrade.toFixed(2)}
Durchschnittspunkte: ${currentAnalysis.averagePoints.toFixed(1)}
Trend: ${currentAnalysis.trend} (${currentAnalysis.trendPercentage > 0 ? '+' : ''}${currentAnalysis.trendPercentage}%)

DETAILMETRIKEN
--------------
Standardabweichung: ${currentAnalysis.detailedMetrics.standardDeviation.toFixed(2)}
Bestehensquote: ${currentAnalysis.detailedMetrics.passRate}%
Exzellenzquote: ${currentAnalysis.detailedMetrics.excellenceRate}%
Risikoquote: ${currentAnalysis.detailedMetrics.riskRate}%

BESTE SCHÜLER
-------------
${currentAnalysis.topStudents.map((s, i) => 
  `${i + 1}. ${s.name} - ${s.average.toFixed(1)} (${s.improvement > 0 ? '+' : ''}${s.improvement}%)`
).join('\n')}

FÖRDERBEDARF
------------
${currentAnalysis.weakStudents.map((s, i) => 
  `${i + 1}. ${s.name} - ${s.average.toFixed(1)} (Risiko: ${s.riskLevel})`
).join('\n')}

EMPFEHLUNGEN
------------
${currentAnalysis.predictions.recommendation}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Analyse_${currentAnalysis.class}_${currentAnalysis.subject}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const getTrendColor = (trend: string, percentage?: number) => {
    if (trend === 'improving') return 'text-green-600 bg-green-100';
    if (trend === 'declining') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getRiskColor = (riskLevel: string) => {
    return riskLevel === 'high' ? 'text-red-600 bg-red-100' :
           riskLevel === 'medium' ? 'text-yellow-600 bg-yellow-100' :
           'text-green-600 bg-green-100';
  };

  const getGradeColor = (grade: number) => {
    if (grade <= 1.5) return 'text-green-800 bg-green-100';
    if (grade <= 2.5) return 'text-blue-800 bg-blue-100';
    if (grade <= 3.5) return 'text-yellow-800 bg-yellow-100';
    if (grade <= 4.5) return 'text-orange-800 bg-orange-100';
    return 'text-red-800 bg-red-100';
  };

  if (!currentAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-300 shadow-sm p-12 max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Keine Daten verfügbar</h3>
          <p className="text-gray-600 mb-8">Wählen Sie eine Klasse und ein Fach für die Analyse aus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[95vw] mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-300 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Erweiterte Notenanalyse</h1>
                <p className="text-gray-600 text-sm">Tiefgehende Einblicke und prädiktive Analysen</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCustomMetrics(prev => ({ ...prev, showPredictions: !prev.showPredictions }))}
                className={`flex items-center gap-2 px-4 py-2 border text-sm font-medium transition-colors ${
                  customMetrics.showPredictions 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Target className="h-4 w-4" />
                Prognosen
              </button>
              
              <button
                onClick={exportAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors border border-gray-900"
              >
                <DownloadCloud className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Klasse oder Fach suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
              />
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
            >
              <option value="10a">Klasse 10a</option>
              <option value="10b">Klasse 10b</option>
              <option value="11a">Klasse 11a</option>
            </select>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
            >
              {Array.from(new Set(analysisData.map(d => d.subject))).map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
            >
              <option value="week">Letzte Woche</option>
              <option value="month">Letzter Monat</option>
              <option value="semester">Dieses Semester</option>
              <option value="year">Dieses Jahr</option>
            </select>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Übersicht', icon: BarChart3 },
            { id: 'detailed', label: 'Detailanalyse', icon: Calculator },
            { id: 'comparison', label: 'Vergleich', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as any)}
              className={`flex items-center gap-2 px-4 py-2 border text-sm font-medium transition-colors ${
                viewMode === id 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleSection('metrics')}
              >
                <h3 className="text-lg font-bold text-gray-900">Kernmetriken</h3>
                {expandedSections.has('metrics') ? 
                  <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </div>
              
              {expandedSections.has('metrics') && (
                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-gray-300 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentAnalysis.averageGrade.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Durchschnittsnote</div>
                      <div className={`text-xs mt-1 px-2 py-1 rounded-full ${getTrendColor(currentAnalysis.trend)}`}>
                        {currentAnalysis.trendPercentage > 0 ? '+' : ''}{currentAnalysis.trendPercentage}%
                      </div>
                    </div>
                    
                    <div className="text-center p-4 border border-gray-300 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentAnalysis.averagePoints.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Punkte</div>
                      <div className="text-xs text-gray-500 mt-1">von 15</div>
                    </div>
                    
                    <div className="text-center p-4 border border-gray-300 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentAnalysis.detailedMetrics.passRate}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Bestehensquote</div>
                      <div className="text-xs text-green-600 mt-1">≥ 4.0</div>
                    </div>
                    
                    <div className="text-center p-4 border border-gray-300 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentAnalysis.detailedMetrics.excellenceRate}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Exzellenzquote</div>
                      <div className="text-xs text-blue-600 mt-1">≤ 2.0</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grade Distribution */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleSection('distribution')}
              >
                <h3 className="text-lg font-bold text-gray-900">Detaillierte Notenverteilung</h3>
                {expandedSections.has('distribution') ? 
                  <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </div>
              
              {expandedSections.has('distribution') && (
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-3">
                    {currentAnalysis.gradeDistribution.map((dist) => (
                      <div key={dist.grade} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 w-32">
                          <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(dist.grade)}`}>
                            {dist.grade.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">{dist.count}</span>
                        </div>
                        <div className="flex-1 max-w-md">
                          <div className="bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-black h-4 rounded-full"
                              style={{ width: `${dist.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{dist.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Student Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Students */}
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Beste Leistungen
                  </h3>
                  <span className="text-sm text-gray-500">{currentAnalysis.topStudents.length} Schüler</span>
                </div>
                <div className="p-4 border-t border-gray-200 space-y-3">
                  {currentAnalysis.topStudents.map((student, index) => (
                    <div key={student.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-green-600">
                            +{student.improvement}% Verbesserung
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{student.average.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Durchschnitt</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Students */}
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Förderbedarf
                  </h3>
                  <span className="text-sm text-gray-500">{currentAnalysis.weakStudents.length} Schüler</span>
                </div>
                <div className="p-4 border-t border-gray-200 space-y-3">
                  {currentAnalysis.weakStudents.map((student, index) => (
                    <div key={student.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          student.riskLevel === 'high' ? 'bg-red-600' :
                          student.riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-orange-600'
                        } text-white`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-red-600">
                            {student.decline}% Verschlechterung
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{student.average.toFixed(1)}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getRiskColor(student.riskLevel)}`}>
                          {student.riskLevel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trend Analysis */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Zeitliche Entwicklung</h3>
                <div className="space-y-4">
                  {currentAnalysis.comparisonData.map((data, index) => (
                    <div key={data.period} className="flex items-center justify-between">
                      <span className="font-medium text-sm">{data.period}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-black h-2 rounded-full"
                            style={{ width: `${(15 - data.average) / 15 * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-right w-16">
                          <div className="font-bold text-sm">{data.average.toFixed(1)}</div>
                          {data.change !== 0 && (
                            <div className={`text-xs ${data.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.change > 0 ? '+' : ''}{data.change}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject Comparison */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Fachvergleich</h3>
                <div className="space-y-3">
                  {currentAnalysis.subjectComparison.map((subject) => (
                    <div key={subject.subject} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          subject.rank <= 2 ? 'bg-green-600 text-white' :
                          subject.rank <= 4 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {subject.rank}
                        </div>
                        <span className={`text-sm ${
                          subject.subject === currentAnalysis.subject ? 'font-bold text-gray-900' : 'text-gray-700'
                        }`}>
                          {subject.subject}
                        </span>
                      </div>
                      <span className="font-bold text-sm">{subject.average.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Predictions */}
            {customMetrics.showPredictions && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Prognose & Empfehlungen
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentAnalysis.predictions.nextPeriod.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Voraussichtlich nächste Periode</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {currentAnalysis.predictions.confidence}% Konfidenz
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {currentAnalysis.predictions.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Metrics */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Statistische Metriken</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border border-gray-300 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {currentAnalysis.detailedMetrics.standardDeviation.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Standardabw.</div>
                  </div>
                  <div className="text-center p-3 border border-gray-300 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {currentAnalysis.detailedMetrics.riskRate}%
                    </div>
                    <div className="text-xs text-gray-600">Risikoquote</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notenanalyse;