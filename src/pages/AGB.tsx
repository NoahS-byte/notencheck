import React from 'react';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

const AGB: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white border-2 border-gray-900 shadow-lg">
          {/* Header */}
          <div className="bg-gray-900 text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <a 
                href="/"
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Zurück zur Hauptseite
              </a>
            </div>
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8" />
              <div>
                <h1 className="text-4xl font-black">ALLGEMEINE GESCHÄFTSBEDINGUNGEN</h1>
                <p className="text-gray-300 font-medium">Gültig ab: [Datum einfügen]</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Entwicklungshinweis */}
            <div className="bg-orange-50 border-2 border-orange-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-orange-800">Entwicklungsversion</h2>
              </div>
              <p className="text-orange-700 leading-relaxed">
                <strong>Wichtiger Hinweis:</strong> Diese Website befindet sich derzeit in der Beta-Phase. 
                Die finalen AGB werden vor dem offiziellen Launch veröffentlicht. Die aktuelle Nutzung 
                erfolgt zu Testzwecken und auf eigene Verantwortung.
              </p>
            </div>

            {/* § 1 Geltungsbereich */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 1 Geltungsbereich</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Webanwendung 
                  "Notenrechner" (nachfolgend "Dienst" genannt), die von Noah Schmeißner 
                  (nachfolgend "Anbieter" genannt) bereitgestellt wird.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Mit der Nutzung des Dienstes erkennt der Nutzer diese AGB als verbindlich an.
                </p>
              </div>
            </section>

            {/* § 2 Leistungsbeschreibung */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Leistungsbeschreibung</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Der Dienst stellt eine webbasierte Anwendung zur Berechnung von Schulnoten nach dem 
                  deutschen 15-Punkte-System zur Verfügung. Zusätzliche Funktionen umfassen:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Klausur-Notenrechner mit Gewichtung</li>
                  <li>Leistungskontrolle und Bewertung</li>
                  <li>Profilverwaltung für gespeicherte Berechnungen</li>
                  <li>Zusätzliche Tools (Timer, QR-Generator, ToDo-Liste)</li>
                </ul>
              </div>
            </section>

            {/* § 3 Nutzungsrecht */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Nutzungsrecht</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Der Anbieter gewährt dem Nutzer ein einfaches, nicht übertragbares Nutzungsrecht 
                  für die Dauer der Vertragslaufzeit.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Die Nutzung ist ausschließlich für den persönlichen, nicht-kommerziellen Gebrauch gestattet.
                </p>
              </div>
            </section>

            {/* § 4 Preise und Zahlungsbedingungen */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Preise und Zahlungsbedingungen</h2>
              <div className="bg-green-50 border-2 border-green-200 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-green-800 mb-2">Kostenlose Nutzung</h3>
                    <p className="text-green-700">
                      Grundfunktionen des Dienstes stehen kostenlos zur Verfügung.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800 mb-2">Premium-Abonnement</h3>
                    <p className="text-green-700">
                      Erweiterte Funktionen sind über ein monatliches Abonnement für 2,00€ verfügbar.
                      Die Abrechnung erfolgt monatlich im Voraus.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* § 5 Datenschutz */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Datenschutz</h2>
              <div className="bg-blue-50 border-2 border-blue-200 p-6">
                <p className="text-blue-800 leading-relaxed">
                  Der Schutz personenbezogener Daten hat für uns höchste Priorität. 
                  Alle Daten werden verschlüsselt gespeichert und nicht an Dritte weitergegeben. 
                  Detaillierte Informationen finden Sie in unserer Datenschutzerklärung.
                </p>
              </div>
            </section>

            {/* § 6 Haftungsausschluss */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Haftungsausschluss</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Die Berechnungen erfolgen nach bestem Wissen und Gewissen. Für die Richtigkeit 
                  der Berechnungen wird keine Gewähr übernommen.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Bei wichtigen Entscheidungen sollten die Ergebnisse durch offizielle Stellen 
                  überprüft werden. Die Nutzung erfolgt auf eigene Verantwortung.
                </p>
              </div>
            </section>

            {/* § 7 Kündigung */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Kündigung</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed">
                  Beide Parteien können das Vertragsverhältnis jederzeit ohne Angabe von Gründen kündigen. 
                  Premium-Abonnements können zum Ende des jeweiligen Abrechnungszeitraums gekündigt werden.
                </p>
              </div>
            </section>

            {/* § 8 Schlussbestimmungen */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Schlussbestimmungen</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist [Ort einfügen].
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit 
                  der übrigen Bestimmungen unberührt.
                </p>
              </div>
            </section>

            {/* Kontakt */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700 leading-relaxed">
                  Bei Fragen zu diesen AGB wenden Sie sich bitte an:<br />
                  <strong>E-Mail:</strong> noah@schmeissner.info<br />
                  <strong>Anschrift:</strong> Lottengrüner Straße 54e, 08541 Theuma, Deutschland
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AGB;