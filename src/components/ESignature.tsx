import React, { useState, useEffect } from 'react';
import {
  Send,
  Users,
  FileText,
  Mail,
  Settings,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  Shield,
  Zap,
  Bell,
  UserCheck,
  Calendar,
  ArrowRight,
  School,
  BookOpen,
  Link2,
} from 'lucide-react';

// Mock Data
const mockDocuments = [
  {
    id: '1',
    title: 'Einverständniserklärung Klassenfahrt',
    type: 'consent',
    description: '3-tägige Klassenfahrt nach Berlin',
    date: '2024-06-15',
    status: 'draft',
    created: '2024-01-15',
  },
  {
    id: '2',
    title: 'Fotoerlaubnis Schulveranstaltung',
    type: 'consent',
    description: 'Einverständnis für Fotos und Videos',
    date: '2024-03-20',
    status: 'active',
    created: '2024-01-10',
  },
  {
    id: '3',
    title: 'Sportunterricht Befreiung',
    type: 'medical',
    description: 'Ärztliches Attest für Sportbefreiung',
    date: '2024-02-28',
    status: 'completed',
    created: '2024-01-05',
  },
  {
    id: '4',
    title: 'IT-Nutzungsvereinbarung',
    type: 'contract',
    description: 'Nutzung von Schulcomputern und Internet',
    date: '2024-09-01',
    status: 'active',
    created: '2024-01-08',
  },
];

const mockClasses = [
  {
    id: 'class1',
    name: 'Klasse 8a',
    teacher: 'Herr Schmidt',
    studentCount: 24,
    completion: 65,
  },
  {
    id: 'class2',
    name: 'Klasse 8b',
    teacher: 'Frau Weber',
    studentCount: 26,
    completion: 42,
  },
  {
    id: 'class3',
    name: 'Klasse 9a',
    teacher: 'Herr Müller',
    studentCount: 28,
    completion: 18,
  },
  {
    id: 'class4',
    name: 'Klasse 9b',
    teacher: 'Frau Schneider',
    studentCount: 25,
    completion: 91,
  },
];

