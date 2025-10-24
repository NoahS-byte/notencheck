import React from 'react';
import { Scale, Shield, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 bg-white border-t-4 border-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-gray-900" />
              <h3 className="text-2xl font-black text-gray-900">NOTENRECHNER</h3>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium">
              Professioneller Rechner für deutsche Schulnoten mit 15-Punkte-System. 
              Entwickelt für Schüler, Studenten und Lehrkräfte zur präzisen Notenberechnung.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span className="font-medium">99% Lokal</span>
            </div>
          </div>

          {/* Legal Section */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-900">Rechtliches</h4>
            <div className="space-y-4">
              {/* Impressum */}
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Impressum</h5>
                <div className="text-gray-700 space-y-1">
                  <p className="font-medium">Angaben gemäß § 5 TMG</p>
                  <p className="font-medium">Noah Schmeißner</p>
                  <p>Lottengrüner Straße 54e<br />08541 Theuma<br />Deutschland</p>
                  <p className="text-sm">Entwickler & Betreiber (noch privates entwickler Projekt)</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4" />
                    <a 
                      href="mailto:noah@schmeissner.info" 
                      className="text-gray-900 hover:underline font-medium"
                    >
                      noah@schmeissner.info
                    </a>
                  </div>
                  <p className="text-sm mt-2">
                    Verantwortlich für den Inhalt und Urheberrechtsbesitzer nach § 55 Abs. 2 RStV: Noah Schmeißner
                  </p>
                </div>
              </div>

              {/* Datenschutz */}
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Datenschutz</h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Diese Anwendung verarbeitet alle Daten ausschließlich lokal in Ihrem Browser. 
                  Es werden keine personenbezogenen Daten an externe Server übertragen oder gespeichert.
                </p>
              </div>
              
              {/* Legal Links */}
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Rechtliches</h5>
                <div className="space-y-2">
                  <div>
                    <a 
                      href="/impressum" 
                      className="text-gray-900 hover:underline font-medium text-sm"
                    >
                      Impressum
                    </a>
                  </div>
                  <div>
                    <a 
                      href="/agb" 
                      className="text-gray-900 hover:underline font-medium text-sm"
                    >
                      AGB
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-900">Technische Informationen</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Bewertungssystem</h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Basiert auf dem deutschen 15-Punkte-System der gymnasialen Oberstufe 
                  gemäß KMK-Vereinbarung zur Gestaltung der gymnasialen Oberstufe.
                </p>
              </div>
              
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Berechnung</h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Gewichtete Durchschnittsberechnung mit Rundung auf zwei Dezimalstellen. 
                  Alle Berechnungen erfolgen in Echtzeit ohne Serververbindung.
                </p>
              </div>
              
              <div>
                <h5 className="font-bold text-gray-900 mb-2">Browser-Kompatibilität</h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Optimiert für moderne Browser mit LocalStorage-Unterstützung. 
                  Funktioniert offline nach dem ersten Laden.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t-2 border-gray-900 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-lg font-bold text-gray-900">
                © 2025 Noah Schmeißner. Alle Rechte vorbehalten.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Entwickelt für das deutsche Bildungssystem • Version 1.8
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="font-medium">Made in Germany</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-6 bg-gray-50 border-2 border-gray-900">
          <h5 className="font-bold text-gray-900 mb-3">Haftungsausschluss</h5>
          <p className="text-sm text-gray-700 leading-relaxed">
            Die Berechnungen erfolgen nach bestem Wissen und Gewissen basierend auf dem deutschen 15-Punkte-System. 
            Für die Richtigkeit der Berechnungen wird keine Gewähr übernommen. Bei wichtigen Entscheidungen 
            sollten die Ergebnisse durch offizielle Stellen überprüft werden. Die Nutzung erfolgt auf eigene Verantwortung.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
