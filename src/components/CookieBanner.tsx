import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Settings, Shield } from 'lucide-react';

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Delay showing banner for smooth entrance
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Premium Backdrop with Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30 backdrop-blur-md z-40 transition-all duration-700" />
      
      {/* Ultra-Premium Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white border-4 border-gray-900 shadow-2xl relative overflow-hidden">
            {/* Animated top border with gradient */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 animate-pulse" />
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-900 to-transparent" />
            
            <div className="relative p-10">
              <div className="flex items-start gap-8">
                {/* Premium Icon Container */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <Cookie className="h-10 w-10 text-white" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <Shield className="h-2 w-2 text-gray-900" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-6">
                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight leading-tight">
                      Datenschutz & Lokale Speicherung
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-600 mb-4" />
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-xl text-gray-700 leading-relaxed font-medium">
                      Diese Anwendung speichert Ihre Daten sicher und verschlüsselt. 
                      <span className="font-bold text-gray-900"> Ihre Privatsphäre ist geschützt.</span>
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-green-800">Sicher</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-blue-800">DSGVO-Konform</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-purple-800">Kein Tracking</span>
                      </div>
                    </div>

                    {showDetails && (
                      <div className="bg-gray-50 border-4 border-gray-900 p-8 space-y-6 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <Settings className="h-6 w-6 text-gray-900" />
                          <h4 className="text-xl font-black text-gray-900">Technische Details</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="bg-white border-2 border-gray-900 p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 bg-gray-900 rounded-full" />
                                <span className="font-black text-gray-900">Datenspeicherung</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                Sichere Speicherung Ihrer Notenprofile mit modernster Verschlüsselung. 
                                Ihre Daten sind geschützt und nur für Sie zugänglich.
                              </p>
                            </div>
                            
                            <div className="bg-white border-2 border-gray-900 p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 bg-gray-900 rounded-full" />
                                <span className="font-black text-gray-900">Benutzereinstellungen</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                Speicherung Ihrer Cookie-Präferenzen und Anwendungseinstellungen 
                                für eine bessere Benutzererfahrung.
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-white border-2 border-gray-900 p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 bg-green-600 rounded-full" />
                                <span className="font-black text-gray-900">Datenschutz</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                Modernste Sicherheitsstandards und Verschlüsselung. 
                                Ihre Privatsphäre ist vollständig geschützt.
                              </p>
                            </div>
                            
                            <div className="bg-white border-2 border-gray-900 p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                                <span className="font-black text-gray-900">Kontrolle</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                Sie können jederzeit alle gespeicherten Daten über die 
                                Kontoeinstellungen verwalten oder die Speicherung deaktivieren.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t-4 border-gray-900 pt-6">
                          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6">
                            <h5 className="font-black text-lg mb-3">Rechtliche Grundlage</h5>
                            <p className="text-sm leading-relaxed opacity-90">
                              Die Speicherung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) 
                              und dient der Bereitstellung der angeforderten Funktionalität (Art. 6 Abs. 1 lit. b DSGVO). 
                              Sie können Ihre Einwilligung jederzeit widerrufen.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Premium Actions */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t-4 border-gray-900">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-3 text-gray-700 hover:text-gray-900 font-bold transition-all duration-300 group transform hover:scale-105"
                >
                  <div className="relative">
                    <Settings className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gray-900 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-10 transition-all duration-300" />
                  </div>
                  <span className="text-lg">
                    {showDetails ? 'Details ausblenden' : 'Technische Details anzeigen'}
                  </span>
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={handleDecline}
                    className="px-10 py-4 border-4 border-gray-900 text-gray-900 font-black text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Nur notwendige
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-black text-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3"
                  >
                    <Check className="h-5 w-5" />
                    Alle akzeptieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;