const ESignature: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<
    'documents' | 'classes' | 'send'
  >('documents');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'draft' | 'active' | 'completed'
  >('all');
  const [emailSettings, setEmailSettings] = useState({
    subject: '',
    message: '',
    reminder: true,
    deadline: '7',
    allowReSign: true,
    sendCopy: true,
  });

  // Filter documents
  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || doc.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Auto-fill email subject and message
  useEffect(() => {
    if (selectedDocument && selectedClass) {
      setEmailSettings((prev) => ({
        ...prev,
        subject: `Unterschrift erforderlich: ${selectedDocument.title}`,
        message: `Sehr geehrte Eltern,\n\nbitte unterschreiben Sie das Dokument "${selectedDocument.title}" für ${selectedClass.name}.\n\nMit freundlichen Grüßen\nIhre Schule`,
      }));
    }
  }, [selectedDocument, selectedClass]);

  const handleSendEmails = () => {
    console.log('Sending emails with settings:', {
      document: selectedDocument,
      class: selectedClass,
      emailSettings,
    });
    alert(
      `E-Mails werden an ${selectedClass.studentCount} Schüler/Eltern gesendet!`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="h-4 w-4" />;
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-8">
            {/* Step 1: Document Selection */}
            <button
              onClick={() => setCurrentStep('documents')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
                currentStep === 'documents'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              <FileText className="h-5 w-5" />
              Dokument wählen
              {selectedDocument && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </button>

            <ArrowRight className="h-6 w-6 text-gray-400" />

            {/* Step 2: Class Selection */}
            <button
              onClick={() => selectedDocument && setCurrentStep('classes')}
              disabled={!selectedDocument}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
                currentStep === 'classes'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : selectedDocument
                  ? 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
              }`}
            >
              <Users className="h-5 w-5" />
              Klasse wählen
              {selectedClass && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </button>

            <ArrowRight className="h-6 w-6 text-gray-400" />

            {/* Step 3: Send Emails */}
            <button
              onClick={() => selectedClass && setCurrentStep('send')}
              disabled={!selectedClass}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
                currentStep === 'send'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : selectedClass
                  ? 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
              E-Mails senden
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
          {/* Step 1: Document Selection */}
          {currentStep === 'documents' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dokumente
                  </h2>
                  <p className="text-gray-600">Wählen Sie ein Dokument aus</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Plus className="h-4 w-4" />
                  Neues Dokument
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Dokumente durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="draft">Entwurf</option>
                  <option value="active">Aktiv</option>
                  <option value="completed">Abgeschlossen</option>
                </select>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedDocument?.id === doc.id
                        ? 'border-gray-900 bg-gray-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {doc.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{doc.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Fällig: {doc.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Erstellt: {doc.created}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {getStatusIcon(doc.status)}
                        {doc.status === 'draft' && 'Entwurf'}
                        {doc.status === 'active' && 'Aktiv'}
                        {doc.status === 'completed' && 'Abgeschlossen'}
                      </div>
                    </div>

                    {selectedDocument?.id === doc.id && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Ausgewählt - Klicken Sie auf "Weiter"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {selectedDocument && (
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentStep('classes')}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
                  >
                    Weiter zur Klassenauswahl
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Class Selection */}
          {currentStep === 'classes' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Klassenauswahl
                  </h2>
                  <p className="text-gray-600">
                    Wählen Sie eine Klasse für "{selectedDocument?.title}"
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>

              {/* Classes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {mockClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedClass?.id === cls.id
                        ? 'border-gray-900 bg-gray-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {cls.name}
                        </h3>
                        <p className="text-gray-600 mb-2">{cls.teacher}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {cls.studentCount} Schüler
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            {cls.completion}% komplett
                          </div>
                        </div>
                      </div>

                      {/* Completion Bar */}
                      <div className="w-24">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Fortschritt</span>
                          <span>{cls.completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${cls.completion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {selectedClass?.id === cls.id && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Ausgewählt - Bereit für E-Mail-Versand
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep('documents')}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                >
                  Zurück zu Dokumenten
                </button>

                {selectedClass && (
                  <button
                    onClick={() => setCurrentStep('send')}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
                  >
                    Weiter zum E-Mail-Versand
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Email Sending */}
          {currentStep === 'send' && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  E-Mail-Versand
                </h2>
                <p className="text-gray-600">
                  Senden Sie Unterschriftslinks an {selectedClass?.studentCount}{' '}
                  Schüler/Eltern
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      Zusammenfassung
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dokument:</span>
                        <span className="font-medium">
                          {selectedDocument?.title}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Klasse:</span>
                        <span className="font-medium">
                          {selectedClass?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Empfänger:</span>
                        <span className="font-medium">
                          {selectedClass?.studentCount} Schüler/Eltern
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aktueller Stand:</span>
                        <span className="font-medium text-green-600">
                          {selectedClass?.completion}% unterschrieben
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      Schnelleinstellungen
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={emailSettings.reminder}
                          onChange={(e) =>
                            setEmailSettings((prev) => ({
                              ...prev,
                              reminder: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm">
                          Automatische Erinnerungen
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={emailSettings.allowReSign}
                          onChange={(e) =>
                            setEmailSettings((prev) => ({
                              ...prev,
                              allowReSign: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm">
                          Mehrfach-Unterschrift erlauben
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={emailSettings.sendCopy}
                          onChange={(e) =>
                            setEmailSettings((prev) => ({
                              ...prev,
                              sendCopy: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Kopie an mich senden</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betreff
                  </label>
                  <input
                    type="text"
                    value={emailSettings.subject}
                    onChange={(e) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachricht
                  </label>
                  <textarea
                    value={emailSettings.message}
                    onChange={(e) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frist (Tage)
                    </label>
                    <select
                      value={emailSettings.deadline}
                      onChange={(e) =>
                        setEmailSettings((prev) => ({
                          ...prev,
                          deadline: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500"
                    >
                      <option value="3">3 Tage</option>
                      <option value="7">7 Tage</option>
                      <option value="14">14 Tage</option>
                      <option value="30">30 Tage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link-Einstellungen
                    </label>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Link2 className="h-4 w-4" />
                        Link kopieren
                      </button>
                      <button className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="h-4 w-4" />
                        Vorschau
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep('classes')}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                >
                  Zurück zu Klassen
                </button>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors">
                    <Download className="h-4 w-4" />
                    Als Vorlage speichern
                  </button>

                  <button
                    onClick={handleSendEmails}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                    An {selectedClass?.studentCount} Empfänger senden
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          {[
            {
              icon: FileText,
              value: mockDocuments.length,
              label: 'Aktive Dokumente',
            },
            {
              icon: Users,
              value: mockClasses.reduce(
                (acc, cls) => acc + cls.studentCount,
                0
              ),
              label: 'Schüler gesamt',
            },
            {
              icon: CheckCircle,
              value: '78%',
              label: 'Durchschnittl. Fertigstellung',
            },
            { icon: Zap, value: '2.1s', label: 'Durchschnittl. Antwortzeit' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center"
            >
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-gray-700" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ESignature;
