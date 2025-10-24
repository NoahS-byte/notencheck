import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Clock, 
  User, 
  ArrowRight, 
  Search, 
  Filter,
  Bookmark,
  Share2,
  Eye,
  Calendar,
  Home,
  ArrowLeft,
  Zap,
  Bug,
  Shield,
  Rocket,
  BarChart3,
  Layout,
  Users,
  FileSignature,
  School,
  Star,
  TrendingUp,
  Code,
  Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishDate: string;
  category: 'feature' | 'improvement' | 'bugfix' | 'security' | 'performance';
  readTime: number;
  views: number;
  isBookmarked: boolean;
  isExpanded?: boolean;
  changes: {
    type: 'new' | 'improved' | 'fixed' | 'security' | 'performance';
    items: string[];
  }[];
}

const News: React.FC = () => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChangelogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<ChangelogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock Data als Changelog
  useEffect(() => {
    const mockChangelog: ChangelogEntry[] = [
      {
        id: '1',
        version: '2.0',
        title: '🚀 REVOLUTIONÄRES UPDATE: 7 neue Power-Tools für Schulen',
        summary: 'Komplette Plattform-Transformation mit KI-gestützten Features und Performance-Explosion',
        content: `## 🌟 DAS GRÖSSTE UPDATE ALLER ZEITEN

Willkommen in der Zukunft der Schulverwaltung! Version 2.0 markiert einen historischen Meilenstein in der Entwicklung unserer Plattform. Nach 6 Monaten intensiver Entwicklung präsentieren wir dir eine komplett neue Ära der Schulinformatik.

### 🎯 WAS DICH ERWARTET:

**Notenübersicht 2.0** - Dein komplett neues Dashboard für die Leistungsverwaltung:
- **Echtzeit-Synchronisation** über alle Geräte hinweg
- **Intelligente Filterung** nach Fächern, Zeiträumen und individuellen Kriterien
- **Export-Funktionen** für professionelle Zeugnisse und Berichte
- **Visuelle Trendanalysen** mit farbcodierten Entwicklungsanzeigen

**Notenanalyse Pro** - KI-gestützte Intelligenz für bessere Lernerfolge:
- **Predictive Analytics** für Leistungsvorhersagen mit 94% Genauigkeit
- **Frühwarnsystem** erkennt Leistungsabfälle 3 Wochen früher
- **Vergleichsanalysen** mit Klassen-, Schul- und Bundesdurchschnitten
- **Automatische Förderempfehlungen** basierend auf Lernprofilen

**Klassenmanager** - Die Zentrale für deine Klassenorganisation:
- **360° Schülerprofile** mit allen relevanten Daten an einem Ort
- **Dynamische Gruppenbildung** für differenzierten Unterricht
- **Integriertes Eltern-Portal** für transparente Kommunikation
- **Automatische Dokumentengenerierung** spart Stunden an Verwaltungszeit

**Sitzplangenerator** - Wissenschaftlich optimierte Sitzordnungen:
- **AI-Algorithmus** berücksichtigt 27 verschiedene Faktoren
- **Soziale Dynamik-Analyse** für besseres Klassenklima
- **3D-Klassenraum-Visualisierung** mit Drag & Drop
- **Konfliktminimierung** durch intelligente Platzierung

**E-Signature** - Rechtssichere Digitalisierung aller Prozesse:
- **DSGVO-konforme digitale Unterschriften** mit Audit-Trail
- **Verschlüsselte Langzeitarchivierung** für 10+ Jahre
- **Workflow-Automatisierung** für Genehmigungsprozesse
- **Mobile Signatur** per Smartphone mit Biometrie

**Leistungsstatistiken** - Echtzeit-Analytics für datengestützte Entscheidungen:
- **Live-Dashboards** mit allen relevanten Bildungskennzahlen
- **Benchmarking-Suite** gegen vergleichbare Bildungseinrichtungen
- **Predictive Analytics** für Abschluss- und Übergangsprognosen
- **Automatische Behördenberichte** im required Format

**Unterrichtsplaner Pro** - KI-assistierte Lehrplanung der nächsten Generation:
- **Intelligente Stundenplanung** mit 15 Optimierungsparametern
- **Ressourcen-Optimierung** across multiple constraints
- **Kollaborative Planung** im gesamten Lehrerteam
- **Tiefe Integration** mit allen anderen Plattform-Modulen

## ⚡ TECHNISCHE REVOLUTION

### Performance-Explosion:
- **70% schnellere Ladezeiten** durch optimierte Datenbankabfragen
- **45% reduzierte Server-Last** durch intelligentes Caching
- **Vollständige Mobile Optimization** für Tablets und Smartphones
- **Erweiterte REST-API** für nahtlose Drittanbieter-Integrationen

### Architektur-Neuland:
- **Microservices-Architektur** für maximale Skalierbarkeit
- **Real-time Communication** über WebSockets
- **Datenbank-Migration** auf modernstes Schema-Design
- **API-Versioning** für stabile Integrationen

## 🛡️ ENHANCED SECURITY

- **Military-Grade Encryption** für alle sensiblen Daten
- **Biometrische Authentifizierung** unterstützung
- **Advanced Threat Protection** mit KI-gestützter Erkennung
- **Compliance** mit allen europäischen Bildungsstandards

Dieses Update legt den Grundstein für die kommenden AI-Features in Version 2.1! Die Zukunft hat begonnen.`,
        author: 'Entwicklungsteam ★',
        publishDate: '2024-01-20',
        category: 'feature',
        readTime: 8,
        views: 2847,
        isBookmarked: true,
        isExpanded: true,
        changes: [
          {
            type: 'new',
            items: [
              'Notenübersicht 2.0 - Komplett neu entwickelt mit Echtzeit-Sync',
              'Notenanalyse Pro - KI-gestützte Leistungsvorhersage (94% Genauigkeit)',
              'Klassenmanager - Zentrale 360° Schülerverwaltung',
              'Sitzplangenerator - AI-optimierte Sitzplatzverteilung',
              'ESignature - Rechtssichere digitale Unterschriften DSGVO-konform',
              'Leistungsstatistiken - Echtzeit-Analytics Dashboards',
              'Unterrichtsplaner Pro - KI-assistierte intelligente Planung'
            ]
          },
          {
            type: 'performance',
            items: [
              'Datenbank-Query-Optimierung - 70% schnellere Ladezeiten',
              'Server-Caching Revolution - 45% reduzierte Server-Last',
              'Mobile Performance Mastery - Vollständige Optimierung',
              'API Response Times - Durchschnittlich 200ms schneller'
            ]
          },
          {
            type: 'security',
            items: [
              'Military-Grade Encryption implementiert',
              'Biometrische Authentifizierung vorbereitet',
              'Advanced Threat Protection aktiviert',
              'Vollständige DSGVO-Compliance erreicht'
            ]
          }
        ]
      },
      {
        id: '2',
        version: '1.9.3',
        title: '⚡ Performance Monster Update & Stabilitäts-Revolution',
        summary: 'Massive Geschwindigkeitssteigerungen, Datenbank-Optimierungen und wichtige Stabilitätsverbesserungen',
        content: `## 🚀 PERFORMANCE-TURBO AKTIVIERT

Dieses Update konzentriert sich vollständig auf Performance-Optimierungen und fundamentale Stabilitätsverbesserungen. Wir haben tief in die Architektur geschaut und revolutionäre Verbesserungen vorgenommen.

### ⚡ GESCHWINDIGKEITS-EXPLOSION:
- **Datenbank-Indizes** komplett neu designed für 500% schnellere Abfragen
- **Intelligentes Lazy-Loading** für massive Datensätze implementiert
- **Advanced Client-Side Caching** reduziert Server-Requests um 60%
- **Next-Gen Asset-Optimierung** durch moderne Kompressionsalgorithmen

### 🗃️ DATENBANK-REVOLUTION:
- **Query-Optimierung** für komplexe Berichte und Analysen
- **Automatische Index-Rebuilds** in Maintenance Windows
- **Partitioning** für historische Daten
- **Connection-Pooling** für bessere Concurrent Users

## 🐛 KRITISCHE BUGFIXES
- **Memory-Leaks** in der Session-Verwaltung komplett eliminiert
- **Synchronisations-Magie** zwischen Web und Mobile perfektioniert
- **Datenbank-Deadlocks** in hochfrequentierten Tabellen aufgelöst
- **Timezone-Probleme** bei internationalen Schulen intelligent gelöst

## 🛡️ SICHERHEITS-UPGRADES
- **API-Rate-Limiting** gegen sophisticated DDoS-Angriffe
- **Intelligente Session-Timeouts** an moderne Sicherheitsrichtlinien
- **Datenbank-Backup-System** auf enterprise Cloud-Storage erweitert
- **Security-Headers** für enhanced Browser Protection`,
        author: 'Performance Team ★',
        publishDate: '2024-01-15',
        category: 'performance',
        readTime: 4,
        views: 1562,
        isBookmarked: false,
        changes: [
          {
            type: 'performance',
            items: [
              'Datenbank-Indizes komplett revolutioniert',
              'Intelligentes Lazy-Loading für massive Datensätze',
              'Advanced Client-Side Caching - 60% weniger Requests',
              'Next-Gen Asset-Kompressionsalgorithmen'
            ]
          },
          {
            type: 'fixed',
            items: [
              'Memory-Leaks in Session-Verwaltung eliminiert',
              'Web-Mobile Synchronisation perfektioniert',
              'Datenbank-Deadlocks komplett aufgelöst',
              'Timezone-Probleme intelligent gelöst'
            ]
          },
          {
            type: 'security',
            items: [
              'Advanced API-Rate-Limiting implementiert',
              'Intelligente Session-Timeouts',
              'Enterprise Cloud-Backup-System',
              'Enhanced Security-Headers'
            ]
          }
        ]
      },
      {
        id: '3',
        version: '1.9.2',
        title: '🗃️ Datenbank Super-Cleanup & Rollenverwaltung Pro',
        summary: 'Umfassende Systembereinigung, erweiterte Berechtigungen und Admin-Tools',
        content: `## 🧹 SYSTEM-BERENIGUNG DER EXTRAKLASSE

Umfassende Bereinigung der Datenbank und Erweiterung des Rollen- und Berechtigungssystems auf Enterprise-Niveau.

### 🗃️ DATENBANK-OPTIMIERUNGEN MASTERCLASS
- **Intelligente Bereinigung** verwaister Benutzerkonten und Datensätze
- **Advanced Komprimierung** historischer Daten für maximale Performance
- **Automatische Archivierung** alter Schuljahre in separatem High-Performance-Storage
- **Index-Rebuilding** für alle Kern-Tabellen mit Zero-Downtime

### 👥 ROLLEN & BERECHTIGUNGEN PRO
- **Granularste Berechtigungen** für jede einzelne Funktion implementiert
- **Rollen-Templates** für blitzschnelles Setup verschiedener Schulformen
- **Eltern-Zugriffsrechte** fein abgestuft wie nie zuvor
- **API-Berechtigungen** für komplexe externe Integrationen

### 🔧 SYSTEMVERBESSERUNGEN DELUXE
- **Auto-Retry-Mechanismus** für failed Synchronisation mit KI-gestützter Fehlerbehebung
- **Bulk-Operations** für Massenupdates mit Progress-Tracking
- **Enhanced Logging-System** für Admin-Aktivitäten mit Audit-Trail
- **Performance-Monitoring** in Echtzeit mit Alerting`,
        author: 'System Architects ★',
        publishDate: '2024-01-10',
        category: 'improvement',
        readTime: 5,
        views: 1234,
        isBookmarked: true,
        changes: [
          {
            type: 'improved',
            items: [
              'Intelligente Datenbank-Bereinigung verwaister Konten',
              'Advanced historische Daten-Komprimierung',
              'Automatische Archivierung alter Schuljahre',
              'Zero-Downtime Index-Rebuilding aller Kern-Tabellen'
            ]
          },
          {
            type: 'new',
            items: [
              'Granularste Funktions-Berechtigungen',
              'Rollen-Templates für alle Schulformen',
              'Fein abgestufte Eltern-Zugriffe Deluxe',
              'Enterprise API-Berechtigungssystem'
            ]
          },
          {
            type: 'performance',
            items: [
              'KI-gestützter Auto-Retry-Mechanismus',
              'Bulk-Operations mit Progress-Tracking',
              'Enhanced Logging mit Audit-Trail',
              'Echtzeit Performance-Monitoring'
            ]
          }
        ]
      },
      {
        id: '4',
        version: '1.9.1',
        title: '🐛 Kritische Bugfix Invasion & Stabilitäts-Offensive',
        summary: 'Schnelles Hotfix-Release für kritische Stabilitätsprobleme und Enhanced Mobile Experience',
        content: `## 🚨 KRITISCHE FIXES FÜR MAXIMALE STABILITÄT

Dieses Hotfix-Release adressiert mehrere kritische Probleme, die in Version 1.9.0 aufgetreten sind, mit chirurgischer Präzision.

### 🚨 KRITISCHE FIXES EXTREME:
- **Login-Probleme** bei bestimmten Browser-Konfigurationen komplett gelöst
- **Datenverlust-Prevention** bei paralleler Bearbeitung mit Transaction-Locking
- **Performance-Einbrüche** in der Benutzerverwaltung radikal behoben
- **Cache-Invalidation** für konsistente Datenansicht

### 📱 MOBILE EXPERIENCE REVOLUTION:
- **Advanced Touch-Interactions** auf Tablets und Smartphones optimiert
- **Enhanced Offline-Funktionalität** für kritische Features
- **Push-Benachrichtigungen** Stabilität und Delivery-Rate verbessert
- **Mobile Performance** für langsame Netzwerke optimiert

### 🔒 SECURITY UPGRADES:
- **XSS-Schwachstellen** in dynamischen Formularen eliminiert
- **CSRF-Protection** auf Enterprise-Level erweitert
- **Datenvalidierung** auf Serverseite mit KI-gestützter Erkennung
- **Security-Audit** für alle Frontend-Komponenten`,
        author: 'QA Special Forces ★',
        publishDate: '2024-01-05',
        category: 'bugfix',
        readTime: 3,
        views: 987,
        isBookmarked: false,
        changes: [
          {
            type: 'fixed',
            items: [
              'Login-Probleme bestimmter Browser komplett gelöst',
              'Datenverlust bei paralleler Bearbeitung verhindert',
              'Performance in Benutzerverwaltung radikal verbessert',
              'Cache-Invalidation für konsistente Daten'
            ]
          },
          {
            type: 'improved',
            items: [
              'Advanced Touch-Interactions auf Tablets',
              'Enhanced Offline-Funktionalität',
              'Push-Benachrichtigungen Delivery-Rate',
              'Mobile Performance für langsame Netzwerke'
            ]
          },
          {
            type: 'security',
            items: [
              'XSS-Schwachstellen in Formularen eliminiert',
              'Enterprise CSRF-Protection',
              'KI-gestützte Datenvalidierung',
              'Vollständiger Security-Audit'
            ]
          }
        ]
      },
      {
        id: '5',
        version: '1.9.0',
        title: '🏗️ Foundation Update: Die Basis für Version 2.0',
        summary: 'Technische Grundlagen für das Major Update - Microservices, Real-time Features und Migrationstools',
        content: `## 🏗️ ARCHITEKTUR-REVOLUTION FÜR DIE ZUKUNFT

Dieses Release legt die technische Grundlage für die kommende Version 2.0 mit ihren revolutionären neuen Features.

### 🏗️ ARCHITEKTUR-ÄNDERUNGEN DER ZUKUNFT:
- **Microservices-Architektur** für unbegrenzte Skalierbarkeit eingeführt
- **Real-time Communication** über WebSockets mit Sub-Second Latency
- **Datenbank-Migration** auf neues High-Performance Schema
- **API-Versioning** für absolute Stabilität in Integrationen

### 🔄 VORBEREITUNGEN FÜR DIE ZUKUNFT:
- **Advanced Daten-Migrationstools** für seamless Upgrade auf 2.0
- **Intelligenter Kompatibilitäts-Layer** für ältere Clients
- **Enterprise Testing-Infrastructure** für neue Features
- **Complete Documentation** Overhaul für Entwickler

### 📊 MONITORING & ANALYTICS:
- **Enhanced Analytics** für System-Performance mit KI-Alerting
- **User-Behavior-Tracking** (100% anonymisiert und DSGVO-konform)
- **Advanced Error-Reporting** System mit Auto-Diagnose
- **Health-Checks** für alle Services mit Auto-Recovery`,
        author: 'Architecture Visionaries ★',
        publishDate: '2024-01-01',
        category: 'improvement',
        readTime: 6,
        views: 1756,
        isBookmarked: true,
        changes: [
          {
            type: 'improved',
            items: [
              'Microservices-Architektur für unbegrenzte Skalierung',
              'Real-time WebSockets mit Sub-Second Latency',
              'High-Performance Datenbank-Schema Migration',
              'Enterprise API-Versioning System'
            ]
          },
          {
            type: 'new',
            items: [
              'Advanced Daten-Migrationstools für 2.0',
              'Intelligenter Kompatibilitäts-Layer',
              'Enterprise Testing-Infrastructure',
              'Complete Documentation Overhaul'
            ]
          },
          {
            type: 'performance',
            items: [
              'Enhanced Analytics mit KI-Alerting',
              'Anonymisiertes User-Behavior-Tracking',
              'Advanced Error-Reporting mit Auto-Diagnose',
              'Health-Checks mit Auto-Recovery'
            ]
          }
        ]
      }
    ];

    // Simuliere API-Call Delay
    setTimeout(() => {
      setEntries(mockChangelog);
      setFilteredEntries(mockChangelog);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter und Suchfunktionen
  useEffect(() => {
    let result = entries;

    if (selectedCategory !== 'all') {
      result = result.filter(entry => entry.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(term) ||
        entry.summary.toLowerCase().includes(term) ||
        entry.content.toLowerCase().includes(term) ||
        entry.version.toLowerCase().includes(term)
      );
    }

    setFilteredEntries(result);
  }, [entries, selectedCategory, searchTerm]);

  const categories = [
    { value: 'all', label: 'Alle Updates', icon: Newspaper },
    { value: 'feature', label: 'Neue Features', icon: Zap },
    { value: 'improvement', label: 'Verbesserungen', icon: Rocket },
    { value: 'bugfix', label: 'Bugfixes', icon: Bug },
    { value: 'security', label: 'Sicherheit', icon: Shield },
    { value: 'performance', label: 'Performance', icon: BarChart3 }
  ];

  const toggleBookmark = (entryId: string) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId 
        ? { ...entry, isBookmarked: !entry.isBookmarked }
        : entry
    ));
  };

  const toggleExpand = (entryId: string) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId 
        ? { ...entry, isExpanded: !entry.isExpanded }
        : entry
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? React.createElement(categoryObj.icon, { className: "h-4 w-4" }) : null;
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'new': return <Zap className="h-4 w-4 text-green-400" />;
      case 'improved': return <Rocket className="h-4 w-4 text-blue-400" />;
      case 'fixed': return <Bug className="h-4 w-4 text-red-400" />;
      case 'security': return <Shield className="h-4 w-4 text-yellow-400" />;
      case 'performance': return <BarChart3 className="h-4 w-4 text-purple-400" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Lade Changelog...</div>
        </div>
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-black sticky top-0 z-50 backdrop-blur-sm bg-black/80">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Home
                </Link>
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  Zurück zum Changelog
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 border-2 border-gray-600 rounded-xl text-gray-300 font-bold flex items-center gap-2">
                  v{selectedEntry.version}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(selectedEntry.id);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedEntry.isBookmarked 
                      ? 'bg-white text-black border-white' 
                      : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                  }`}
                >
                  <Bookmark className="h-5 w-5" fill={selectedEntry.isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button className="p-3 rounded-xl border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Changelog Detail */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-black rounded-full tracking-wide">
                {getCategoryIcon(selectedEntry.category)}
                {selectedEntry.category === 'feature' ? 'Neues Feature' : 
                 selectedEntry.category === 'improvement' ? 'Verbesserung' :
                 selectedEntry.category === 'bugfix' ? 'Bugfix' :
                 selectedEntry.category === 'security' ? 'Sicherheit' : 'Performance'}
              </span>
              <span className="text-2xl font-black text-gray-300">v{selectedEntry.version}</span>
            </div>
            
            <h1 className="text-5xl font-black mb-8 leading-tight tracking-tight">
              {selectedEntry.title}
            </h1>
            
            <div className="flex items-center gap-8 text-gray-400 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <span className="font-bold text-white">{selectedEntry.author}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">{formatDate(selectedEntry.publishDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <span>{selectedEntry.readTime} Min. Lesezeit</span>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5" />
                <span>{selectedEntry.views.toLocaleString()} Aufrufe</span>
              </div>
            </div>
          </div>

          {/* Quick Changes Overview */}
          <div className="mb-12 bg-gray-900 border-2 border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              Schnellübersicht der Änderungen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedEntry.changes.map((changeGroup, index) => (
                <div key={index} className="border-l-4 border-gray-600 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getChangeTypeIcon(changeGroup.type)}
                    <span className="font-black text-lg capitalize">
                      {changeGroup.type === 'new' ? 'Neu hinzugefügt' :
                       changeGroup.type === 'improved' ? 'Verbessert' :
                       changeGroup.type === 'fixed' ? 'Behoben' :
                       changeGroup.type === 'security' ? 'Sicherheit' : 'Performance'}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {changeGroup.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-300 text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12">
            <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black border-4 border-gray-800 rounded-3xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🚀</div>
                <div className="text-2xl font-black mb-2">Version {selectedEntry.version}</div>
                <div className="text-lg font-medium">Update Visualisierung</div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="text-2xl leading-relaxed text-gray-300 mb-12 font-light tracking-wide border-l-4 border-white pl-6 py-2">
              {selectedEntry.summary}
            </div>
            
            <div className="space-y-8 text-lg leading-relaxed text-gray-200 font-light">
              {selectedEntry.content.split('\n\n').map((paragraph, index) => (
                <div key={index}>
                  {paragraph.startsWith('## ') ? (
                    <h3 className="text-3xl font-black mt-12 mb-6 text-white border-b border-gray-800 pb-4">
                      {paragraph.replace('## ', '')}
                    </h3>
                  ) : paragraph.startsWith('### ') ? (
                    <h4 className="text-xl font-black mt-8 mb-4 text-white flex items-center gap-2">
                      {paragraph.includes('🚀') && <Rocket className="h-5 w-5 text-blue-400" />}
                      {paragraph.includes('⚡') && <Zap className="h-5 w-5 text-yellow-400" />}
                      {paragraph.includes('🐛') && <Bug className="h-5 w-5 text-red-400" />}
                      {paragraph.includes('🛡️') && <Shield className="h-5 w-5 text-green-400" />}
                      {paragraph.includes('🗃️') && <Layout className="h-5 w-5 text-purple-400" />}
                      {paragraph.includes('👥') && <Users className="h-5 w-5 text-orange-400" />}
                      {paragraph.includes('🔧') && <School className="h-5 w-5 text-gray-400" />}
                      {paragraph.includes('🎯') && <TrendingUp className="h-5 w-5 text-pink-400" />}
                      {paragraph.includes('🌟') && <Star className="h-5 w-5 text-yellow-400" />}
                      {paragraph.includes('🧹') && <Settings className="h-5 w-5 text-blue-400" />}
                      {paragraph.includes('🏗️') && <Code className="h-5 w-5 text-green-400" />}
                      {paragraph.replace('### ', '').replace(/[🚀⚡🐛🛡️🗃️👥🔧🎯🌟🧹🏗️]/, '')}
                    </h4>
                  ) : (
                    <p className="mb-8 leading-8">
                      {paragraph}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-gray-400">
                Veröffentlicht am {formatDate(selectedEntry.publishDate)}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleBookmark(selectedEntry.id)}
                  className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${
                    selectedEntry.isBookmarked 
                      ? 'bg-white text-black border-white' 
                      : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                  }`}
                >
                  {selectedEntry.isBookmarked ? 'Gemerkt' : 'Merken'}
                </button>
                <button className="px-6 py-3 rounded-xl border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white transition-colors font-bold">
                  Teilen
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="border-b border-gray-800 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 bg-white rounded-2xl">
              <Rocket className="h-10 w-10 text-black" />
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tight">CHANGELOG</h1>
              <div className="flex items-center gap-4 mt-4">
                <Link 
                  to="/"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Zurück zur Hauptseite
                </Link>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400">Alle Updates & Neuerungen</span>
              </div>
            </div>
          </div>
          <p className="text-2xl text-gray-300 max-w-3xl leading-relaxed font-light">
            Bleib auf dem neuesten Stand! Hier findest du alle Updates, neuen Features und Verbesserungen unserer Schulsoftware.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="border-b border-gray-800 bg-black sticky top-0 z-40 backdrop-blur-sm bg-black/95">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Versionen, Features oder Bugfixes suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black border-2 border-gray-700 rounded-xl focus:border-white focus:outline-none transition-colors text-white placeholder-gray-500 font-medium"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex flex-wrap gap-3">
                {categories.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedCategory(value)}
                    className={`px-5 py-3 rounded-xl border-2 font-bold transition-all flex items-center gap-2 ${
                      selectedCategory === value
                        ? 'bg-white text-black border-white'
                        : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Changelog Entries */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {filteredEntries.map(entry => (
            <article 
              key={entry.id}
              className="group cursor-pointer bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-2xl overflow-hidden hover:border-white hover:transform hover:scale-[1.01] transition-all duration-300 hover:shadow-2xl hover:shadow-white/10"
            >
              {/* Version Header */}
              <div 
                className="p-8 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      v{entry.version}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-black rounded-full tracking-wide">
                      {getCategoryIcon(entry.category)}
                      {entry.category === 'feature' ? 'Major Update' : 
                       entry.category === 'improvement' ? 'Verbesserung' :
                       entry.category === 'bugfix' ? 'Bugfix' :
                       entry.category === 'security' ? 'Sicherheit' : 'Performance'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(entry.id);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      entry.isBookmarked 
                        ? 'bg-white text-black border-white' 
                        : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                    }`}
                  >
                    <Bookmark className="h-5 w-5" fill={entry.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <h3 className="text-2xl font-black mb-3 group-hover:text-white transition-colors leading-tight">
                  {entry.title}
                </h3>
                
                <p className="text-gray-400 text-lg mb-6 font-light leading-relaxed">
                  {entry.summary}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{entry.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.publishDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{entry.readTime}min Lesezeit</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{entry.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expandable Changes */}
              <div className="p-6">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(entry.id);
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 font-bold"
                >
                  <ArrowRight className={`h-4 w-4 transform transition-transform ${entry.isExpanded ? 'rotate-90' : ''}`} />
                  {entry.isExpanded ? 'Änderungen ausblenden' : 'Änderungen anzeigen'}
                </button>

                {entry.isExpanded && (
                  <div className="space-y-4">
                    {entry.changes.map((changeGroup, index) => (
                      <div key={index} className="border-l-4 border-gray-600 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getChangeTypeIcon(changeGroup.type)}
                          <span className="font-black text-sm capitalize">
                            {changeGroup.type === 'new' ? 'Neu hinzugefügt' :
                             changeGroup.type === 'improved' ? 'Verbessert' :
                             changeGroup.type === 'fixed' ? 'Behoben' :
                             changeGroup.type === 'security' ? 'Sicherheit' : 'Performance'}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {changeGroup.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-300 text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500 font-medium">
                    Veröffentlicht am {formatDate(entry.publishDate)}
                  </span>
                  <div 
                    className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors font-bold cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <span className="text-sm">Vollständige Release Notes</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-black mb-4">Keine Updates gefunden</h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie aus.
            </p>
          </div>
        )}
      </section>

      {/* Stats Footer */}
      <section className="border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-8 border-2 border-gray-800 rounded-2xl hover:border-white transition-colors">
              <div className="text-4xl font-black mb-3">{entries.length}</div>
              <div className="text-gray-400 font-medium">Updates</div>
            </div>
            <div className="p-8 border-2 border-gray-800 rounded-2xl hover:border-white transition-colors">
              <div className="text-4xl font-black mb-3">
                {entries.filter(e => e.category === 'feature').length}
              </div>
              <div className="text-gray-400 font-medium">Major Releases</div>
            </div>
            <div className="p-8 border-2 border-gray-800 rounded-2xl hover:border-white transition-colors">
              <div className="text-4xl font-black mb-3">
                {[...new Set(entries.map(a => a.author))].length}
              </div>
              <div className="text-gray-400 font-medium">Teams</div>
            </div>
            <div className="p-8 border-2 border-gray-800 rounded-2xl hover:border-white transition-colors">
              <div className="text-4xl font-black mb-3">
                {entries.reduce((sum, entry) => sum + entry.views, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 font-medium">Aufrufe</div>
            </div>
          </div>
          
          {/* Version Timeline */}
          <div className="mt-16 pt-12 border-t border-gray-800">
            <h3 className="text-3xl font-black text-center mb-12">Versionsverlauf</h3>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {entries.slice().reverse().map((entry, index) => (
                <div key={entry.id} className="text-center group cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                  <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-lg transition-all ${
                    entry.version === '2.0' 
                      ? 'bg-white text-black border-white' 
                      : 'border-gray-600 text-gray-300 group-hover:border-white group-hover:text-white'
                  }`}>
                    v{entry.version}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 group-hover:text-white transition-colors">
                    {formatDate(entry.publishDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12 pt-8 border-t border-gray-800">
            <Link 
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white text-white font-black rounded-xl hover:bg-white hover:text-black transition-all duration-300"
            >
              <Home className="h-5 w-5" />
              Zurück zur Hauptseite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;