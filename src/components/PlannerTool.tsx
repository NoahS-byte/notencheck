import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Download, 
  Users, 
  School, 
  BookOpen, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';
import { PlannerService, PlannerEvent, Class, Student } from '../services/plannerService';
import { SchoolService, School as SchoolType } from '../services/schoolService';

interface PlannerToolProps {
  currentUserId: string;
}

const PlannerTool: React.FC<PlannerToolProps> = ({ currentUserId }) => {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [copiedFeedUrl, setCopiedFeedUrl] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'Hausaufgabe' as PlannerEvent['type'],
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '',
    location: '',
    selectedClasses: [] as string[]
  });

  // Lade Schulen und Klassen beim Start
  useEffect(() => {
    loadSchools();
  }, [currentUserId]);

  // Lade Klassen wenn Schule ausgewählt
  useEffect(() => {
    if (selectedSchool) {
      loadClasses();
    }
  }, [selectedSchool]);

  // Lade Events
  useEffect(() => {
    if (currentUserId) {
      loadEvents();
    }
  }, [currentUserId]);

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const schoolsData = await SchoolService.getSchools(currentUserId);
      setSchools(schoolsData);
      
      if (schoolsData.length > 0) {
        setSelectedSchool(schoolsData[0].id);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const classesData = await SchoolService.getClasses(currentUserId, selectedSchool);
      const classesWithDetails = await Promise.all(
        classesData.map(async (cls) => {
          const students = await SchoolService.getStudents(cls.id);
          return {
            ...cls,
            studentCount: students.length
          };
        })
      );
      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await PlannerService.getEvents(currentUserId);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadStudentsForClass = async (classId: string) => {
    try {
      const studentsData = await SchoolService.getStudents(classId);
      setStudents(studentsData);
      setSelectedClass(classId);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const createEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.startDate || eventForm.selectedClasses.length === 0) {
      alert('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    try {
      setIsLoading(true);
      const startDateTime = `${eventForm.startDate}T${eventForm.startTime}:00`;
      const endDateTime = eventForm.endDate && eventForm.endTime ? `${eventForm.endDate}T${eventForm.endTime}:00` : undefined;

      await PlannerService.createEvent(
        currentUserId,
        eventForm.title,
        eventForm.type,
        startDateTime,
        eventForm.selectedClasses,
        eventForm.description,
        eventForm.priority,
        endDateTime,
        eventForm.location
      );

      setEventForm({
        title: '',
        type: 'Hausaufgabe',
        description: '',
        priority: 'medium',
        startDate: '',
        startTime: '08:00',
        endDate: '',
        endTime: '',
        location: '',
        selectedClasses: []
      });
      setShowEventForm(false);
      await loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Fehler beim Erstellen des Termins');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Termin wirklich löschen?')) return;
    try {
      await PlannerService.deleteEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Fehler beim Löschen des Termins');
    }
  };

  const downloadICalFeed = async (classId: string, className: string) => {
    try {
      const icalContent = await PlannerService.generateICalFeed(classId);
      const blob = new Blob([icalContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unterrichtsplaner-${className}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading iCal feed:', error);
      alert('Fehler beim Herunterladen des Kalenders');
    }
  };

  const copyFeedUrl = (classId: string) => {
    const feedUrl = PlannerService.getICalFeedUrl(classId);
    navigator.clipboard.writeText(feedUrl).then(() => {
      setCopiedFeedUrl(classId);
      setTimeout(() => setCopiedFeedUrl(null), 2000);
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Klausur': return 'bg-white border-l-4 border-red-600';
      case 'Klassenarbeit': return 'bg-white border-l-4 border-blue-600';
      case 'Leistungskontrolle': return 'bg-white border-l-4 border-gray-600';
      case 'Hausaufgabe': return 'bg-white border-l-4 border-green-600';
      case 'Selbstarbeit': return 'bg-white border-l-4 border-purple-600';
      default: return 'bg-white border-l-4 border-gray-400';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Klausur': return '📝';
      case 'Klassenarbeit': return '📚';
      case 'Leistungskontrolle': return '✏️';
      case 'Hausaufgabe': return '🏠';
      case 'Selbstarbeit': return '💻';
      default: return '📅';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gefilterte Events
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Kommende Events (ab heute)
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Vergangene Events
  const pastEvents = filteredEvents
    .filter(event => new Date(event.startDate) < new Date())
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-900 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">UNTERRICHTSPLANER</h1>
                <p className="text-gray-600 font-medium mt-1">Professionelle Terminplanung für modernen Unterricht</p>
              </div>
            </div>
            <button 
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-3 px-6 py-4 bg-gray-900 text-white font-black hover:bg-gray-800 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Neuer Termin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-gray-900 p-6 text-center rounded-xl shadow-sm">
            <div className="text-3xl font-black text-gray-900">{events.length}</div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Gesamte Termine</div>
          </div>
          <div className="bg-white border-2 border-gray-900 p-6 text-center rounded-xl shadow-sm">
            <div className="text-3xl font-black text-gray-900">{classes.length}</div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Klassen</div>
          </div>
          <div className="bg-white border-2 border-gray-900 p-6 text-center rounded-xl shadow-sm">
            <div className="text-3xl font-black text-gray-900">{students.length}</div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Schüler</div>
          </div>
          <div className="bg-white border-2 border-gray-900 p-6 text-center rounded-xl shadow-sm">
            <div className="text-3xl font-black text-gray-900">
              {events.filter(e => new Date(e.startDate) >= new Date()).length}
            </div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Anstehend</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Klassen & Schüler */}
          <div className="xl:col-span-1 space-y-8">
            {/* Schulauswahl */}
            <div className="bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <School className="h-5 w-5 text-gray-900" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Schulauswahl</h3>
              </div>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900"
              >
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>

            {/* Klassenliste */}
            <div className="bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-gray-900" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Meine Klassen</h3>
              </div>
              
              {classes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <School className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Keine Klassen verfügbar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <div 
                      key={cls.id} 
                      className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${
                        selectedClass === cls.id 
                          ? 'border-blue-600 bg-blue-50 shadow-md' 
                          : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                      }`}
                      onClick={() => loadStudentsForClass(cls.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-900 text-lg">{cls.name}</div>
                        <div className="text-xs bg-gray-900 text-white px-2 py-1 rounded-full font-bold">
                          {cls.studentCount} Schüler
                        </div>
                      </div>
                      {cls.subject && (
                        <div className="text-sm text-gray-600 font-medium">{cls.subject}</div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadICalFeed(cls.id, cls.name);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors text-sm rounded-lg"
                        >
                          <Download className="h-3 w-3" /> iCal
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyFeedUrl(cls.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors text-sm rounded-lg"
                        >
                          {copiedFeedUrl === cls.id ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedFeedUrl === cls.id ? 'Kopiert!' : 'URL'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schülerliste */}
            <div className="bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-gray-900" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                  Schüler {selectedClass && `- ${classes.find(c => c.id === selectedClass)?.name}`}
                </h3>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Keine Schüler angezeigt</p>
                  <p className="text-sm">Wählen Sie eine Klasse aus</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {students.map((student, index) => (
                    <div 
                      key={student.id} 
                      className="bg-gray-50 border border-gray-300 p-3 rounded-lg flex justify-between items-center hover:bg-white hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                      {student.email && (
                        <a 
                          href={`mailto:${student.email}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          E-Mail
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Termine */}
          <div className="xl:col-span-2">
            <div className="bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-gray-900" />
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">Terminübersicht</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Termine suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900 w-full sm:w-64"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900"
                  >
                    <option value="all">Alle Typen</option>
                    <option value="Klausur">Klausur</option>
                    <option value="Klassenarbeit">Klassenarbeit</option>
                    <option value="Leistungskontrolle">Leistungskontrolle</option>
                    <option value="Hausaufgabe">Hausaufgabe</option>
                    <option value="Selbstarbeit">Selbstarbeit</option>
                  </select>
                </div>
              </div>

              {/* Kommende Termine */}
              <div className="mb-8">
                <h4 className="text-lg font-black text-gray-900 mb-4 border-b-2 border-gray-900 pb-2">
                  Kommende Termine ({upcomingEvents.length})
                </h4>
                
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Keine anstehenden Termine</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className={`${getEventTypeColor(event.type)} rounded-lg border-2 border-gray-900 shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl mt-1">{getEventTypeIcon(event.type)}</div>
                              <div>
                                <div className="font-black text-gray-900 text-lg">{event.title}</div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDate(event.startDate)} • {formatTime(event.startDate)}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </div>
                                  )}
                                  <span className={`font-bold ${getPriorityColor(event.priority)}`}>
                                    {event.priority === 'high' ? '🔴 Hoch' : 
                                     event.priority === 'medium' ? '🔵 Mittel' : '⚫ Niedrig'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(event.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {expandedEvent === event.id ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {expandedEvent === event.id && (
                          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                            {event.description && (
                              <div className="text-gray-700 mb-3 leading-relaxed">{event.description}</div>
                            )}
                            <div className="text-sm text-gray-600">
                              <strong>Zugewiesene Klassen:</strong>{' '}
                              {event.classes.map(clsId => {
                                const cls = classes.find(c => c.id === clsId);
                                return cls?.name;
                              }).filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vergangene Termine */}
              <div>
                <h4 className="text-lg font-black text-gray-900 mb-4 border-b-2 border-gray-900 pb-2">
                  Vergangene Termine ({pastEvents.length})
                </h4>
                
                {pastEvents.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Keine vergangenen Termine
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastEvents.slice(0, 5).map((event) => (
                      <div 
                        key={event.id} 
                        className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3 opacity-70"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                            <span className="font-medium text-gray-900">{event.title}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(event.startDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-gray-900">NEUEN TERMIN ERSTELLEN</h3>
              <button 
                onClick={() => setShowEventForm(false)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Titel *</label>
                  <input 
                    type="text" 
                    value={eventForm.title} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))} 
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900" 
                    placeholder="z.B. Mathematik Klausur" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Typ *</label>
                  <select 
                    value={eventForm.type} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as PlannerEvent['type'] }))} 
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900"
                  >
                    <option value="Klausur">📝 Klausur</option>
                    <option value="Klassenarbeit">📚 Klassenarbeit</option>
                    <option value="Leistungskontrolle">✏️ Leistungskontrolle</option>
                    <option value="Hausaufgabe">🏠 Hausaufgabe</option>
                    <option value="Selbstarbeit">💻 Selbstarbeit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Startdatum *</label>
                  <input 
                    type="date" 
                    value={eventForm.startDate} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))} 
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Startzeit</label>
                  <input 
                    type="time" 
                    value={eventForm.startTime} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))} 
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Priorität</label>
                  <select 
                    value={eventForm.priority} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))} 
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900"
                  >
                    <option value="low">⚫ Niedrig</option>
                    <option value="medium">🔵 Mittel</option>
                    <option value="high">🔴 Hoch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Ort</label>
                  <input 
                    type="text" 
                    value={eventForm.location} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))} 
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900" 
                    placeholder="z.B. Raum 101" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Beschreibung</label>
                <textarea 
                  value={eventForm.description} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))} 
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900 resize-none" 
                  rows={3} 
                  placeholder="Zusätzliche Informationen, Materialien, Hinweise..." 
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Klassen auswählen *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classes.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={eventForm.selectedClasses.includes(cls.id)} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEventForm(prev => ({ ...prev, selectedClasses: [...prev.selectedClasses, cls.id] }));
                          } else {
                            setEventForm(prev => ({ ...prev, selectedClasses: prev.selectedClasses.filter(id => id !== cls.id) }));
                          }
                        }} 
                        className="w-4 h-4 border-2 border-gray-900 rounded focus:ring-0 focus:ring-offset-0" 
                      />
                      <div>
                        <div className="font-bold text-gray-900">{cls.name}</div>
                        {cls.subject && <div className="text-sm text-gray-600">{cls.subject}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-900">
              <button 
                onClick={createEvent} 
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white font-black hover:bg-gray-800 disabled:opacity-50 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl"
              >
                {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Termin erstellen
              </button>
              <button 
                onClick={() => setShowEventForm(false)}
                className="flex-1 px-6 py-4 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerTool;