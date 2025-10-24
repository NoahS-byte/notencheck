import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import ExamCalculator from './components/ExamCalculator';
import PerformanceCalculator from './components/PerformanceCalculator';
import RandomGenerator from './components/RandomGenerator';
import Timer from './components/Timer';
import WorkTimeSplitter from './components/WorkTimeSplitter';
import QRCodeGenerator from './components/QRCodeGenerator';
import PlannerTool from './components/PlannerTool';
import KlassenManager from './components/KlassenManager';
import TodoList from './components/TodoList';
import ESignature from './components/ESignature';
import StatisticsView from './components/StatisticsView';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import LoginScreen from './components/LoginScreen';
import NavigationMenu from './components/NavigationMenu';
import AdminPanel from './components/AdminPanel';
import PurchasePage from './components/PurchasePage';
import FeedbackPopup from './components/FeedbackPopup';
import ThankYouPage from './components/ThankYouPage';
import SchulmanagementPage from './components/SchulmanagementPage';
import Sitzplan from './components/Sitzplan';
import Notenuebersicht from './components/Notenuebersicht';
import Notenanalyse from './components/Notenanalyse';
import News from './pages/News';
import { AuthService, AuthUser } from './services/authService';
import { AdminService } from './services/adminService';

// NEUE IMPORTS
import PayPage from './pages/PayPage';
import Impressum from './pages/Impressum';
import AGB from './pages/AGB';
import DataManagement from './pages/DataManagement';

type Page =
  | 'notenrechner'
  | 'notenuebersicht'
  | 'notenanalyse'
  | 'sitzplan'
  | 'zufallsgenerator'
  | 'timer'
  | 'arbeitszeitsplitter'
  | 'qrcode'
  | 'planner'
  | 'klassenmanager'
  | 'todo'
  | 'statistiken'
  | 'schulmanagement'
  | 'esignature'
  | 'news'
  | 'pay'; // NEU: Pay Page hinzufügen

// Haupt-App-Komponente mit Router
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/thankyou" element={<ThankYouWrapper />} />
        <Route path="/news" element={<NewsWrapper />} />
        <Route path="/pay" element={<PayPage />} /> {/* NEU: Pay Route */}
        <Route path="/impressum" element={<Impressum />} /> {/* NEU: Impressum Route */}
        <Route path="/agb" element={<AGB />} /> {/* NEU: AGB Route */}
        <Route path="/data/:id?" element={<DataManagement />} /> {/* NEU: DataManagement Route */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

// ThankYou Wrapper für die Route
const ThankYouWrapper = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const savedUserId = localStorage.getItem('currentUser');
      if (savedUserId) {
        try {
          const user = await AuthService.getCurrentUser(savedUserId);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error loading user:', error);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Nicht eingeloggt</h2>
          <p className="mb-4">
            Bitte loggen Sie sich ein, um auf diese Seite zuzugreifen.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Zum Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThankYouPage currentUser={currentUser} onBack={() => navigate('/')} />
  );
};

// News Wrapper für die Route
const NewsWrapper = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const savedUserId = localStorage.getItem('currentUser');
      if (savedUserId) {
        try {
          const user = await AuthService.getCurrentUser(savedUserId);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error loading user:', error);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Nicht eingeloggt</h2>
          <p className="mb-4">
            Bitte loggen Sie sich ein, um auf die News zuzugreifen.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black px-4 py-2 rounded font-bold"
          >
            Zum Login
          </button>
        </div>
      </div>
    );
  }

  return <News />;
};

