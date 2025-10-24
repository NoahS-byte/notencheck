import React, { useState, useEffect } from 'react';
import {
  Menu,
  Calculator,
  Shuffle,
  Clock,
  Split,
  QrCode,
  Calendar,
  User,
  LogOut,
  X,
  MessageCircle,
  BookOpen,
  CheckSquare,
  BarChart3,
  Users,
  Layout,
  TrendingUp,
  FileText,
  Info,
  Newspaper,
  FileSignature,
  School,
  Crown,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import AccountManager from './AccountManager';
import { AuthService } from '../services/authService';

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
  | 'news'
  | 'esignature';

interface NavigationMenuProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  currentUserId: string;
  onLogout: () => void;
  onOpenFeedback: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  currentPage,
  onPageChange,
  currentUserId,
  onLogout,
  onOpenFeedback,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [userEmail, setUserEmail] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSchoolManager, setIsSchoolManager] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUserId) {
        try {
          const user = await AuthService.getCurrentUser(currentUserId);
          setUserEmail(user.email || '');
          setUserStatus(user.paymentStatus || 'free');
          setIsAdmin(user.isAdmin === true);
          setIsSchoolManager(user.isSchoolManager === true);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [currentUserId]);

  const menuItems = [
    // Noten-Management
    {
      id: 'notenrechner' as Page,
      label: 'Notenrechner',
      icon: Calculator,
      category: 'noten',
      description: 'Berechnen Sie Noten und Punkte',
    },
    {
      id: 'notenuebersicht' as Page,
      label: 'Notenübersicht',
      icon: FileText,
      category: 'noten',
      description: 'Verwalten Sie alle Schülernoten',
      isBeta: true,
      isNew: true,
    },
    {
      id: 'notenanalyse' as Page,
      label: 'Notenanalyse',
      icon: TrendingUp,
      category: 'noten',
      description: 'Detaillierte Leistungsanalysen',
      isBeta: true,
      isNew: true,
    },

    // Klassen-Management
    {
      id: 'klassenmanager' as Page,
      label: 'Klassenmanager',
      icon: Users,
      category: 'klassen',
      description: 'Verwalten Sie Klassen und Schüler',
      isNew: true,
    },
    {
      id: 'sitzplan' as Page,
      label: 'Sitzplan',
      icon: Layout,
      category: 'klassen',
      description: 'Erstellen Sie Klassenraum-Sitzpläne',
      isNew: true,
    },
    {
      id: 'zufallsgenerator' as Page,
      label: 'Zufallsgenerator',
      icon: Shuffle,
      category: 'klassen',
      description: 'Zufällige Schülerauswahl',
    },

    // Unterrichts-Tools
    {
      id: 'timer' as Page,
      label: 'Unterrichts-Timer',
      icon: Clock,
      category: 'tools',
      description: 'Zeitmanagement für den Unterricht',
    },
    {
      id: 'arbeitszeitsplitter' as Page,
      label: 'Arbeitszeitteiler',
      icon: Split,
      category: 'tools',
      description: 'Teilen Sie Arbeitszeiten ein',
    },
    {
      id: 'qrcode' as Page,
      label: 'QR-Code Generator',
      icon: QrCode,
      category: 'tools',
      description: 'Erstellen Sie QR-Codes für Materialien',
    },
    {
      id: 'todo' as Page,
      label: 'Aufgaben-Manager',
      icon: CheckSquare,
      category: 'tools',
      description: 'Verwalten Sie Unterrichtsaufgaben',
      isNew: true,
    },

    // Erweiterte Analyse
    {
      id: 'statistiken' as Page,
      label: 'Leistungsstatistiken',
      icon: BarChart3,
      category: 'analytics',
      description: 'Umfassende Leistungsauswertungen',
      isBeta: true,
      isNew: true,
    },
    {
      id: 'planner' as Page,
      label: 'Unterrichtsplaner',
      icon: Calendar,
      category: 'analytics',
      description: 'Planen Sie Ihren Unterricht',
      isBeta: true,
      isNew: true,
    },

    // Digitale Tools
    {
      id: 'esignature' as Page,
      label: 'E-Signature',
      icon: FileSignature,
      category: 'digital',
      description: 'Digitale Unterschriften für Dokumente',
      isBeta: true,
      isNew: true,
    },

    // News
    {
      id: 'news' as Page,
      label: 'News & Updates',
      icon: Newspaper,
      category: 'info',
      description: 'Neueste Informationen und Updates',
      isNew: true,
    },
  ];

  const getStatusBadge = () => {
    if (isAdmin) {
      return {
        text: 'ADMIN',
        color: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
        icon: Shield,
      };
    }
    if (isSchoolManager) {
      return {
        text: 'SCHULMANAGER',
        color: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
        icon: School,
      };
    }
    switch (userStatus) {
      case 'paid':
        return {
          text: 'PREMIUM',
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
          icon: Crown,
        };
      default:
        return {
          text: 'BASIC',
          color: 'bg-gray-200 text-gray-700',
          icon: Star,
        };
    }
  };

  // KEINE Filterung mehr - alle Items sind für alle verfügbar
  const filteredMenuItems = menuItems;

  // Gruppiere Menüpunkte nach Kategorien
  const categorizedItems = {
    noten: filteredMenuItems.filter((item) => item.category === 'noten'),
    klassen: filteredMenuItems.filter((item) => item.category === 'klassen'),
    tools: filteredMenuItems.filter((item) => item.category === 'tools'),
    digital: filteredMenuItems.filter((item) => item.category === 'digital'),
    analytics: filteredMenuItems.filter(
      (item) => item.category === 'analytics'
    ),
    info: filteredMenuItems.filter((item) => item.category === 'info'),
  };

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    setIsOpen(false);
  };

  const handleFeedbackClick = () => {
    onOpenFeedback();
    setIsOpen(false);
  };

  const betaTooltipText =
    'Öffentliche Beta - Diese Funktion ist noch in Entwicklung und kann Fehler enthalten oder unvollständig sein.';

  const handleBetaMouseEnter = (event: React.MouseEvent, itemId: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setTooltipItem(itemId);
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-30 bg-white border-2 border-gray-900 p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Menu className="h-6 w-6 text-gray-900" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">Menü</span>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Navigation Menu Modal */}
      <div className="fixed inset-4 z-50 flex items-center justify-center">
        <div className="bg-white border-4 border-gray-900 shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">
          {/* Header - Fixed */}
          <div className="bg-gray-900 text-white p-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Menu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    LEHRER TOOLBOX
                  </h2>
                  <p className="text-gray-300 font-medium">
                    Professionelle Tools für modernen Unterricht
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-lg flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Status Info */}
            <div className="relative mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userEmail && (
                  <div className="text-sm text-gray-300 font-medium bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    {userEmail}
                  </div>
                )}
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusBadge.color} font-bold text-sm`}
              >
                <StatusIcon className="h-4 w-4" />
                <span>{statusBadge.text}</span>
                {(isAdmin || isSchoolManager) && (
                  <span className="ml-1 text-xs opacity-90">
                    {isAdmin
                      ? '• Administrator'
                      : isSchoolManager
                      ? '• Schulmanager'
                      : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Noten-Management Bereich */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-900">
                <Calculator className="h-6 w-6 text-gray-900" />
                <h3 className="text-xl font-bold text-gray-900">
                  Noten-Management
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedItems.noten.map((item) => (
                  <NavigationCard
                    key={item.id}
                    item={item}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onBetaMouseEnter={handleBetaMouseEnter}
                    onBetaMouseLeave={() => setTooltipItem(null)}
                  />
                ))}
              </div>
            </div>

            {/* Klassen-Management Bereich */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-900">
                <Users className="h-6 w-6 text-gray-900" />
                <h3 className="text-xl font-bold text-gray-900">
                  Klassen-Management
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedItems.klassen.map((item) => (
                  <NavigationCard
                    key={item.id}
                    item={item}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onBetaMouseEnter={handleBetaMouseEnter}
                    onBetaMouseLeave={() => setTooltipItem(null)}
                  />
                ))}
              </div>
            </div>

            {/* Unterrichts-Tools */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-900">
                <BookOpen className="h-6 w-6 text-gray-900" />
                <h3 className="text-xl font-bold text-gray-900">
                  Unterrichts-Tools
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedItems.tools.map((item) => (
                  <NavigationCard
                    key={item.id}
                    item={item}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onBetaMouseEnter={handleBetaMouseEnter}
                    onBetaMouseLeave={() => setTooltipItem(null)}
                  />
                ))}
              </div>
            </div>

            {/* Digitale Tools */}
            {categorizedItems.digital.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-900">
                  <Zap className="h-6 w-6 text-gray-900" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Digitale Tools
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedItems.digital.map((item) => (
                    <NavigationCard
                      key={item.id}
                      item={item}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onBetaMouseEnter={handleBetaMouseEnter}
                      onBetaMouseLeave={() => setTooltipItem(null)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Erweiterte Analyse */}
            {categorizedItems.analytics.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-900">
                  <BarChart3 className="h-6 w-6 text-gray-900" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Erweiterte Analyse
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedItems.analytics.map((item) => (
                    <NavigationCard
                      key={item.id}
                      item={item}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onBetaMouseEnter={handleBetaMouseEnter}
                      onBetaMouseLeave={() => setTooltipItem(null)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Info & News */}
            {categorizedItems.info.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-900">
                  <Newspaper className="h-6 w-6 text-gray-900" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Informationen
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedItems.info.map((item) => (
                    <NavigationCard
                      key={item.id}
                      item={item}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onBetaMouseEnter={handleBetaMouseEnter}
                      onBetaMouseLeave={() => setTooltipItem(null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Beta Tooltip */}
          {tooltipItem && (
            <div
              className="fixed z-60 bg-gray-900 text-white p-3 rounded-lg shadow-xl max-w-xs border-2 border-blue-500 text-sm"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translateX(-50%) translateY(-100%)',
              }}
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>{betaTooltipText}</div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-gray-900 rotate-45 border-b-2 border-r-2 border-blue-500"></div>
            </div>
          )}

          {/* Clean Footer ohne Stats */}
          <div className="border-t-4 border-gray-900 p-6 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 font-medium">
                  EDU Platform v2.1.0
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Feedback Button */}
                <button
                  onClick={handleFeedbackClick}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Feedback</span>
                </button>

                {/* Konto Button */}
                <AccountManager
                  currentUserId={currentUserId}
                  onLogout={onLogout}
                  variant="uniform"
                />

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 bg-red-600 text-white font-bold hover:bg-red-700 hover:border-red-700 transition-all duration-300 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Separate Card-Komponente für bessere Wartbarkeit
interface NavigationCardProps {
  item: {
    id: Page;
    label: string;
    icon: React.ComponentType<any>;
    description?: string;
    disabled?: boolean;
    badge?: string;
    isBeta?: boolean;
    isNew?: boolean;
  };
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onBetaMouseEnter: (event: React.MouseEvent, itemId: string) => void;
  onBetaMouseLeave: () => void;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  item,
  currentPage,
  onPageChange,
  onBetaMouseEnter,
  onBetaMouseLeave,
}) => {
  const handleMouseEnter = (event: React.MouseEvent) => {
    if (item.isBeta) {
      onBetaMouseEnter(event, item.id);
    }
  };

  const handleMouseLeave = () => {
    if (item.isBeta) {
      onBetaMouseLeave();
    }
  };

  return (
    <button
      onClick={() => onPageChange(item.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group p-6 border-2 transition-all duration-300 transform rounded-xl ${
        item.isBeta
          ? 'bg-blue-50 text-gray-900 border-blue-200 hover:border-blue-400 hover:bg-blue-100 hover:scale-105 hover:shadow-lg'
          : currentPage === item.id
          ? 'bg-gray-900 text-white border-gray-900 hover:scale-105'
          : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:scale-105 hover:shadow-lg'
      } relative h-full flex flex-col items-center justify-center text-center`}
    >
      {/* Beta Info Icon */}
      {item.isBeta && (
        <div className="absolute top-3 right-3">
          <Info className="h-4 w-4 text-blue-500" />
        </div>
      )}

      {/* New Badge */}
      {item.isNew && (
        <div className="absolute top-3 left-3">
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NEU
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div
          className={`p-3 rounded-lg ${
            item.isBeta
              ? 'bg-blue-100 group-hover:bg-blue-200'
              : currentPage === item.id
              ? 'bg-white/20'
              : 'bg-gray-100 group-hover:bg-white/20'
          }`}
        >
          <item.icon
            className={`h-8 w-8 transition-transform duration-300 ${
              currentPage === item.id || item.isBeta
                ? 'scale-110'
                : 'group-hover:scale-110'
            }`}
          />
        </div>

        <div className="space-y-2">
          <div className="font-bold text-lg leading-tight">{item.label}</div>
          {item.description && (
            <div
              className={`text-sm leading-tight ${
                item.isBeta
                  ? 'text-blue-700 group-hover:text-blue-800'
                  : currentPage === item.id
                  ? 'text-gray-200'
                  : 'text-gray-600 group-hover:text-gray-200'
              }`}
            >
              {item.description}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div
        className={`absolute inset-0 border-2 border-transparent rounded-xl transition-colors duration-300 ${
          item.isBeta
            ? 'group-hover:border-blue-300'
            : 'group-hover:border-white/20'
        }`}
      />
    </button>
  );
};

export default NavigationMenu;
