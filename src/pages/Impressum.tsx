import React from 'react';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

const Impressum: React.FC = () => {
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
            <h1 className="text-4xl font-black">IMPRESSUM</h1>
            <p className="text-gray-300 font-medium">Angaben gemäß § 5 TMG</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Anbieter */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Anbieter</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-900" />
                    <div>
                      <p className="font-bold text-gray-900">Noah Schmeißner</p>
                      <p className="text-gray-700">Lottengrüner Straße 54e</p>
                      <p className="text-gray-700">08541 Theuma</p>
                      <p className="text-gray-700">Deutschland</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-900" />
                    <a 
                      href="mailto:noah@schmeissner.info"
                      className="text-gray-900 hover:underline font-medium"
                    >
                      noah@schmeissner.info
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Verantwortlich für den Inhalt */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verantwortlich für den Inhalt</h2>
              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <p className="text-gray-700">
                  Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:<br />
                  <span className="font-bold">Noah Schmeißner</span><br />
                  Lottengrüner Straße 54e<br />
                  08541 Theuma<br />
                  Deutschland
                </p>
              </div>
            </section>

            {/* Haftungsausschluss */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftungsausschluss</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Haftung für Inhalte</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                    Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                    nach den allgemeinen Gesetzen verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Haftung für Links</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
                    Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                    Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
                    Seiten verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Urheberrecht</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                    dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                    der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                    Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </div>
            </section>

            {/* Datenschutz */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Datenschutz</h2>
              <div className="bg-blue-50 border-2 border-blue-200 p-6">
                <p className="text-blue-800 leading-relaxed">
                  Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. 
                  Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder 
                  eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. 
                  Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.
                </p>
              </div>
            </section>

            {/* Entwicklungshinweis */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Entwicklungshinweis</h2>
              <div className="bg-orange-50 border-2 border-orange-200 p-6">
                <p className="text-orange-800 leading-relaxed">
                  <strong>Wichtiger Hinweis:</strong> Diese Website befindet sich derzeit in der Entwicklungsphase 
                  und ist nicht in ihrer finalen Form. Funktionen können sich ändern und es können Fehler auftreten. 
                  Die Nutzung erfolgt auf eigene Verantwortung.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impressum;