// Haupt-App-Komponente
const MainApp = () => {
  const [cookiesAccepted, setCookiesAccepted] = useState(() => {
    return localStorage.getItem('cookieConsent') === 'accepted';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedUserId = localStorage.getItem('currentUser');
    return savedUserId ? ({ id: savedUserId } as AuthUser) : null;
  });

  const [currentPage, setCurrentPage] = useState<Page>('notenrechner');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSchoolManager, setIsSchoolManager] = useState(false);
  const [showPurchasePage, setShowPurchasePage] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // NEU: Prüft, ob der aktuelle Pfad eine spezielle Route ist, die für Admins zugänglich sein soll
  const isSpecialRoute = ['/data', '/impressum', '/agb', '/pay', '/news', '/thankyou'].some(route => 
    location.pathname.startsWith(route)
  );

  const loadUserData = async (userId: string) => {
    try {
      setIsLoading(true);
      const user = await AuthService.getCurrentUser(userId);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(user.isAdmin === true);

        // KORRIGIERT: Explizite Prüfung der is_school_manager Flag
        // Nur wenn explizit true ist, wird der Benutzer als Schulmanager behandelt
        const isSchoolManagerUser = user.isSchoolManager === true;
        setIsSchoolManager(isSchoolManagerUser);

        console.log('🔍 User loaded:', {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          isSchoolManager: isSchoolManagerUser,
          paymentStatus: user.paymentStatus,
        });
      }
      return user;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    // Load user from localStorage on app start
    const savedUserId = localStorage.getItem('currentUser');
    if (savedUserId) {
      loadUserData(savedUserId);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser.id);
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // KORRIGIERT: Automatische Weiterleitung NUR für echte Schulmanager
  useEffect(() => {
    if (
      isSchoolManager &&
      !isAdmin &&
      !showPurchasePage &&
      location.pathname === '/'
    ) {
      console.log('🚀 Redirecting school manager to Schulmanagement page');
      // Setze direkt die Schulmanagement-Seite
      setCurrentPage('schulmanagement');
    }
  }, [isSchoolManager, isAdmin, showPurchasePage, location.pathname]);

  const handleCookieAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setCookiesAccepted(true);
  };

  const handleCookieDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setCookiesAccepted(false);
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAdmin(user.isAdmin === true);
    setIsSchoolManager(user.isSchoolManager === true); // KORRIGIERT
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setIsSchoolManager(false);
    setShowPurchasePage(false);
    setShowFeedbackPopup(false);
  };

  const handlePurchaseComplete = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await AdminService.updateUserPaymentStatus(currentUser.id, 'paid');
      await loadUserData(currentUser.id);
      setShowPurchasePage(false);
      navigate('/thankyou');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(
        'Es gab ein Problem bei der Aktualisierung Ihres Zahlungsstatus. Bitte kontaktieren Sie den Support.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPayment = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await AdminService.updateUserPaymentStatus(currentUser.id, 'paid');
      await loadUserData(currentUser.id);
      setShowPurchasePage(false);
      navigate('/thankyou');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(
        'Es gab ein Problem bei der Aktualisierung Ihres Zahlungsstatus. Bitte kontaktieren Sie den Support.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFeedback = () => {
    setShowFeedbackPopup(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackPopup(false);
  };

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // KORRIGIERT: Check if user needs to purchase (nur für normale Benutzer, nicht für Schulmanager)
  if (
    !isAdmin &&
    !isSchoolManager && // WICHTIG: Schulmanager ausgeschlossen
    (currentUser.paymentStatus === 'pending' ||
      currentUser.paymentStatus === 'expired' ||
      currentUser.paymentStatus === 'free') &&
    !showPurchasePage &&
    location.pathname !== '/thankyou' &&
    !isSpecialRoute // NEU: Spezielle Routen ausschließen
  ) {
    setShowPurchasePage(true);
  }

  // Show purchase page (nur für normale Benutzer)
  if (showPurchasePage && !isAdmin && !isSchoolManager && !isSpecialRoute) {
    return (
      <PurchasePage
        currentUser={currentUser}
        onBack={() => setShowPurchasePage(false)}
        onPurchaseComplete={handlePurchaseComplete}
        onTestPayment={handleTestPayment}
      />
    );
  }

  // NEU: Zeige Admin Panel NUR wenn Admin UND nicht auf einer speziellen Route
  if (isAdmin && !isSpecialRoute) {
    return (
      <AdminPanel onLogout={handleLogout} currentUserId={currentUser.id} />
    );
  }

  // KORRIGIERT: Show Schulmanagement page ONLY for school managers
  if (isSchoolManager && currentPage === 'schulmanagement' && !isSpecialRoute) {
    return (
      <SchulmanagementPage
        currentUserId={currentUser.id}
        onLogout={handleLogout}
      />
    );
  }

  const renderCurrentPage = () => {
    // NEU: Wenn wir auf einer speziellen Route sind, zeige nichts (die Route wird vom Router gehandelt)
    if (isSpecialRoute) {
      return null;
    }

    switch (currentPage) {
      case 'notenrechner':
        return (
          <div className="space-y-16">
            <ExamCalculator currentUserId={currentUser.id} />
            <PerformanceCalculator />
          </div>
        );
      case 'notenuebersicht':
        return <Notenuebersicht currentUserId={currentUser.id} />;
      case 'notenanalyse':
        return <Notenanalyse currentUserId={currentUser.id} />;
      case 'sitzplan':
        return <Sitzplan currentUserId={currentUser.id} />;
      case 'zufallsgenerator':
        return <RandomGenerator currentUserId={currentUser.id} />;
      case 'timer':
        return <Timer />;
      case 'arbeitszeitsplitter':
        return <WorkTimeSplitter />;
      case 'qrcode':
        return <QRCodeGenerator />;
      case 'planner':
        return <PlannerTool currentUserId={currentUser.id} />;
      case 'klassenmanager':
        return <KlassenManager currentUserId={currentUser.id} />;
      case 'todo':
        return <TodoList currentUserId={currentUser.id} />;
      case 'statistiken':
        return <StatisticsView currentUserId={currentUser.id} />;
      case 'schulmanagement':
        // KORRIGIERT: Nur Schulmanager können die Schulmanagement-Seite sehen
        if (isSchoolManager) {
          return (
            <SchulmanagementPage
              currentUserId={currentUser.id}
              onLogout={handleLogout}
            />
          );
        } else {
          // Fallback für normale Benutzer, die versuchen auf Schulmanagement zuzugreifen
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Zugriff verweigert
              </h2>
              <p className="text-gray-600">
                Sie haben keine Berechtigung für den Schulmanager.
              </p>
            </div>
          );
        }
      case 'esignature':
        return <ESignature />;
      case 'news':
        // Redirect to /news route
        navigate('/news');
        return null;
      case 'pay': // NEU: Pay Page
        // Redirect to /pay route
        navigate('/pay');
        return null;
      default:
        return (
          <div className="space-y-16">
            <ExamCalculator currentUserId={currentUser.id} />
            <PerformanceCalculator />
          </div>
        );
    }
  };

  const getPageTitle = () => {
    // NEU: Wenn auf spezieller Route, zeige einen Standard-Titel
    if (isSpecialRoute) {
      return 'EDU TOOLS';
    }

    switch (currentPage) {
      case 'notenrechner':
        return 'NOTENRECHNER';
      case 'notenuebersicht':
        return 'NOTENÜBERSICHT';
      case 'notenanalyse':
        return 'NOTENANALYSE';
      case 'sitzplan':
        return 'SITZPLAN';
      case 'zufallsgenerator':
        return 'ZUFALLSGENERATOR';
      case 'timer':
        return 'TIMER';
      case 'arbeitszeitsplitter':
        return 'ARBEITSZEITSPLITTER';
      case 'qrcode':
        return 'QR-CODE GENERATOR';
      case 'planner':
        return 'SCHULPLANER';
      case 'klassenmanager':
        return 'KLASSENMANAGER';
      case 'todo':
        return 'AUFGABEN-MANAGER';
      case 'statistiken':
        return 'LEISTUNGSSTATISTIKEN';
      case 'schulmanagement':
        return 'SCHULMANAGEMENT';
      case 'esignature':
        return 'E-SIGNATURE';
      case 'news':
        return 'EDU NEWS';
      case 'pay': // NEU: Pay Page
        return 'PREISE & ABOS';
      default:
        return 'NOTENRECHNER';
    }
  };

  const getPageDescription = () => {
    // NEU: Wenn auf spezieller Route, zeige eine Standard-Beschreibung
    if (isSpecialRoute) {
      return 'Umfassende digitale Werkzeuge für Lehrer und Schulen';
    }

    switch (currentPage) {
      case 'notenrechner':
        return 'Professioneller Rechner für deutsche Schulnoten mit 15-Punkte-System. Berechnen Sie Klausurnoten mit Gewichtung und führen Sie einfache Leistungskontrollen durch.';
      case 'notenuebersicht':
        return 'Vollständige Übersicht aller Noten mit Filter- und Sortierfunktionen. Verwalten Sie Noten für verschiedene Klassen und Fächer.';
      case 'notenanalyse':
        return 'Detaillierte Analyse der Notenentwicklung mit Statistiken, Trends und Vergleichsfunktionen. Identifizieren Sie Stärken und Schwächen.';
      case 'sitzplan':
        return 'Erstellen und verwalten Sie flexible Sitzpläne für Ihre Klassenräume. Drag & Drop Funktion für einfache Anpassungen.';
      case 'zufallsgenerator':
        return 'Generieren Sie zufällige Zahlen oder Schüler in einem vordefinierten Bereich mit spektakulärer Animation.';
      case 'timer':
        return 'Countdown-Timer für Arbeitszeiten, Pausen und Unterrichtsstunden.';
      case 'arbeitszeitsplitter':
        return 'Teilen Sie Ihre Arbeitszeit in strukturierte Blöcke auf und arbeiten Sie fokussiert.';
      case 'qrcode':
        return 'Erstellen Sie professionelle QR-Codes für URLs, WiFi, Kontakte und mehr.';
      case 'planner':
        return 'Erstellen Sie Schultermine und teilen Sie sie über iCal-Feeds mit Ihren Schülern.';
      case 'klassenmanager':
        return 'Verwalten Sie Klassen und Schülerlisten mit Import/Export-Funktionen für den Unterricht.';
      case 'todo':
        return 'Organisieren Sie Ihre Aufgaben mit Prioritäten, Kategorien und Fälligkeitsdaten.';
      case 'statistiken':
        return 'Analysieren Sie Ihre Leistungsdaten und verfolgen Sie Ihren Fortschritt über Zeit.';
      case 'schulmanagement':
        return 'Zentrale Verwaltung für Schulen, Klassen und Schüler. Erstellen und verwalten Sie Klassen für Ihre Schule.';
      case 'esignature':
        return 'Sichere digitale Unterschriften in Sekunden. Laden Sie Dokumente hoch und generieren Sie signierbare Links für rechtlich bindende elektronische Signaturen.';
      case 'news':
        return 'Aktuelle Nachrichten und Insights aus Bildung, Technologie und innovativen Unterrichtskonzepten. Bleiben Sie auf dem neuesten Stand.';
      case 'pay': // NEU: Pay Page
        return 'Entdecken Sie unsere Abonnements für Lehrer und Schulen. Testversion, Privatlizenz oder Schullizenz - finden Sie das passende Angebot.';
      default:
        return 'Professioneller Rechner für deutsche Schulnoten mit 15-Punkte-System.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
            <span>Laden...</span>
          </div>
        </div>
      )}

      {/* NEU: Zeige Header und Navigation nur, wenn nicht auf spezieller Route */}
      {!isSpecialRoute && (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <GraduationCap className="h-12 w-12 text-gray-900" />
              <h1 className="text-5xl font-black text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              {getPageDescription()}
            </p>
          </div>

          {/* Main Content */}
          {renderCurrentPage()}
        </div>
      )}

      {/* NEU: Zeige Footer nur, wenn nicht auf spezieller Route */}
      {!isSpecialRoute && <Footer />}

      {/* NEU: Zeige NavigationMenu nur, wenn nicht auf spezieller Route */}
      {!isSpecialRoute && (
        <NavigationMenu
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          currentUserId={currentUser.id}
          onLogout={handleLogout}
          onOpenFeedback={handleOpenFeedback}
        />
      )}

      {/* Cookie Banner */}
      {!cookiesAccepted && (
        <CookieBanner
          onAccept={handleCookieAccept}
          onDecline={handleCookieDecline}
        />
      )}

      {/* Feedback Popup */}
      {showFeedbackPopup && <FeedbackPopup onClose={handleCloseFeedback} />}
    </div>
  );
};

export default App;