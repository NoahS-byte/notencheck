import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const BetaPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenBetaWarning = localStorage.getItem('betaWarningDismissed');
    if (!hasSeenBetaWarning) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const dismissPopup = () => {
    localStorage.setItem('betaWarningDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300" />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-orange-500 shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse opacity-20" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">BETA VERSION</h2>
                  <p className="text-orange-100 font-medium text-sm">Entwicklungsversion</p>
                </div>
              </div>
              <button
                onClick={dismissPopup}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center space-y-6">
              <div className="text-6xl animate-bounce">🚧</div>
              
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Website in Entwicklung
                </h3>
                <p className="text-gray-700 leading-relaxed font-medium">
                  Diese Website befindet sich noch in der <strong>Beta-Phase</strong> und 
                  ist nicht in ihrer finalen Form. Es können Fehler auftreten und 
                  Funktionen können sich noch ändern.
                </p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-bold text-orange-800 text-sm">Wichtiger Hinweis</span>
                </div>
                <p className="text-orange-700 text-sm">
                  Bitte verwenden Sie diese Version nur zu Testzwecken. 
                  Für produktive Nutzung warten Sie bitte auf die finale Version.
                </p>
              </div>

              <button
                onClick={dismissPopup}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
              >
                Verstanden - Weiter zur Beta
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BetaPopup;