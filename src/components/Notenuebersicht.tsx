import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Filter, Download, Upload, Plus, Search, Edit, Trash2, 
  X, Save, Calculator, BarChart3, Users, BookOpen, Calendar,
  ChevronDown, ChevronUp, Eye, EyeOff, MoreVertical, Settings
} from 'lucide-react';

interface NotenuebersichtProps {
  currentUserId: string;
}

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  grade: number;
  points: number;
  date: string;
  type: 'Klausur' | 'Test' | 'Mündlich' | 'Hausaufgabe' | 'Sonstige';
  weight: number;
  comment?: string;
  isVisible: boolean;
}

interface StudentStats {
  studentId: string;
  studentName: string;
  className: string;
  average: number;
  totalPoints: number;
  gradeCount: number;
  subjectAverages: { [subject: string]: number };
}

const Notenuebersicht: React.FC<NotenuebersichtProps> = ({ currentUserId }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    type: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'students'>('table');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  // Mock Data für Entwicklung
  useEffect(() => {
    const mockGrades: Grade[] = [
      {
        id: '1',
        studentId: 's1',
        studentName: 'Max Mustermann',
        className: '10a',
        subject: 'Mathematik',
        grade: 2.3,
        points: 12,
        date: '2024-01-15',
        type: 'Klausur',
        weight: 50,
        comment: 'Gute Leistung',
        isVisible: true
      },
      {
        id: '2',
        studentId: 's2',
        studentName: 'Anna Schmidt',
        className: '10a',
        subject: 'Mathematik',
        grade: 1.7,
        points: 14,
        date: '2024-01-15',
        type: 'Klausur',
        weight: 50,
        isVisible: true
      },
      {
        id: '3',
        studentId: 's1',
        studentName: 'Max Mustermann',
        className: '10a',
        subject: 'Deutsch',
        grade: 3.0,
        points: 10,
        date: '2024-01-10',
        type: 'Test',
        weight: 25,
        isVisible: true
      },
      {
        id: '4',
        studentId: 's3',
        studentName: 'Lisa Bauer',
        className: '10b',
        subject: 'Englisch',
        grade: 2.0,
        points: 13,
        date: '2024-01-12',
        type: 'Mündlich',
        weight: 30,
        comment: 'Ausgezeichnete Mitarbeit',
        isVisible: true
      },
      {
        id: '5',
        studentId: 's2',
        studentName: 'Anna Schmidt',
        className: '10a',
        subject: 'Physik',
        grade: 1.3,
        points: 15,
        date: '2024-01-18',
        type: 'Klausur',
        weight: 60,
        isVisible: false
      }
    ];
    
    setGrades(mockGrades);
    setFilteredGrades(mockGrades);
  }, []);

  // Berechnete Werte
  const studentStats = useMemo(() => {
    const stats: { [key: string]: StudentStats } = {};
    
    filteredGrades.forEach(grade => {
      if (!stats[grade.studentId]) {
        stats[grade.studentId] = {
          studentId: grade.studentId,
          studentName: grade.studentName,
          className: grade.className,
          average: 0,
          totalPoints: 0,
          gradeCount: 0,
          subjectAverages: {}
        };
      }
      
      const student = stats[grade.studentId];
      student.totalPoints += grade.points * (grade.weight / 100);
      student.gradeCount++;
      
      // Fach-Durchschnitte berechnen
      if (!student.subjectAverages[grade.subject]) {
        student.subjectAverages[grade.subject] = 0;
      }
      student.subjectAverages[grade.subject] = 
        (student.subjectAverages[grade.subject] + grade.grade) / 2;
    });
    
    // Gesamtdurchschnitte berechnen
    Object.values(stats).forEach(student => {
      student.average = student.totalPoints > 0 ? 
        (15 - (student.totalPoints / student.gradeCount * 15 / 15)) * 5 / 3 + 1 : 0;
    });
    
    return Object.values(stats);
  }, [filteredGrades]);

  const overallStats = useMemo(() => {
    const visibleGrades = filteredGrades.filter(grade => grade.isVisible || showHidden);
    const totalGrades = visibleGrades.length;
    const averageGrade = totalGrades > 0 
      ? visibleGrades.reduce((sum, grade) => sum + grade.grade, 0) / totalGrades 
      : 0;
    const totalStudents = new Set(visibleGrades.map(g => g.studentId)).size;
    const totalSubjects = new Set(visibleGrades.map(g => g.subject)).size;
    
    return { totalGrades, averageGrade, totalStudents, totalSubjects };
  }, [filteredGrades, showHidden]);

  // Filter anwenden
  useEffect(() => {
    let result = grades;
    
    if (filters.class) {
      result = result.filter(grade => grade.className === filters.class);
    }
    
    if (filters.subject) {
      result = result.filter(grade => grade.subject === filters.subject);
    }
    
    if (filters.type) {
      result = result.filter(grade => grade.type === filters.type);
    }
    
    if (filters.dateFrom) {
      result = result.filter(grade => grade.date >= filters.dateFrom);
    }
    
    if (filters.dateTo) {
      result = result.filter(grade => grade.date <= filters.dateTo);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(grade => 
        grade.studentName.toLowerCase().includes(searchLower) ||
        grade.subject.toLowerCase().includes(searchLower) ||
        grade.comment?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredGrades(result);
  }, [grades, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleStudentExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const toggleGradeVisibility = (gradeId: string) => {
    setGrades(prev => prev.map(grade => 
      grade.id === gradeId ? { ...grade, isVisible: !grade.isVisible } : grade
    ));
  };

  const updateGrade = (updatedGrade: Grade) => {
    setGrades(prev => prev.map(grade => 
      grade.id === updatedGrade.id ? updatedGrade : grade
    ));
    setEditingGrade(null);
  };

  const deleteGrade = (gradeId: string) => {
    setGrades(prev => prev.filter(grade => grade.id !== gradeId));
  };

  const addNewGrade = () => {
    const newGrade: Grade = {
      id: Date.now().toString(),
      studentId: '',
      studentName: '',
      className: '',
      subject: '',
      grade: 0,
      points: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'Test',
      weight: 100,
      isVisible: true
    };
    setEditingGrade(newGrade);
  };

  const exportGrades = () => {
    const csv = [
      ['Schüler', 'Klasse', 'Fach', 'Typ', 'Note', 'Punkte', 'Gewichtung', 'Datum', 'Kommentar', 'Sichtbar'],
      ...filteredGrades.map(grade => [
        grade.studentName,
        grade.className,
        grade.subject,
        grade.type,
        grade.grade.toString(),
        grade.points.toString(),
        grade.weight.toString(),
        grade.date,
        grade.comment || '',
        grade.isVisible ? 'Ja' : 'Nein'
      ])
    ].map(row => row.join(';')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Noten_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getUniqueValues = (key: keyof Grade) => {
    return Array.from(new Set(grades.map(grade => grade[key])));
  };

  const getGradeColor = (grade: number) => {
    if (grade <= 1.5) return 'text-green-800 bg-green-100';
    if (grade <= 2.5) return 'text-blue-800 bg-blue-100';
    if (grade <= 3.5) return 'text-yellow-800 bg-yellow-100';
    if (grade <= 4.5) return 'text-orange-800 bg-orange-100';
    return 'text-red-800 bg-red-100';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Klausur': 'bg-red-100 text-red-800',
      'Test': 'bg-yellow-100 text-yellow-800',
      'Mündlich': 'bg-green-100 text-green-800',
      'Hausaufgabe': 'bg-blue-100 text-blue-800',
      'Sonstige': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[95vw] mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-300 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notenübersicht</h1>
                <p className="text-gray-600 text-sm">Verwalten und analysieren Sie Schülerleistungen</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowHidden(!showHidden)}
                className={`flex items-center gap-2 px-4 py-2 border text-sm font-medium transition-colors ${
                  showHidden 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-50'
                }`}
              >
                {showHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showHidden ? 'Versteckte anzeigen' : 'Nur sichtbare'}
              </button>
              
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'students' : 'table')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'table' ? <Users className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                {viewMode === 'table' ? 'Schüleransicht' : 'Tabellenansicht'}
              </button>
              
              <button
                onClick={exportGrades}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors border border-gray-900"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              
              <button
                onClick={addNewGrade}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border border-gray-900"
              >
                <Plus className="h-4 w-4" />
                Neue Note
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border border-gray-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{overallStats.totalGrades}</div>
                    <div className="text-sm text-gray-600">Noten gesamt</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {overallStats.averageGrade.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Durchschnitt</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</div>
                    <div className="text-sm text-gray-600">Schüler</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{overallStats.totalSubjects}</div>
                    <div className="text-sm text-gray-600">Fächer</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-300 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Suchen..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
              />
            </div>
            
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
            >
              <option value="">Alle Klassen</option>
              {getUniqueValues('className').map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
            
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
            >
              <option value="">Alle Fächer</option>
              {getUniqueValues('subject').map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
            >
              <option value="">Alle Typen</option>
              <option value="Klausur">Klausur</option>
              <option value="Test">Test</option>
              <option value="Mündlich">Mündlich</option>
              <option value="Hausaufgabe">Hausaufgabe</option>
              <option value="Sonstige">Sonstige</option>
            </select>
            
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
              placeholder="Von"
            />
            
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                placeholder="Bis"
              />
              <button
                onClick={() => setFilters({ class: '', subject: '', type: '', search: '', dateFrom: '', dateTo: '' })}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-300 shadow-sm">
          {viewMode === 'table' ? (
            /* Tabellenansicht */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Schüler</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Klasse</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Fach</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Typ</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Note</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Punkte</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Gewichtung</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Datum</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Kommentar</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGrades
                    .filter(grade => grade.isVisible || showHidden)
                    .map((grade) => (
                    <tr key={grade.id} className={`hover:bg-gray-50 transition-colors ${
                      !grade.isVisible ? 'bg-gray-100 opacity-70' : ''
                    }`}>
                      <td className="px-6 py-4 text-sm font-medium">{grade.studentName}</td>
                      <td className="px-6 py-4 text-sm">{grade.className}</td>
                      <td className="px-6 py-4 text-sm">{grade.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(grade.type)}`}>
                          {grade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">{grade.points}</td>
                      <td className="px-6 py-4 text-center text-sm">{grade.weight}%</td>
                      <td className="px-6 py-4 text-sm">{new Date(grade.date).toLocaleDateString('de-DE')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {grade.comment || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => toggleGradeVisibility(grade.id)}
                            className={`p-1 rounded ${
                              grade.isVisible 
                                ? 'text-green-600 hover:text-green-800' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {grade.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => setEditingGrade(grade)}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteGrade(grade.id)}
                            className="p-1 text-red-600 hover:text-red-800 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredGrades.filter(grade => grade.isVisible || showHidden).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Keine Noten gefunden</p>
                  <p className="text-sm">Passen Sie die Filter an oder fügen Sie neue Noten hinzu</p>
                </div>
              )}
            </div>
          ) : (
            /* Schüleransicht */
            <div className="p-6">
              <div className="space-y-4">
                {studentStats.map((student) => (
                  <div key={student.studentId} className="border border-gray-300 rounded-lg">
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => toggleStudentExpansion(student.studentId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{student.studentName}</div>
                          <div className="text-sm text-gray-600">{student.className}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {student.average.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">Durchschnitt</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {student.gradeCount}
                          </div>
                          <div className="text-sm text-gray-600">Noten</div>
                        </div>
                        
                        {expandedStudents.has(student.studentId) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    {expandedStudents.has(student.studentId) && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {Object.entries(student.subjectAverages).map(([subject, average]) => (
                            <div key={subject} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="font-medium text-gray-900">{subject}</span>
                              <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(average)}`}>
                                {average.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-gray-900 mb-2">Einzelnoten:</div>
                          {filteredGrades
                            .filter(grade => grade.studentId === student.studentId && (grade.isVisible || showHidden))
                            .map((grade) => (
                            <div key={grade.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium text-gray-900">{grade.subject}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${getTypeColor(grade.type)}`}>
                                    {grade.type}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {new Date(grade.date).toLocaleDateString('de-DE')}
                                  </span>
                                </div>
                                {grade.comment && (
                                  <div className="text-sm text-gray-600 mt-1">{grade.comment}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(grade.grade)}`}>
                                  {grade.grade.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-600">{grade.weight}%</span>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => toggleGradeVisibility(grade.id)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    {grade.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </button>
                                  <button 
                                    onClick={() => setEditingGrade(grade)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 shadow-lg rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGrade.id === Date.now().toString() ? 'Neue Note' : 'Note bearbeiten'}
              </h3>
              <button
                onClick={() => setEditingGrade(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schüler</label>
                  <input
                    type="text"
                    value={editingGrade.studentName}
                    onChange={(e) => setEditingGrade({...editingGrade, studentName: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klasse</label>
                  <input
                    type="text"
                    value={editingGrade.className}
                    onChange={(e) => setEditingGrade({...editingGrade, className: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fach</label>
                  <input
                    type="text"
                    value={editingGrade.subject}
                    onChange={(e) => setEditingGrade({...editingGrade, subject: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                  <select
                    value={editingGrade.type}
                    onChange={(e) => setEditingGrade({...editingGrade, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  >
                    <option value="Klausur">Klausur</option>
                    <option value="Test">Test</option>
                    <option value="Mündlich">Mündlich</option>
                    <option value="Hausaufgabe">Hausaufgabe</option>
                    <option value="Sonstige">Sonstige</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="6"
                    value={editingGrade.grade}
                    onChange={(e) => setEditingGrade({...editingGrade, grade: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punkte</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={editingGrade.points}
                    onChange={(e) => setEditingGrade({...editingGrade, points: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gewichtung (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingGrade.weight}
                    onChange={(e) => setEditingGrade({...editingGrade, weight: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={editingGrade.date}
                  onChange={(e) => setEditingGrade({...editingGrade, date: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kommentar</label>
                <textarea
                  value={editingGrade.comment || ''}
                  onChange={(e) => setEditingGrade({...editingGrade, comment: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-400 focus:outline-none focus:border-gray-600 text-sm resize-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={editingGrade.isVisible}
                  onChange={(e) => setEditingGrade({...editingGrade, isVisible: e.target.checked})}
                  className="rounded border-gray-400 text-black focus:ring-gray-500"
                />
                <label htmlFor="isVisible" className="text-sm text-gray-700">
                  Note ist für Schüler sichtbar
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-300">
              <button
                onClick={() => setEditingGrade(null)}
                className="px-4 py-2 border border-gray-400 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => updateGrade(editingGrade)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Save className="h-4 w-4" />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notenuebersicht;