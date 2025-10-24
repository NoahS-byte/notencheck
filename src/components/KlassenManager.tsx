import React, { useState, useEffect } from 'react';
import { Users, Check, X, Search, Filter, School, BookOpen, AlertCircle, Info } from 'lucide-react';
import { SchoolService, SchoolClass, School as SchoolType } from '../services/schoolService';

interface KlassenManagerProps {
  currentUserId: string;
}

interface ClassWithSelection extends SchoolClass {
  is_selected?: boolean;
}

const KlassenManager: React.FC<KlassenManagerProps> = ({ currentUserId }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<ClassWithSelection[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedSchool) {
      loadClasses();
    }
  }, [selectedSchool]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const schoolsData = await SchoolService.getSchools(currentUserId);
      setSchools(schoolsData);

      // Auto-select first school if available
      if (schoolsData.length > 0 && !selectedSchool) {
        setSelectedSchool(schoolsData[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const classesData = await SchoolService.getClasses(currentUserId, selectedSchool);
      
      // Hier laden wir die Auswahl-Status für den aktuellen Benutzer
      // Da wir keine user_classes Tabelle haben, verwenden wir eine temporäre Lösung
      const classesWithSelection: ClassWithSelection[] = classesData.map(cls => ({
        ...cls,
        is_selected: cls.name.includes('Demo') || cls.name.includes('Test') // Demo-Klassen sind vorausgewählt
      }));

      setClasses(classesWithSelection);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Fehler beim Laden der Klassen');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClassSelection = async (classId: string, currentlySelected: boolean) => {
    try {
      setIsLoading(true);
      setError('');

      // TEMPORÄRE LÖSUNG: Nur lokalen State aktualisieren
      // In einer echten App würden wir hier die Zuordnung in der Datenbank speichern
      // z.B. mit einer user_classes Tabelle
      
      setClasses(prev => prev.map(cls => 
        cls.id === classId ? { ...cls, is_selected: !currentlySelected } : cls
      ));

      setSuccess(`Klasse ${currentlySelected ? 'abgewählt' : 'ausgewählt'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling class selection:', error);
      setError('Fehler beim Aktualisieren der Klassenauswahl');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = !searchTerm || 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const selectedSchoolData = schools.find((s) => s.id === selectedSchool);
  const selectedClassesCount = classes.filter(cls => cls.is_selected).length;
  const demoClassesCount = classes.filter(cls => cls.name.includes('Demo') || cls.name.includes('Test')).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">Meine Klassen</h2>
      </div>

      {/* Wichtiger Hinweis zu Demo-Klassen */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900 mb-2">Wichtiger Hinweis zu Klassen</h4>
            <p className="text-amber-800 text-sm mb-2">
              <strong>Die richtigen Klassen müssen zuerst vom Schulleiter oder Administrator erstellt werden</strong> und sind erst ab dann für Sie verfügbar.
            </p>
            <p className="text-amber-700 text-sm">
              Die <strong>Demo-Klassen</strong> stellen lediglich Testklassen dar, mit denen Sie einzelne Funktionen ausprobieren können. Diese werden automatisch vorausgewählt.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-3 rounded mb-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* School Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schule auswählen
        </label>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="">Schule wählen</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
      </div>

      {/* Search */}
      {selectedSchool && classes.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Klassen suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Classes Grid */}
      {selectedSchool && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredClasses.map((cls) => {
            const isDemoClass = cls.name.includes('Demo') || cls.name.includes('Test');
            
            return (
              <div
                key={cls.id}
                className={`border rounded-lg p-4 transition-all relative ${
                  cls.is_selected 
                    ? isDemoClass 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Demo Class Badge */}
                {isDemoClass && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Demo
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    {cls.subject && (
                      <p className="text-sm text-gray-600">{cls.subject}</p>
                    )}
                    {cls.gradeLevel && (
                      <p className="text-sm text-gray-500">{cls.gradeLevel}. Klasse</p>
                    )}
                    {cls.teacher && (
                      <p className="text-xs text-gray-400">
                        Lehrer: {cls.teacher.displayName || cls.teacher.email}
                      </p>
                    )}
                    {cls.studentCount !== undefined && (
                      <p className="text-xs text-gray-400">
                        {cls.studentCount} Schüler
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleClassSelection(cls.id, cls.is_selected || false)}
                    disabled={isLoading}
                    className={`ml-3 p-2 rounded transition-colors ${
                      cls.is_selected
                        ? isDemoClass
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    title={cls.is_selected ? 'Klasse abwählen' : 'Klasse auswählen'}
                  >
                    {cls.is_selected ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                  cls.is_selected 
                    ? isDemoClass
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {cls.is_selected 
                    ? isDemoClass 
                      ? 'Demo Klasse ausgewählt' 
                      : 'Ausgewählt'
                    : 'Nicht ausgewählt'
                  }
                </div>

                {/* Demo Class Info */}
                {isDemoClass && (
                  <div className="mt-2 pt-2 border-t border-amber-200">
                    <p className="text-xs text-amber-600">
                      Diese Demo-Klasse dient zum Testen der Funktionen.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty States */}
      {!selectedSchool && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <School className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Wählen Sie eine Schule</p>
          <p className="text-sm">Um verfügbare Klassen anzuzeigen</p>
        </div>
      )}

      {selectedSchool && filteredClasses.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">
            {searchTerm 
              ? 'Keine Klassen gefunden' 
              : 'Keine Klassen verfügbar'
            }
          </p>
          <p className="text-sm">
            {searchTerm 
              ? 'Versuchen Sie andere Suchbegriffe' 
              : 'Neue Klassen können vom Administrator erstellt werden'
            }
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="block font-medium">Ausgewählte Klassen</span>
            <span className="text-lg font-bold text-blue-600">{selectedClassesCount}</span>
          </div>
          <div>
            <span className="block font-medium">Demo-Klassen</span>
            <span className="text-lg font-bold text-amber-600">{demoClassesCount}</span>
          </div>
          <div>
            <span className="block font-medium">Verfügbare Klassen</span>
            <span className="text-lg font-bold text-gray-600">{classes.length}</span>
          </div>
          <div>
            <span className="block font-medium">Echte Klassen</span>
            <span className="text-lg font-bold text-green-600">{classes.length - demoClassesCount}</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">So funktioniert's</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Demo-Klassen</strong> sind vorausgewählt und dienen zum Testen der Funktionen</li>
              <li>• <strong>Echte Klassen</strong> müssen vom Schulleiter/Administrator erstellt werden</li>
              <li>• Wählen Sie Klassen aus, die Sie verwalten möchten</li>
              <li>• Ausgewählte Klassen stehen für Noteneingabe, Sitzplan und mehr zur Verfügung</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Admin Contact Info */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-gray-600 mt-0.5" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Klassen erstellen lassen</h4>
            <p className="text-gray-700 text-sm">
              Für die Erstellung echter Klassen wenden Sie sich bitte an Ihren Schulleiter oder Administrator. 
              Diese können im Schulmanager neue Klassen anlegen und Ihnen zuweisen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KlassenManager;