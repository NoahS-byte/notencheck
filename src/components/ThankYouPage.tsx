import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, Loader } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { AdminService } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

interface ThankYouPageProps {
  currentUser: AuthUser;
  onBack: () => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ currentUser, onBack }) => {
  const [isUpdating, setIsUpdating] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('pending');
  const [error, setError] = useState<string | null>(null);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Payment status update
  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!currentUser || !currentUser.id) {
        setError('Keine User-ID gefunden');
        setUpdateStatus('error');
        setIsUpdating(false);
        return;
      }

      try {
        await AdminService.updateUserPaymentStatus(currentUser.id, 'paid');
        setUpdateStatus('success');
        setAnimationPlayed(true);
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Payment-Status:', error);
        setError('Es gab ein Problem bei der Aktualisierung Ihres Status.');
        setUpdateStatus('error');
      } finally {
        setIsUpdating(false);
      }
    };

    updatePaymentStatus();
  }, [currentUser]);

  // Enhanced SVG animations
  useEffect(() => {
    if (updateStatus === 'success' && svgRef.current) {
      const checkmark = svgRef.current.querySelector('path');
      if (checkmark) {
        const length = checkmark.getTotalLength();
        checkmark.style.strokeDasharray = length.toString();
        checkmark.style.strokeDashoffset = length.toString();
        
        setTimeout(() => {
          checkmark.animate(
            [
              { strokeDashoffset: length },
              { strokeDashoffset: 0 }
            ],
            {
              duration: 600,
              fill: 'forwards',
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }
          );
        }, 400);
      }
    }
  }, [updateStatus]);

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          containerRef.current.style.opacity = '1';
          containerRef.current.style.transform = 'translateY(0px)';
        }
      }, 100);
    }
  }, []);

  const handleNavigateToTools = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div ref={containerRef} className="max-w-lg mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium tracking-wide">Zurück</span>
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="px-8 py-12 text-center">
            
            {/* Status Icon */}
            <div className="mb-8 flex justify-center">
              {updateStatus === 'success' && (
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200/60">
                    <svg 
                      ref={svgRef}
                      className="w-12 h-12 text-white"
                      viewBox="0 0 52 52"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 26l6 6 12-12"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full animate-pulse"></div>
                </div>
              )}
              
              {updateStatus === 'pending' && (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-200/60">
                  <Loader className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
              
              {updateStatus === 'error' && (
                <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-xl shadow-red-200/60">
                  <X className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
              {updateStatus === 'success' && 'Vielen Dank!'}
              {updateStatus === 'pending' && 'Einen Moment...'}
              {updateStatus === 'error' && 'Etwas ist schiefgelaufen'}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 font-medium">
              {updateStatus === 'success' && 'Ihre Transaktion wurde erfolgreich abgeschlossen.'}
              {updateStatus === 'pending' && 'Ihr Zahlungsstatus wird aktualisiert.'}
              {updateStatus === 'error' && 'Es gab ein Problem bei der Verarbeitung.'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8">
                <p className="text-red-800 font-medium mb-2">{error}</p>
                <p className="text-red-600 text-sm">Bitte kontaktieren Sie den Support für weitere Hilfe.</p>
              </div>
            )}
            
            {/* Success Content */}
            {updateStatus === 'success' && (
              <>
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Ihre Bestellung</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Produkt</span>
                      <span className="font-semibold text-gray-900">Premium-Zugang</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Preis</span>
                      <span className="font-semibold text-gray-900">2,99 € / Monat</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Bezahlt
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Gültig bis</span>
                      <span className="font-semibold text-gray-900">In 30 Tagen</span>
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Ihre Premium-Vorteile</h2>
                  <div className="space-y-4">
                    {[
                      'Voller Zugriff auf alle Premium-Tools',
                      'Keine Werbung mehr',
                      'Cloud-Synchronisation Ihrer Daten',
                      'Prioritärer Support'
                    ].map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center text-left"
                        style={{ 
                          animation: updateStatus === 'success' ? `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both` : 'none'
                        }}
                      >
                        <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* Action Button */}
            {updateStatus === 'success' && (
              <button
                onClick={handleNavigateToTools}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200/50 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200/50"
              >
                Zu den Tools
              </button>
            )}

            {updateStatus === 'error' && (
              <button
                onClick={onBack}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-gray-200/50"
              >
                Zurück
              </button>
            )}

            {updateStatus === 'pending' && (
              <div className="w-full bg-gray-100 py-4 px-8 rounded-2xl text-lg font-semibold text-gray-400">
                Bitte warten...
              </div>
            )}
          </div>
        </div>

        {/* Subtle Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Ihre Zahlung wird sicher verarbeitet und Ihr Zugang wurde sofort aktiviert.
        </p>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ThankYouPage;