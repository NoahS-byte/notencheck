import React, { useState, useEffect } from 'react';
import { Heart, Mail, X } from 'lucide-react';

interface FeedbackPopupProps {
  onClose: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenFeedbackPopup = localStorage.getItem('feedbackPopupDismissed');
    if (!hasSeenFeedbackPopup) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const dismissPopup = () => {
    localStorage.setItem('feedbackPopupDismissed', 'true');
    setIsVisible(false);
    onClose(); // Wichtig: Ruft die onClose-Funktion auf
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:info@notencheck.app?subject=Feedback%20zu%20NotenCheck&body=Hallo%20NotenCheck-Team,%0A%0AIch%20möchte%20folgendes%20Feedback%20geben:%0A%0A';
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-all duration-300" />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-gray-900 shadow-2xl max-w-md w-full animate-in zoom-in duration-300 rounded-none overflow-hidden">
          
          {/* Header */}
          <div className="bg-gray-900 text-white p-6 relative">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Ihre Meinung</h2>
                  <p className="text-gray-300 font-medium text-xs">Wir schätzen Ihr Feedback</p>
                </div>
              </div>
              <button
                onClick={dismissPopup}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center rounded-full hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>
              
              {/* Text Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide">
                  Gemeinsam besser werden
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm font-normal">
                  NotenCheck lebt von Ihrem Feedback. Als kleines Projekt freue ich mich 
                  sehr über konstruktive Kritik, Anregungen oder Ideen, wie wir die App 
                  noch nützlicher für Sie gestalten können.
                </p>
              </div>

              {/* Email Section */}
              <div className="border-2 border-gray-900 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-bold text-gray-900 text-sm uppercase">Schreiben Sie mir:</p>
                  </div>
                  
                  <button
                    onClick={handleEmailClick}
                    className="text-gray-900 hover:text-gray-700 font-medium text-base transition-colors duration-300 border-b-2 border-gray-900 pb-1"
                  >
                    info@notencheck.app
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                    <Heart className="h-4 w-4 text-gray-900" />
                    <p className="text-gray-600 text-xs">
                      Jede Nachricht wird persönlich gelesen und geschätzt
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEmailClick}
                  className="w-full py-4 bg-gray-900 text-white font-black text-sm uppercase tracking-wider hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                >
                  E-Mail schreiben
                </button>
                
                <button
                  onClick={dismissPopup}
                  className="w-full py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm uppercase tracking-wider hover:bg-gray-50 transition-all duration-300"
                >
                  Später erinnern
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-900 p-4 text-center">
            <p className="text-white text-xs font-medium flex items-center justify-center gap-2">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-white" />
              <span>for better education</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPopup;