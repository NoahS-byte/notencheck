import React, { useState, useEffect } from 'react';
import { Shuffle, Play, RotateCcw, Settings, Users, List, Calendar, Calculator, Search, Check, X, UserX } from 'lucide-react';
import { SchoolService, SchoolClass, School as SchoolType } from '../services/schoolService';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  isExcluded?: boolean;
}

interface LocalSchoolClass {
  id: string;
  name: string;
  students: Student[];
  is_selected?: boolean;
}

const RandomGenerator: React.FC = () => {
  const [mode, setMode] = useState<'number' | 'groups' | 'multiple' | 'submission'>('number');
  const [useNames, setUseNames] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<LocalSchoolClass[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxValue, setMaxValue] = useState(28);
  const [numGroups, setNumGroups] = useState(4);
  const [numNumbers, setNumNumbers] = useState(5);
  const [numWeeks, setNumWeeks] = useState(6);
  const [studentsPerWeek, setStudentsPerWeek] = useState(3);
  const [autoDistribute, setAutoDistribute] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [finalNumber, setFinalNumber] = useState<number | null>(null);
  const [finalName, setFinalName] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'final'>('idle');
  const [groups, setGroups] = useState<number[][]>([]);
  const [nameGroups, setNameGroups] = useState<Student[][]>([]);
  const [multipleNumbers, setMultipleNumbers] = useState<number[]>([]);
  const [multipleNames, setMultipleNames] = useState<Student[]>([]);
  const [submissionSchedule, setSubmissionSchedule] = useState<number[][]>([]);
  const [nameSubmissionSchedule, setNameSubmissionSchedule] = useState<Student[][]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [showStudentExclusion, setShowStudentExclusion] = useState(false);

  // Get current user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await import('../lib/supabase').then(mod => mod.supabase.auth.getUser());
        if (user) {
          setUserId(user.id);
        } else {
          setUserId('demo-user');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setUserId('demo-user');
      }
    };
    
    getCurrentUser();
  }, []);

  // Lade Schulen und Klassen aus der Datenbank
  useEffect(() => {
    const loadSchools = async () => {
      if (useNames && userId) {
        setLoading(true);
        try {
          const schoolsData = await SchoolService.getSchools(userId);
          setSchools(schoolsData);
          
          if (schoolsData.length > 0 && !selectedSchool) {
            setSelectedSchool(schoolsData[0].id);
          }
        } catch (error) {
          console.error('Fehler beim Laden der Schulen:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSchools();
  }, [useNames, userId]);

  // Lade Klassen für ausgewählte Schule
  useEffect(() => {
    const loadClasses = async () => {
      if (useNames && userId && selectedSchool) {
        setLoading(true);
        try {
          const classesData = await SchoolService.getClasses(userId, selectedSchool);
          const classesWithStudents = await Promise.all(
            classesData.map(async (cls) => {
              const students = await SchoolService.getStudents(cls.id);
              return {
                id: cls.id,
                name: cls.name,
                students: students.map(student => ({
                  id: student.id,
                  firstName: student.firstName || 'Unbekannt',
                  lastName: student.lastName || 'Unbekannt',
                  isExcluded: false
                })),
                is_selected: false
              };
            })
          );
          
          setClasses(classesWithStudents);
          
          if (classesWithStudents.length > 0 && !selectedClass) {
            setSelectedClass(classesWithStudents[0].id);
          }
        } catch (error) {
          console.error('Fehler beim Laden der Klassen:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadClasses();
  }, [selectedSchool, useNames, userId]);

  // Aktuelle Klasse
  const currentClass = classes.find(c => c.id === selectedClass);

  // Gefilterte Klassen für die Auswahl
  const filteredClasses = classes.filter(cls => 
    !searchTerm || 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Automatische Verteilung der Schüler auf Wochen
  useEffect(() => {
    if (autoDistribute && mode === 'submission') {
      const totalStudents = useNames && currentClass ? getAvailableStudents().length : maxValue;
      if (totalStudents > 0 && numWeeks > 0) {
        const baseStudentsPerWeek = Math.floor(totalStudents / numWeeks);
        const remainingStudents = totalStudents % numWeeks;
        
        const calculatedStudentsPerWeek = baseStudentsPerWeek + (remainingStudents > 0 ? 1 : 0);
        setStudentsPerWeek(calculatedStudentsPerWeek);
      }
    }
  }, [autoDistribute, maxValue, numWeeks, mode, useNames, currentClass]);

  // Schüler-Abwahl-Funktionen
  const toggleStudentExclusion = (studentId: string) => {
    if (!currentClass) return;
    
    setClasses(prev => prev.map(cls => 
      cls.id === selectedClass 
        ? {
            ...cls,
            students: cls.students.map(student =>
              student.id === studentId
                ? { ...student, isExcluded: !student.isExcluded }
                : student
            )
          }
        : cls
    ));
  };

  const excludeAllStudents = () => {
    if (!currentClass) return;
    
    setClasses(prev => prev.map(cls => 
      cls.id === selectedClass 
        ? {
            ...cls,
            students: cls.students.map(student => ({
              ...student,
              isExcluded: true
            }))
          }
        : cls
    ));
  };

  const includeAllStudents = () => {
    if (!currentClass) return;
    
    setClasses(prev => prev.map(cls => 
      cls.id === selectedClass 
        ? {
            ...cls,
            students: cls.students.map(student => ({
              ...student,
              isExcluded: false
            }))
          }
        : cls
    ));
  };

  const getAvailableStudents = () => {
    if (useNames && currentClass) {
      return currentClass.students.filter(student => !student.isExcluded);
    }
    return Array.from({ length: maxValue }, (_, i) => i + 1);
  };

  const getExcludedStudents = () => {
    if (useNames && currentClass) {
      return currentClass.students.filter(student => student.isExcluded);
    }
    return [];
  };

  const generateRandomNumber = () => {
    if (mode === 'number') {
      generateSingleNumber();
    } else if (mode === 'groups') {
      generateGroups();
    } else if (mode === 'multiple') {
      generateMultipleNumbers();
    } else if (mode === 'submission') {
      generateSubmissionSchedule();
    }
  };

  const generateSingleNumber = () => {
    const availableStudents = getAvailableStudents();
    if (availableStudents.length <= 1) {
      alert(useNames ? 'Die Klasse muss mehr als 1 verfügbaren Schüler haben!' : 'Die Schüleranzahl muss größer als 1 sein!');
      return;
    }

    setIsGenerating(true);
    setAnimationPhase('spinning');
    setFinalNumber(null);
    setFinalName(null);
    
    const targetIndex = Math.floor(Math.random() * availableStudents.length);
    const target = availableStudents[targetIndex];
    
    let counter = 0;
    const totalDuration = 5000;
    const fastPhase = 3000;
    const slowPhase = 1500;
    const finalPhase = 500;
    
    const interval = setInterval(() => {
      counter += 50;
      
      if (counter < fastPhase) {
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        const randomStudent = availableStudents[randomIndex];
        if (useNames && typeof randomStudent !== 'number') {
          setCurrentName(`${randomStudent.firstName} ${randomStudent.lastName}`);
        } else {
          setCurrentNumber(randomStudent as number);
        }
      } else if (counter < fastPhase + slowPhase) {
        setAnimationPhase('slowing');
        if (counter % 100 === 0) {
          const randomIndex = Math.floor(Math.random() * availableStudents.length);
          const randomStudent = availableStudents[randomIndex];
          if (useNames && typeof randomStudent !== 'number') {
            setCurrentName(`${randomStudent.firstName} ${randomStudent.lastName}`);
          } else {
            setCurrentNumber(randomStudent as number);
          }
        }
      } else if (counter < totalDuration) {
        setAnimationPhase('final');
        if (counter % 200 === 0) {
          if (useNames && typeof target !== 'number') {
            setCurrentName(`${target.firstName} ${target.lastName}`);
          } else {
            setCurrentNumber(target as number);
          }
        }
      } else {
        clearInterval(interval);
        if (useNames && typeof target !== 'number') {
          setCurrentName(`${target.firstName} ${target.lastName}`);
          setFinalName(`${target.firstName} ${target.lastName}`);
        } else {
          setCurrentNumber(target as number);
          setFinalNumber(target as number);
        }
        setIsGenerating(false);
        setAnimationPhase('idle');
      }
    }, 50);
  };

  const generateGroups = () => {
    const availableStudents = getAvailableStudents();
    if (availableStudents.length <= 1) {
      alert(useNames ? 'Die Klasse muss mehr als 1 verfügbaren Schüler haben!' : 'Die Schüleranzahl muss größer als 1 sein!');
      return;
    }

    if (numGroups <= 0) {
      alert('Die Anzahl der Gruppen muss größer als 0 sein!');
      return;
    }

    if (numGroups > availableStudents.length) {
      alert('Die Anzahl der Gruppen darf nicht größer als die verfügbare Schüleranzahl sein!');
      return;
    }

    setIsGenerating(true);
    setAnimationPhase('spinning');
    setGroups([]);
    setNameGroups([]);
    
    const shuffledStudents = [...availableStudents];
    for (let i = shuffledStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
    }
    
    const resultGroups: any[][] = Array.from({ length: numGroups }, () => []);
    const resultNameGroups: Student[][] = Array.from({ length: numGroups }, () => []);
    
    shuffledStudents.forEach((student, index) => {
      if (useNames) {
        resultNameGroups[index % numGroups].push(student as Student);
      } else {
        resultGroups[index % numGroups].push(student);
      }
    });
    
    let counter = 0;
    const totalDuration = 5000;
    
    const interval = setInterval(() => {
      counter += 50;
      
      if (counter < totalDuration) {
        const tempGroups: any[][] = Array.from({ length: numGroups }, () => []);
        const tempNameGroups: Student[][] = Array.from({ length: numGroups }, () => []);
        
        shuffledStudents.forEach((student) => {
          const randomGroup = Math.floor(Math.random() * numGroups);
          if (useNames) {
            tempNameGroups[randomGroup].push(student as Student);
          } else {
            tempGroups[randomGroup].push(student);
          }
        });
        
        if (useNames) {
          setNameGroups(tempNameGroups);
        } else {
          setGroups(tempGroups);
        }
      } else {
        clearInterval(interval);
        if (useNames) {
          setNameGroups(resultNameGroups);
        } else {
          setGroups(resultGroups);
        }
        setIsGenerating(false);
        setAnimationPhase('idle');
      }
    }, 50);
  };

  const generateMultipleNumbers = () => {
    const availableStudents = getAvailableStudents();
    if (availableStudents.length <= 1) {
      alert(useNames ? 'Die Klasse muss mehr als 1 verfügbaren Schüler haben!' : 'Die Schüleranzahl muss größer als 1 sein!');
      return;
    }

    if (numNumbers <= 0) {
      alert('Die Anzahl der Zahlen muss größer als 0 sein!');
      return;
    }

    if (numNumbers > availableStudents.length) {
      alert('Die Anzahl der Zahlen darf nicht größer als die verfügbare Schüleranzahl sein!');
      return;
    }

    setIsGenerating(true);
    setAnimationPhase('spinning');
    setMultipleNumbers([]);
    setMultipleNames([]);
    
    const shuffledStudents = [...availableStudents];
    for (let i = shuffledStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
    }
    
    const resultNumbers = shuffledStudents.slice(0, numNumbers);
    
    let counter = 0;
    const totalDuration = 5000;
    
    const interval = setInterval(() => {
      counter += 50;
      
      if (counter < totalDuration) {
        const tempNumbers: any[] = [];
        const tempNames: Student[] = [];
        
        for (let i = 0; i < numNumbers; i++) {
          const randomIndex = Math.floor(Math.random() * availableStudents.length);
          if (useNames) {
            tempNames.push(availableStudents[randomIndex] as Student);
          } else {
            tempNumbers.push(availableStudents[randomIndex]);
          }
        }
        
        if (useNames) {
          setMultipleNames(tempNames);
        } else {
          setMultipleNumbers(tempNumbers as number[]);
        }
      } else {
        clearInterval(interval);
        if (useNames) {
          setMultipleNames(resultNumbers as Student[]);
        } else {
          setMultipleNumbers(resultNumbers as number[]);
        }
        setIsGenerating(false);
        setAnimationPhase('idle');
      }
    }, 50);
  };

  const generateSubmissionSchedule = () => {
    const availableStudents = getAvailableStudents();
    if (availableStudents.length <= 1) {
      alert(useNames ? 'Die Klasse muss mehr als 1 verfügbaren Schüler haben!' : 'Die Schüleranzahl muss größer als 1 sein!');
      return;
    }

    if (numWeeks <= 0) {
      alert('Die Anzahl der Wochen muss größer als 0 sein!');
      return;
    }

    if (studentsPerWeek <= 0) {
      alert('Die Anzahl der Schüler pro Woche muss größer als 0 sein!');
      return;
    }

    setIsGenerating(true);
    setAnimationPhase('spinning');
    setSubmissionSchedule([]);
    setNameSubmissionSchedule([]);
    
    const shuffledStudents = [...availableStudents];
    for (let i = shuffledStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
    }
    
    const resultSchedule: any[][] = Array.from({ length: numWeeks }, () => []);
    const resultNameSchedule: Student[][] = Array.from({ length: numWeeks }, () => []);
    
    for (let i = 0; i < availableStudents.length; i++) {
      const weekIndex = Math.floor(i / studentsPerWeek);
      if (weekIndex < numWeeks) {
        if (useNames) {
          resultNameSchedule[weekIndex].push(shuffledStudents[i] as Student);
        } else {
          resultSchedule[weekIndex].push(shuffledStudents[i]);
        }
      }
    }
    
    let counter = 0;
    const totalDuration = 5000;
    
    const interval = setInterval(() => {
      counter += 50;
      
      if (counter < totalDuration) {
        const tempSchedule: any[][] = Array.from({ length: numWeeks }, () => []);
        const tempNameSchedule: Student[][] = Array.from({ length: numWeeks }, () => []);
        
        for (let week = 0; week < numWeeks; week++) {
          for (let i = 0; i < studentsPerWeek; i++) {
            const randomIndex = Math.floor(Math.random() * availableStudents.length);
            if (useNames) {
              tempNameSchedule[week].push(availableStudents[randomIndex] as Student);
            } else {
              tempSchedule[week].push(availableStudents[randomIndex]);
            }
          }
        }
        
        if (useNames) {
          setNameSubmissionSchedule(tempNameSchedule);
        } else {
          setSubmissionSchedule(tempSchedule);
        }
      } else {
        clearInterval(interval);
        if (useNames) {
          setNameSubmissionSchedule(resultNameSchedule);
        } else {
          setSubmissionSchedule(resultSchedule);
        }
        setIsGenerating(false);
        setAnimationPhase('idle');
      }
    }, 50);
  };

  const reset = () => {
    setCurrentNumber(null);
    setCurrentName(null);
    setFinalNumber(null);
    setFinalName(null);
    setGroups([]);
    setNameGroups([]);
    setMultipleNumbers([]);
    setMultipleNames([]);
    setSubmissionSchedule([]);
    setNameSubmissionSchedule([]);
    setIsGenerating(false);
    setAnimationPhase('idle');
  };

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'spinning':
        return 'animate-pulse scale-110 text-blue-600';
      case 'slowing':
        return 'animate-bounce scale-105 text-yellow-600';
      case 'final':
        return 'scale-125 text-green-600';
      default:
        return finalNumber || finalName || groups.length > 0 || nameGroups.length > 0 || multipleNumbers.length > 0 || multipleNames.length > 0 || submissionSchedule.length > 0 || nameSubmissionSchedule.length > 0 ? 'scale-125 text-green-600' : '';
    }
  };

  const getDistributionInfo = () => {
    const totalStudents = getAvailableStudents().length;
    if (totalStudents <= 0 || numWeeks <= 0) return null;
    
    const baseStudentsPerWeek = Math.floor(totalStudents / numWeeks);
    const remainingStudents = totalStudents % numWeeks;
    
    if (remainingStudents === 0) {
      return `${numWeeks} Wochen mit je ${baseStudentsPerWeek} Schülern`;
    } else {
      const weeksWithExtra = remainingStudents;
      const weeksWithoutExtra = numWeeks - remainingStudents;
      
      return `${weeksWithExtra} Wochen mit ${baseStudentsPerWeek + 1} Schülern, ${weeksWithoutExtra} Wochen mit ${baseStudentsPerWeek} Schülern`;
    }
  };

  const getDisplayText = () => {
    if (useNames) {
      return currentName || '?';
    }
    return currentNumber !== null ? currentNumber : '?';
  };

  const isGenerateDisabled = () => {
    if (isGenerating || loading) return true;
    
    if (useNames && !currentClass) return true;
    
    const availableStudents = getAvailableStudents().length;
    
    switch (mode) {
      case 'number':
        return useNames 
          ? !currentClass || availableStudents <= 1
          : maxValue <= 1;
          
      case 'groups':
        if (useNames) {
          return !currentClass || availableStudents <= 1 || numGroups <= 0 || numGroups > availableStudents;
        } else {
          return maxValue <= 1 || numGroups <= 0 || numGroups > maxValue;
        }
        
      case 'multiple':
        if (useNames) {
          return !currentClass || availableStudents <= 1 || numNumbers <= 0 || numNumbers > availableStudents;
        } else {
          return maxValue <= 1 || numNumbers <= 0 || numNumbers > maxValue;
        }
        
      case 'submission':
        if (useNames) {
          return !currentClass || availableStudents <= 1 || numWeeks <= 0 || (!autoDistribute && studentsPerWeek <= 0);
        } else {
          return maxValue <= 1 || numWeeks <= 0 || (!autoDistribute && studentsPerWeek <= 0);
        }
        
      default:
        return false;
    }
  };

  const availableStudents = getAvailableStudents();
  const excludedStudents = getExcludedStudents();

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-900">
        <Shuffle className="h-8 w-8 text-gray-900" />
        <h2 className="text-3xl font-bold text-gray-900">Zufallsgenerator</h2>
      </div>

      {/* Mode Selection */}
      <div className="mb-8">
        <label className="block text-lg font-bold text-gray-900 mb-3">
          Modus
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setMode('number')}
            className={`px-4 py-3 border-2 border-gray-900 font-bold transition-all duration-300 ${
              mode === 'number' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Shuffle className="h-5 w-5 mx-auto mb-1" />
            Einzelne Auswahl
          </button>
          <button
            onClick={() => setMode('groups')}
            className={`px-4 py-3 border-2 border-gray-900 font-bold transition-all duration-300 ${
              mode === 'groups' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            Gruppen einteilen
          </button>
          <button
            onClick={() => setMode('multiple')}
            className={`px-4 py-3 border-2 border-gray-900 font-bold transition-all duration-300 ${
              mode === 'multiple' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            <List className="h-5 w-5 mx-auto mb-1" />
            Mehrere Auswahlen
          </button>
          <button
            onClick={() => setMode('submission')}
            className={`px-4 py-3 border-2 border-gray-900 font-bold transition-all duration-300 ${
              mode === 'submission' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-5 w-5 mx-auto mb-1" />
            Abgabeplan
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Namens-/Zahlen-Modus */}
        <div className="md:col-span-2">
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Auswahlmodus
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="selectionMode"
                checked={!useNames}
                onChange={() => setUseNames(false)}
                className="w-5 h-5 border-2 border-gray-900 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-lg font-medium text-gray-900">
                Zahlen auswählen
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="selectionMode"
                checked={useNames}
                onChange={() => setUseNames(true)}
                className="w-5 h-5 border-2 border-gray-900 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-lg font-medium text-gray-900">
                Namen auswählen
              </span>
            </label>
          </div>
        </div>

        {/* Klassenauswahl für Namensmodus */}
        {useNames && (
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-lg font-bold text-gray-900">
                Klasse auswählen
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStudentExclusion(!showStudentExclusion)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                >
                  <UserX className="h-4 w-4" />
                  {showStudentExclusion ? 'Auswahl ausblenden' : 'Schüler abwählen'}
                </button>
                <button
                  onClick={() => setShowClassSelector(!showClassSelector)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showClassSelector ? 'Einfache Auswahl' : 'Erweiterte Auswahl'}
                </button>
              </div>
            </div>

            {!showClassSelector ? (
              // Einfache Dropdown-Auswahl
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isGenerating || loading || classes.length === 0}
                className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold disabled:bg-gray-100"
              >
                {loading ? (
                  <option value="">Lade Klassen...</option>
                ) : classes.length === 0 ? (
                  <option value="">Keine Klassen verfügbar</option>
                ) : (
                  classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} ({classItem.students.length} Schüler)
                    </option>
                  ))
                )}
              </select>
            ) : (
              // Erweiterte Klassenauswahl
              <div className="space-y-4">
                {/* Schulauswahl */}
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  disabled={isGenerating || loading}
                  className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold disabled:bg-gray-100"
                >
                  <option value="">Schule wählen</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>

                {/* Suchfeld */}
                {selectedSchool && classes.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Klassen durchsuchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold"
                    />
                  </div>
                )}

                {/* Klassen Grid */}
                {selectedSchool && filteredClasses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded">
                    {filteredClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className={`p-3 border-2 rounded cursor-pointer transition-all ${
                          selectedClass === cls.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setSelectedClass(cls.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{cls.name}</div>
                            <div className="text-sm text-gray-600">{cls.students.length} Schüler</div>
                          </div>
                          {selectedClass === cls.id && (
                            <Check className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSchool && filteredClasses.length === 0 && !loading && (
                  <div className="text-center py-4 text-gray-500">
                    {searchTerm ? 'Keine Klassen gefunden' : 'Keine Klassen verfügbar'}
                  </div>
                )}
              </div>
            )}

            {currentClass && (
              <div className="mt-2 text-sm text-gray-600">
                Ausgewählt: <strong>{currentClass.name}</strong> | 
                Verfügbar: <strong>{availableStudents.length}</strong> von {currentClass.students.length} Schülern
                {excludedStudents.length > 0 && (
                  <span className="text-red-600"> | Ausgeschlossen: {excludedStudents.length}</span>
                )}
              </div>
            )}

            {classes.length === 0 && !loading && (
              <div className="mt-2 text-sm text-red-600">
                Keine Klassen gefunden. Bitte erstellen Sie zuerst Klassen im Klassenmanager.
              </div>
            )}

            {/* Schüler-Abwahl Bereich */}
            {showStudentExclusion && currentClass && (
              <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-purple-900">Schüler temporär abwählen</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={includeAllStudents}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Alle auswählen
                    </button>
                    <button
                      onClick={excludeAllStudents}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Alle abwählen
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {currentClass.students.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-2 rounded border transition-all ${
                        student.isExcluded
                          ? 'bg-red-100 border-red-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleStudentExclusion(student.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          student.isExcluded
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-white border-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {student.isExcluded && <Check className="h-3 w-3" />}
                      </button>
                      <span className={`font-medium ${student.isExcluded ? 'text-red-800 line-through' : 'text-gray-800'}`}>
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-purple-700">
                  Abgewählte Schüler werden nicht in die Ziehung einbezogen. Keine Änderung in der Datenbank.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weitere Einstellungen basierend auf Modus */}
        {mode === 'number' && !useNames && (
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Schüleranzahl
            </label>
            <input
              type="number"
              value={maxValue}
              min="2"
              onChange={(e) => setMaxValue(parseInt(e.target.value) || 2)}
              disabled={isGenerating}
              className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
            />
          </div>
        )}

        {mode === 'groups' && (
          <>
            {!useNames && (
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Schüleranzahl
                </label>
                <input
                  type="number"
                  value={maxValue}
                  min="2"
                  onChange={(e) => setMaxValue(parseInt(e.target.value) || 2)}
                  disabled={isGenerating}
                  className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Anzahl der Gruppen
              </label>
              <input
                type="number"
                value={numGroups}
                min="1"
                max={useNames ? availableStudents.length : maxValue}
                onChange={(e) => setNumGroups(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
                className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {mode === 'multiple' && (
          <>
            {!useNames && (
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Schüleranzahl
                </label>
                <input
                  type="number"
                  value={maxValue}
                  min="2"
                  onChange={(e) => setMaxValue(parseInt(e.target.value) || 2)}
                  disabled={isGenerating}
                  className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Anzahl der Auswahlen
              </label>
              <input
                type="number"
                value={numNumbers}
                min="1"
                max={useNames ? availableStudents.length : maxValue}
                onChange={(e) => setNumNumbers(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
                className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {mode === 'submission' && (
          <>
            {!useNames && (
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Schüleranzahl
                </label>
                <input
                  type="number"
                  value={maxValue}
                  min="2"
                  onChange={(e) => setMaxValue(parseInt(e.target.value) || 2)}
                  disabled={isGenerating}
                  className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Anzahl der Wochen
              </label>
              <input
                type="number"
                value={numWeeks}
                min="1"
                onChange={(e) => setNumWeeks(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
                className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Automatische Verteilung
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDistribute}
                    onChange={(e) => setAutoDistribute(e.target.checked)}
                    className="w-6 h-6 border-2 border-gray-900 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-lg font-medium text-gray-900">
                    Schüler automatisch auf Wochen verteilen
                  </span>
                </label>
              </div>
              {autoDistribute && getDistributionInfo() && (
                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">{getDistributionInfo()}</span>
                  </div>
                </div>
              )}
            </div>
            {!autoDistribute && (
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Schüler pro Woche
                </label>
                <input
                  type="number"
                  value={studentsPerWeek}
                  min="1"
                  max={useNames ? availableStudents.length : maxValue}
                  onChange={(e) => setStudentsPerWeek(parseInt(e.target.value) || 1)}
                  disabled={isGenerating}
                  className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Display Area */}
      <div className="bg-gray-50 border-4 border-gray-900 p-12 mb-8">
        <div className="text-center">
          {mode === 'number' ? (
            <>
              <div className="mb-6">
                <span className="text-lg font-medium text-gray-700">
                  {useNames && currentClass 
                    ? `Zufälliger Schüler aus ${currentClass.name}`
                    : `Zufallszahl zwischen 1 und ${maxValue}`
                  }
                </span>
                {useNames && currentClass && excludedStudents.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    {excludedStudents.length} Schüler abgewählt
                  </div>
                )}
              </div>
              
              <div className={`text-6xl font-black mb-8 transition-all duration-300 ${getAnimationClasses()}`}>
                {getDisplayText()}
              </div>

              {(finalNumber || finalName) && (
                <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-800 mb-2">
                    🎉 Ergebnis: {finalName || finalNumber}
                  </div>
                  <div className="text-green-700">
                    {useNames ? 'Der Schüler wurde erfolgreich ausgewählt!' : 'Die Zufallszahl wurde erfolgreich generiert!'}
                  </div>
                </div>
              )}
            </>
          ) : mode === 'groups' ? (
            <>
              <div className="mb-6">
                <span className="text-lg font-medium text-gray-700">
                  {useNames && currentClass 
                    ? `${availableStudents.length} Schüler in ${numGroups} Gruppen`
                    : `${maxValue} Schüler in ${numGroups} Gruppen`
                  }
                </span>
                {useNames && currentClass && excludedStudents.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    {excludedStudents.length} Schüler abgewählt
                  </div>
                )}
              </div>
              
              {(groups.length > 0 || nameGroups.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(useNames ? nameGroups : groups).map((group, index) => (
                    <div key={index} className="bg-white border-2 border-gray-300 p-4 rounded-lg">
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Gruppe {index + 1}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.map((student, studentIndex) => (
                          <span 
                            key={studentIndex} 
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium"
                          >
                            {useNames ? `${(student as Student).firstName} ${(student as Student).lastName}` : student}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        {group.length} Schüler
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-8xl font-black mb-8 transition-all duration-300 ${getAnimationClasses()}`}>
                  ?
                </div>
              )}
            </>
          ) : mode === 'multiple' ? (
            <>
              <div className="mb-6">
                <span className="text-lg font-medium text-gray-700">
                  {useNames && currentClass
                    ? `${numNumbers} zufällige Schüler aus ${currentClass.name}`
                    : `${numNumbers} zufällige Schüler von ${maxValue}`
                  }
                </span>
                {useNames && currentClass && excludedStudents.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    {excludedStudents.length} Schüler abgewählt
                  </div>
                )}
              </div>
              
              {(multipleNumbers.length > 0 || multipleNames.length > 0) ? (
                <div className="bg-white border-2 border-gray-300 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    {useNames ? 'Ausgewählte Schüler' : 'Ausgewählte Zahlen'}
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {(useNames ? multipleNames : multipleNumbers).map((item, index) => (
                      <span 
                        key={index} 
                        className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold text-lg"
                      >
                        {useNames ? `${(item as Student).firstName} ${(item as Student).lastName}` : item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`text-8xl font-black mb-8 transition-all duration-300 ${getAnimationClasses()}`}>
                  ?
                </div>
              )}
            </>
          ) : mode === 'submission' ? (
            <>
              <div className="mb-6">
                <span className="text-lg font-medium text-gray-700">
                  Abgabeplan für {numWeeks} Wochen
                </span>
                {useNames && currentClass && excludedStudents.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    {excludedStudents.length} Schüler abgewählt
                  </div>
                )}
                {autoDistribute && getDistributionInfo() && (
                  <div className="text-sm text-gray-600 mt-2">
                    {getDistributionInfo()}
                  </div>
                )}
              </div>
              
              {(submissionSchedule.length > 0 || nameSubmissionSchedule.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(useNames ? nameSubmissionSchedule : submissionSchedule).map((week, index) => (
                    <div key={index} className="bg-white border-2 border-gray-300 p-4 rounded-lg">
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Woche {index + 1}</h3>
                      <div className="flex flex-wrap gap-2">
                        {week.map((student, studentIndex) => (
                          <span 
                            key={studentIndex} 
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium"
                          >
                            {useNames ? `${(student as Student).firstName} ${(student as Student).lastName}` : student}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        {week.length} Schüler
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-8xl font-black mb-8 transition-all duration-300 ${getAnimationClasses()}`}>
                  ?
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6">
        <button
          onClick={generateRandomNumber}
          disabled={isGenerateDisabled()}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {mode === 'number' ? (useNames ? 'Schüler auswählen' : 'Zufallszahl generieren') : 
               mode === 'groups' ? 'Gruppen einteilen' : 
               mode === 'multiple' ? (useNames ? 'Schüler auswählen' : 'Zahlen generieren') : 
               'Abgabeplan erstellen'}
            </>
          )}
        </button>

        {(currentNumber !== null || currentName !== null || finalNumber || finalName || groups.length > 0 || nameGroups.length > 0 || multipleNumbers.length > 0 || multipleNames.length > 0 || submissionSchedule.length > 0 || nameSubmissionSchedule.length > 0) && (
          <button
            onClick={reset}
            disabled={isGenerating}
            className="flex items-center gap-3 px-6 py-4 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <RotateCcw className="h-5 w-5" />
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Loading Status */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-50 border-2 border-blue-200 px-6 py-3 rounded-lg">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <span className="font-bold text-blue-800">
              Lade Klassendaten...
            </span>
          </div>
        </div>
      )}

      {/* Animation Status */}
      {isGenerating && !loading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-50 border-2 border-blue-200 px-6 py-3 rounded-lg">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <span className="font-bold text-blue-800">
              {animationPhase === 'spinning' && (
                mode === 'number' ? (useNames ? 'Schüler werden gemischt...' : 'Zahlen werden gemischt...') : 
                mode === 'groups' ? 'Schüler werden gemischt...' : 
                mode === 'multiple' ? (useNames ? 'Schüler werden gemischt...' : 'Zahlen werden gemischt...') : 
                'Abgabeplan wird erstellt...'
              )}
              {animationPhase === 'slowing' && 'Auswahl wird getroffen...'}
              {animationPhase === 'final' && 'Ergebnis wird enthüllt...'}
            </span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-10 bg-gray-50 border-2 border-gray-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-gray-900" />
          <h4 className="text-lg font-bold text-gray-900">Funktionsweise</h4>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          {mode === 'number' ? (
            <>
              <p><strong>Phase 1 (0-3s):</strong> Schnelle {useNames ? 'Schüler' : 'Zahlen'}-Rotation für maximale Spannung</p>
              <p><strong>Phase 2 (3-4.5s):</strong> Verlangsamung der Animation</p>
              <p><strong>Phase 3 (4.5-5s):</strong> Finale Enthüllung der {useNames ? 'Schülerauswahl' : 'Zufallszahl'}</p>
            </>
          ) : mode === 'groups' ? (
            <>
              <p><strong>Phase 1 (0-4s):</strong> Schüler werden zufällig gemischt und auf Gruppen verteilt</p>
              <p><strong>Phase 2 (4-5s):</strong> Finale Gruppenaufteilung wird angezeigt</p>
            </>
          ) : mode === 'multiple' ? (
            <>
              <p><strong>Phase 1 (0-4s):</strong> {useNames ? 'Schüler' : 'Zahlen'} werden zufällig gemischt</p>
              <p><strong>Phase 2 (4-5s):</strong> Ausgewählte {useNames ? 'Schüler' : 'Zahlen'} werden angezeigt</p>
            </>
          ) : mode === 'submission' ? (
            <>
              <p><strong>Automatische Verteilung:</strong> Schüler werden optimal auf die Wochen verteilt</p>
              <p><strong>Phase 1 (0-4s):</strong> Schüler werden zufällig gemischt und auf Wochen verteilt</p>
              <p><strong>Phase 2 (4-5s):</strong> Finaler Abgabeplan wird angezeigt</p>
            </>
          ) : null}
          <p className="text-xs text-gray-600 mt-4">
            {useNames 
              ? 'Abgewählte Schüler werden nicht in die Ziehung einbezogen. Die Änderungen sind temporär und werden nicht in der Datenbank gespeichert.'
              : 'Alle Zahlen werden mit echtem Zufall generiert. Jede Zahl im definierten Bereich hat die gleiche Wahrscheinlichkeit.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default RandomGenerator;