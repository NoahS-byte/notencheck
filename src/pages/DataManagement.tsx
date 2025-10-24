import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  GraduationCap, 
  UserPlus, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Shield,
  LogOut,
  AlertTriangle,
  Check,
  BookOpen,
  UserCheck,
  Crown,
  Mail,
  Phone,
  Download,
  Upload,
  Calendar,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Gift
} from 'lucide-react';
import { SchoolService, School, SchoolClass, SchoolStudent, User, TeacherSchoolAssignment } from '../services/schoolService';
import { useNavigate } from 'react-router-dom';
import { AuthService, AuthUser } from '../services/authService';

const DataManagement: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Datenzustände
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<TeacherSchoolAssignment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // UI Zustände
  const [activeSection, setActiveSection] = useState<'schools' | 'classes' | 'students' | 'teachers' | 'users'>('schools');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // Modal Zustände
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  // Formular Zustände
  const [schoolForm, setSchoolForm] = useState({ name: '', address: '', contactEmail: '' });
  const [classForm, setClassForm] = useState({ name: '', gradeLevel: '', subject: '', teacherId: '', schoolId: '' });
  const [studentForm, setStudentForm] = useState({ 
    firstName: '', lastName: '', email: '', studentNumber: '', classId: '' 
  });
  const [teacherForm, setTeacherForm] = useState({ email: '', displayName: '', phone: '' });
  const [assignmentForm, setAssignmentForm] = useState({ 
    teacherId: '', schoolId: '', role: 'teacher' as 'teacher' | 'head_teacher' | 'subject_teacher' | 'school_manager', subject: '' 
  });
  const [bulkInput, setBulkInput] = useState('');

  // Admin-Zugriff prüfen
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Prüfe ob Benutzer in localStorage gespeichert ist
      const savedUserId = localStorage.getItem('currentUser');
      console.log('🔍 Saved User ID from localStorage:', savedUserId);
      
      if (!savedUserId) {
        setError('Kein Benutzer eingeloggt');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Lade Benutzerdaten mit AuthService
      console.log('📥 Loading user data for ID:', savedUserId);
      const userData = await AuthService.getCurrentUser(savedUserId);
      console.log('👤 User data loaded:', userData);
      
      if (!userData) {
        setError('Benutzer nicht gefunden');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Prüfe Admin-Berechtigung
      if (!userData.isAdmin) {
        setError('Zugriff verweigert: Keine Administrator-Berechtigung');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Setze Benutzer und lade Daten
      setCurrentUser(userData);
      setIsAdmin(true);
      await loadInitialData();
      
    } catch (error) {
      console.error('❌ Error checking admin access:', error);
      setError('Fehler beim Überprüfen der Berechtigungen: ' + (error as Error).message);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    if (!currentUser) return;
    
    try {
      console.log('📊 Loading initial data for admin:', currentUser.id);
      
      const [
        schoolsData, 
        usersData, 
        assignmentsData,
        allUsersData
      ] = await Promise.all([
        SchoolService.getSchools(currentUser.id),
        SchoolService.getAllUsers(),
        SchoolService.getTeacherSchoolAssignments(),
        SchoolService.getAllUsers()
      ]);

      console.log('📦 Data loaded:', {
        schools: schoolsData.length,
        users: usersData.length,
        assignments: assignmentsData.length,
        allUsers: allUsersData.length
      });

      setSchools(schoolsData);
      setTeachers(usersData.filter(u => u.role === 'teacher' || u.role === 'school_manager'));
      setAssignments(assignmentsData);
      setAllUsers(allUsersData);
      
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setError('Fehler beim Laden der Daten: ' + (error as Error).message);
    }
  };

  const loadClasses = async (schoolId?: string) => {
    if (!currentUser) return;
    
    try {
      const classesData = await SchoolService.getClasses(currentUser.id, schoolId);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Fehler beim Laden der Klassen');
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      const studentsData = await SchoolService.getStudents(classId);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Fehler beim Laden der Schüler');
    }
  };

  // Hilfsfunktionen für Nachrichten
  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Schule erstellen
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError('');

      const newSchool = await SchoolService.createSchool(
        currentUser.id,
        schoolForm.name,
        schoolForm.address,
        schoolForm.contactEmail
      );

      setSchools(prev => [...prev, newSchool]);
      setShowSchoolModal(false);
      setSchoolForm({ name: '', address: '', contactEmail: '' });
      showMessage('Schule erfolgreich erstellt', 'success');
    } catch (error) {
      console.error('Error creating school:', error);
      showMessage('Fehler beim Erstellen der Schule: ' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Klasse erstellen
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError('');

      const newClass = await SchoolService.createClass(
        classForm.schoolId,
        classForm.name,
        classForm.gradeLevel ? parseInt(classForm.gradeLevel) : undefined,
        classForm.subject,
        classForm.teacherId || undefined
      );

      setClasses(prev => [...prev, newClass]);
      setShowClassModal(false);
      setClassForm({ name: '', gradeLevel: '', subject: '', teacherId: '', schoolId: '' });
      showMessage('Klasse erfolgreich erstellt', 'success');
    } catch (error) {
      console.error('Error creating class:', error);
      showMessage('Fehler beim Erstellen der Klasse: ' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Schüler erstellen
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');

      const newStudent = await SchoolService.createStudent(
        studentForm.classId,
        studentForm.email,
        studentForm.firstName,
        studentForm.lastName,
        studentForm.studentNumber
      );

      setStudents(prev => [...prev, newStudent]);
      setShowStudentModal(false);
      setStudentForm({ firstName: '', lastName: '', email: '', studentNumber: '', classId: '' });
      showMessage('Schüler erfolgreich erstellt', 'success');
    } catch (error) {
      console.error('Error creating student:', error);
      showMessage('Fehler beim Erstellen des Schülers: ' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk Import Schüler
  const handleBulkImportStudents = async () => {
    if (!bulkInput.trim() || !selectedClass) {
      showMessage('Eingabedaten und Klasse sind erforderlich', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const createdStudents = await SchoolService.bulkCreateStudents(selectedClass, bulkInput);
      await loadStudents(selectedClass);
      setBulkInput('');
      setShowBulkImport(false);
      showMessage(`${createdStudents.length} Schüler erfolgreich importiert`, 'success');
    } catch (error) {
      console.error('Error bulk importing students:', error);
      showMessage('Fehler beim Importieren der Schüler: ' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Lehrer zu Schule zuweisen
  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError('');

      const newAssignment = await SchoolService.assignTeacherToSchool(
        assignmentForm.teacherId,
        assignmentForm.schoolId,
        assignmentForm.role,
        assignmentForm.subject,
        currentUser.id
      );

      setAssignments(prev => [newAssignment, ...prev]);
      setShowAssignmentModal(false);
      setAssignmentForm({ teacherId: '', schoolId: '', role: 'teacher', subject: '' });
      showMessage('Lehrer erfolgreich zugewiesen', 'success');
    } catch (error) {
      console.error('Error assigning teacher:', error);
      showMessage('Fehler beim Zuweisen des Lehrers: ' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Lösch-Funktionen
  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Schule löschen möchten?')) return;
    
    try {
      await SchoolService.deleteSchool(schoolId);
      setSchools(prev => prev.filter(s => s.id !== schoolId));
      showMessage('Schule erfolgreich gelöscht', 'success');
    } catch (error) {
      showMessage('Fehler beim Löschen der Schule: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Klasse löschen möchten?')) return;
    
    try {
      await SchoolService.deleteClass(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
      if (selectedClass === classId) {
        setSelectedClass('');
        setStudents([]);
      }
      showMessage('Klasse erfolgreich gelöscht', 'success');
    } catch (error) {
      showMessage('Fehler beim Löschen der Klasse: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Schüler löschen möchten?')) return;
    
    try {
      await SchoolService.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      showMessage('Schüler erfolgreich gelöscht', 'success');
    } catch (error) {
      showMessage('Fehler beim Löschen des Schülers: ' + (error as Error).message, 'error');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Zuordnung entfernen möchten?')) return;
    
    try {
      await SchoolService.removeTeacherFromSchool(assignmentId);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      showMessage('Zuordnung erfolgreich entfernt', 'success');
    } catch (error) {
      showMessage('Fehler beim Entfernen der Zuordnung: ' + (error as Error).message, 'error');
    }
  };

  // User-Rollen-Management
  const handleUpdateUserRole = async (userId: string, updates: { isAdmin?: boolean; isSchoolManager?: boolean }) => {
    try {
      setIsLoading(true);
      await SchoolService.updateUserRole(userId, updates);
      await loadInitialData(); // Daten neu laden
      showMessage('Benutzerrolle erfolgreich aktualisiert', 'success');
    } catch (error) {
      showMessage('Fehler beim Aktualisieren der Benutzerrolle: ' + (error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export-Funktionen
  const exportStudentEmails = () => {
    const emails = students.map(s => s.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schueler-emails-${classes.find(c => c.id === selectedClass)?.name || 'export'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter-Funktionen
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Payment Status Icons
  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trial': return <Gift className="h-5 w-5 text-purple-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'free': return <Gift className="h-5 w-5 text-blue-600" />;
      default: return <XCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'free': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Zugriffsverweigerung
  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Shield className="h-24 w-24 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Zugriff verweigert</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Sie haben keine Administrator-Berechtigungen für diesen Bereich.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              Debug-Informationen:
            </p>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>User ID: {currentUser?.id || 'Nicht geladen'}</p>
              <p>isAdmin: {isAdmin ? 'true' : 'false'}</p>
              <p>is_admin in DB: {currentUser?.isAdmin ? 'true' : 'false'}</p>
              <p>Fehler: {error || 'Kein Fehler'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            Zurück zur Hauptseite
          </button>
        </div>
      </div>
    );
  }

  // Ladezustand
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Überprüfe Berechtigungen...</div>
          <div className="text-sm text-gray-500 mt-2">
            User: {currentUser?.id ? 'Geladen' : 'Lade...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600">Vollständige Verwaltung von Schulen, Klassen und Benutzern</p>
                <div className="text-xs text-green-600 font-medium mt-1">
                  ✅ Admin-Berechtigung bestätigt
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Zurück
            </button>
          </div>

          {/* Navigation */}
          <div className="flex space-x-8 border-b">
            {[
              { id: 'schools', label: 'Schulen', icon: Building },
              { id: 'classes', label: 'Klassen', icon: BookOpen },
              { id: 'students', label: 'Schüler', icon: GraduationCap },
              { id: 'teachers', label: 'Lehrer', icon: Users },
              { id: 'users', label: 'Alle Benutzer', icon: UserCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveSection(id as any);
                  if (id === 'classes') loadClasses();
                  if (id === 'users') loadInitialData();
                }}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="h-5 w-5" />
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Debug Info für Admins */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <span className="font-medium">Admin-Debug:</span>
            <span>User: {currentUser?.email}</span>
            <span>•</span>
            <span>ID: {currentUser?.id}</span>
            <span>•</span>
            <span>isAdmin: {currentUser?.isAdmin ? 'true' : 'false'}</span>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`${
                activeSection === 'schools' ? 'Schulen' : 
                activeSection === 'classes' ? 'Klassen' : 
                activeSection === 'students' ? 'Schüler' : 
                activeSection === 'teachers' ? 'Lehrer' : 
                'Benutzer'
              } suchen...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {activeSection === 'schools' && (
              <button
                onClick={() => setShowSchoolModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Neue Schule
              </button>
            )}
            {activeSection === 'classes' && (
              <button
                onClick={() => {
                  setShowClassModal(true);
                  loadClasses();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Neue Klasse
              </button>
            )}
            {activeSection === 'students' && (
              <div className="flex gap-3">
                {students.length > 0 && (
                  <button
                    onClick={exportStudentEmails}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    E-Mails exportieren
                  </button>
                )}
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Schnell-Import
                </button>
                <button
                  onClick={() => setShowStudentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Schüler hinzufügen
                </button>
              </div>
            )}
            {activeSection === 'teachers' && (
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Lehrer zuweisen
              </button>
            )}
          </div>
        </div>

        {/* Schools Section */}
        {activeSection === 'schools' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{school.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{school.address || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{school.contactEmail || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(school.createdAt).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setClassForm(prev => ({ ...prev, schoolId: school.id }));
                            setShowClassModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Klasse hinzufügen
                        </button>
                        <button
                          onClick={() => {
                            setAssignmentForm(prev => ({ ...prev, schoolId: school.id }));
                            setShowAssignmentModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Lehrer zuweisen
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(school.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSchools.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Schulen gefunden</h3>
                <p className="text-gray-600">Erstellen Sie Ihre erste Schule</p>
              </div>
            )}
          </div>
        )}

        {/* Classes Section */}
        {activeSection === 'classes' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klasse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lehrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fach & Stufe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schüler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{cls.school?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {cls.teacher?.displayName || cls.teacher?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {cls.subject || '-'}
                        {cls.gradeLevel && ` • ${cls.gradeLevel}. Klasse`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{cls.studentCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedClass(cls.id);
                            setStudentForm(prev => ({ ...prev, classId: cls.id }));
                            setActiveSection('students');
                            loadStudents(cls.id);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Schüler anzeigen
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClasses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Klassen gefunden</h3>
                <p className="text-gray-600">Erstellen Sie Ihre erste Klasse</p>
              </div>
            )}
          </div>
        )}

        {/* Students Section */}
        {activeSection === 'students' && (
          <div className="space-y-6">
            {/* Class Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klasse auswählen
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  if (e.target.value) loadStudents(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Klasse wählen</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.school?.name}
                    {cls.subject && ` (${cls.subject})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Students List */}
            {selectedClass && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      Schülerliste - {classes.find(c => c.id === selectedClass)?.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {filteredStudents.length} von {students.length} Schülern
                      </span>
                    </div>
                  </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schüler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-Mail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schülernummer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.studentNumber || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Löschen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredStudents.length === 0 && selectedClass && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">
                      {searchTerm ? 'Keine Schüler gefunden' : 'Keine Schüler in dieser Klasse'}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Fügen Sie den ersten Schüler hinzu'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!selectedClass && (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Wählen Sie eine Klasse aus</p>
                <p className="text-sm">Um Schüler anzuzeigen und zu verwalten</p>
              </div>
            )}
          </div>
        )}

        {/* Teachers Section */}
        {activeSection === 'teachers' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lehrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schulen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => {
                  const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id && a.isActive);
                  
                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {teacher.displayName || teacher.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{teacher.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{teacher.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {teacherAssignments.slice(0, 3).map((assignment) => (
                            <span
                              key={assignment.id}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                            >
                              {assignment.school?.name} ({assignment.role})
                            </span>
                          ))}
                          {teacherAssignments.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{teacherAssignments.length - 3} weitere
                            </span>
                          )}
                          {teacherAssignments.length === 0 && (
                            <span className="text-sm text-gray-500">Keine Schulen</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setAssignmentForm(prev => ({ ...prev, teacherId: teacher.id }));
                            setShowAssignmentModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Schule zuweisen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Lehrer gefunden</h3>
                <p className="text-gray-600">Weisen Sie Lehrern Schulen zu</p>
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letzter Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold text-sm rounded-full">
                          {(user.displayName?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.displayName || 'Unbenannter Benutzer'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Erstellt: {new Date(user.createdAt).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isAdmin
                            ? 'bg-red-100 text-red-800'
                            : user.isSchoolManager
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isAdmin
                            ? 'Administrator'
                            : user.isSchoolManager
                            ? 'Schulmanager'
                            : 'Lehrer'}
                        </span>
                        {user.isAdmin && <Crown className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon((user as any)?.paymentStatus)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getPaymentStatusColor((user as any)?.paymentStatus)
                        }`}>
                          {((user as any)?.paymentStatus || 'free').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('de-DE')
                        : 'Nie'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateUserRole(user.id, { isAdmin: !user.isAdmin })}
                          className={`px-2 py-1 text-xs rounded ${
                            user.isAdmin 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {user.isAdmin ? 'Admin entfernen' : 'Zu Admin machen'}
                        </button>
                        <button
                          onClick={() => handleUpdateUserRole(user.id, { isSchoolManager: !user.isSchoolManager })}
                          className={`px-2 py-1 text-xs rounded ${
                            user.isSchoolManager 
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {user.isSchoolManager ? 'Schulmanager entfernen' : 'Zu Schulmanager machen'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Benutzer gefunden</h3>
                <p className="text-gray-600">Es sind keine Benutzer im System vorhanden</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {/* School Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Neue Schule erstellen</h3>
            <form onSubmit={handleCreateSchool}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schulname *
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolForm.name}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Name der Schule"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={schoolForm.address}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Straße, Hausnummer, PLZ, Ort"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kontakt E-Mail
                  </label>
                  <input
                    type="email"
                    value={schoolForm.contactEmail}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="info@schule.de"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Erstellt...' : 'Schule erstellen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Neue Klasse erstellen</h3>
            <form onSubmit={handleCreateClass}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klassenname *
                  </label>
                  <input
                    type="text"
                    required
                    value={classForm.name}
                    onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="z.B. 5a, Mathe GK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schule *
                  </label>
                  <select
                    required
                    value={classForm.schoolId}
                    onChange={(e) => setClassForm(prev => ({ ...prev, schoolId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Schule wählen</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jahrgangsstufe
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="13"
                    value={classForm.gradeLevel}
                    onChange={(e) => setClassForm(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fach
                  </label>
                  <input
                    type="text"
                    value={classForm.subject}
                    onChange={(e) => setClassForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="z.B. Mathematik, Deutsch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lehrer
                  </label>
                  <select
                    value={classForm.teacherId}
                    onChange={(e) => setClassForm(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Kein Lehrer</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.displayName || teacher.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Erstellt...' : 'Klasse erstellen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Neuen Schüler erstellen</h3>
            <form onSubmit={handleCreateStudent}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vorname
                  </label>
                  <input
                    type="text"
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Max"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nachname
                  </label>
                  <input
                    type="text"
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="max.mustermann@schule.de"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schüler-Nummer
                  </label>
                  <input
                    type="text"
                    value={studentForm.studentNumber}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, studentNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klasse *
                  </label>
                  <select
                    required
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Klasse wählen</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.school?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Erstellt...' : 'Schüler erstellen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Schüler Schnell-Import</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schülerdaten (eine pro Zeile im Format) *
                </label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 font-mono text-sm"
                  rows={8}
                  placeholder={`U[(Vorname);(Nachname);(Email);(Schülernummer)]
U[(Ricarda);(Lang);(r.lang@mosengymnasium.de);(S0009218)]
U[(Kollin);(Weller);(k.weller@mosengymnasium.de);(S0009219)]
U[(Max);(Mustermann);(max.mustermann@mosengymnasium.de);(S0009220)]`}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Format-Hilfe:</h4>
                <p className="text-sm text-blue-800">
                  <strong>Pro Zeile:</strong> U[(Vorname);(Nachname);(Email);(Schülernummer)]
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Beispiel:</strong> U[(Max);(Mustermann);(max@schule.de);(S0001234)]
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBulkImportStudents}
                disabled={isLoading || !bulkInput.trim() || !selectedClass}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? 'Importiert...' : 'Schüler importieren'}
              </button>
              <button
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkInput('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Lehrer zu Schule zuweisen</h3>
            <form onSubmit={handleAssignTeacher}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lehrer *
                  </label>
                  <select
                    required
                    value={assignmentForm.teacherId}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Lehrer wählen</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.displayName || teacher.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schule *
                  </label>
                  <select
                    required
                    value={assignmentForm.schoolId}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, schoolId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Schule wählen</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rolle *
                  </label>
                  <select
                    required
                    value={assignmentForm.role}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="teacher">Lehrer</option>
                    <option value="head_teacher">Klassenlehrer</option>
                    <option value="subject_teacher">Fachlehrer</option>
                    <option value="school_manager">Schulmanager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fach (optional)
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="z.B. Mathematik, Deutsch"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Weist zu...' : 'Zuweisen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;