import React, { useEffect, useRef, useState } from 'react';
import { AuthUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const PAYPAL_SDK_SRC = 'https://www.paypal.com/sdk/js?client-id=AZHq3ehr0sWjXHImkC09Jmuc6rz4J6GLZfgvzpLtcIeJ9G-3NQz7dviDz2q7ncibBS36_c8dY9t29Pp6&vault=true&intent=subscription';
const PLAN_ID = 'P-5CH526000E4074402NDFLRBI';

interface PurchasePageProps {
  currentUser: AuthUser;
  onBack: () => void;
  onPurchaseComplete: () => void;
  onTestPayment: () => void;
}

const PurchasePage: React.FC<PurchasePageProps> = ({
  currentUser,
  onBack,
  onPurchaseComplete,
  onTestPayment,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const purchaseSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState(2847);
  const [priceReduction, setPriceReduction] = useState(false);
  const [currentViewers, setCurrentViewers] = useState(Math.floor(Math.random() * 12) + 8);

  // Scroll to purchase section
  const scrollToPurchase = () => {
    purchaseSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Simulate live purchase counter and viewer count
  useEffect(() => {
    const purchaseInterval = setInterval(() => {
      if (Math.random() > 0.65) { // 35% chance every 12 seconds
        setRecentPurchases(prev => prev + 1);
      }
    }, 12000);

    const viewerInterval = setInterval(() => {
      setCurrentViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(5, Math.min(25, prev + change));
      });
    }, 8000);

    // Check if we should show price reduction
    if (recentPurchases >= 3000) {
      setPriceReduction(true);
    }

    return () => {
      clearInterval(purchaseInterval);
      clearInterval(viewerInterval);
    };
  }, [recentPurchases]);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    
    const loadPaypal = () => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${PAYPAL_SDK_SRC}"]`)) {
        if (window.paypal && window.paypal.Buttons) {
          renderPaypalButtons();
        }
        return;
      }

      script = document.createElement('script');
      script.src = PAYPAL_SDK_SRC;
      script.async = true;
      script.onload = () => {
        if (window.paypal && window.paypal.Buttons) {
          renderPaypalButtons();
        }
      };
      document.body.appendChild(script);
    };

    const renderPaypalButtons = () => {
      if (!containerRef.current) return;
      
      // Clear any existing buttons
      containerRef.current.innerHTML = '';
      
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'black',
          layout: 'vertical',
          label: 'subscribe',
          height: 56,
          tagline: false
        },
        createSubscription: function(data: any, actions: any) {
          setPaymentInitiated(true);
          return actions.subscription.create({
            plan_id: PLAN_ID
          });
        },
        onApprove: function(data: any, actions: any) {
          console.log('Subscription approved:', data.subscriptionID);
          onPurchaseComplete();
        },
        onError: function(err: any) {
          console.error('Payment error:', err);
          setPaymentInitiated(false);
          alert('Bei der Bezahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
        },
        onCancel: function() {
          setPaymentInitiated(false);
        }
      }).render(containerRef.current);
    };

    loadPaypal();

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onPurchaseComplete]);

  const currentPrice = priceReduction ? 1.99 : 2.99;
  const progressPercentage = Math.min(100, (recentPurchases / 3000) * 100);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-white/3 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/2 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-8">
        <button
          onClick={onBack}
          className="group flex items-center text-white/60 hover:text-white transition-all duration-700 text-sm tracking-[0.2em] uppercase font-light"
        >
          <div className="w-10 h-10 mr-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </div>
          Zurück zur Anwendung
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          
          {/* Live Stats Bar */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex items-center px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center mr-8">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/80 text-sm font-light tracking-wider">
                  {recentPurchases.toLocaleString()} PREMIUM MITGLIEDER
                </span>
              </div>
              <div className="w-px h-4 bg-white/20 mr-8"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/80 text-sm font-light tracking-wider">
                  {currentViewers} BETRACHTEN GERADE
                </span>
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-8xl lg:text-9xl font-extralight text-white mb-8 tracking-tighter leading-none">
              PREMIUM
            </h1>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
            <p className="text-2xl text-white/60 font-extralight tracking-wide max-w-2xl mx-auto leading-relaxed mb-16">
              Grenzenlose Möglichkeiten.<br />
              Absolute Perfektion.
            </p>

            {/* Jetzt Kaufen CTA Button */}
            <button
              onClick={scrollToPurchase}
              className="group relative inline-flex items-center justify-center px-16 py-6 bg-white text-black rounded-full hover:bg-black hover:text-white transition-all duration-700 transform hover:scale-105 shadow-2xl hover:shadow-3xl font-light tracking-widest text-lg uppercase"
            >
              JETZT KAUFEN
              <svg className="w-5 h-5 ml-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </button>
          </div>

          {/* Price Reduction Alert */}
          {priceReduction && (
            <div className="flex justify-center">
              <div className="inline-flex items-center px-12 py-6 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-xl">
                <svg className="w-6 h-6 text-green-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span className="text-green-400 font-light text-lg tracking-wide">
                  PREISREDUZIERUNG AKTIVIERT: Jetzt nur {currentPrice.toFixed(2)}€/Monat
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="relative z-10 bg-white text-black">
        <div className="max-w-7xl mx-auto px-8 py-32">
          
          {/* Product Showcase */}
          <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
            <div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-black/5 to-transparent rounded-3xl blur-2xl"></div>
                <img 
                  src="/notencheck_full_accsess.png" 
                  alt="Premium Full Access" 
                  className="relative w-full h-auto rounded-2xl shadow-2xl shadow-black/20"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-6xl font-extralight text-black mb-12 tracking-tight leading-none">
                Vollzugriff<br />
                <span className="text-black/40">ohne Grenzen</span>
              </h2>
              
              <div className="space-y-8">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7"></path>
                      </svg>
                    ),
                    title: "Unbegrenzte Nutzung",
                    description: "Alle Tools, Rechner und Features ohne jegliche Einschränkungen"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"></path>
                      </svg>
                    ),
                    title: "Vollständig werbefrei",
                    description: "Arbeiten Sie in einer komplett ablenkungsfreien Umgebung"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                      </svg>
                    ),
                    title: "Cloud-Synchronisation",
                    description: "Automatische Sicherung und Synchronisation auf allen Geräten"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    ),
                    title: "Premium Support",
                    description: "Prioritärer 24/7 Support von unserem Expertenteam"
                  }
                ].map((feature, index) => (
                  <div key={index} className="group flex items-start">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white mr-6 group-hover:scale-110 transition-all duration-500 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-2xl font-light text-black mb-3 group-hover:text-black/80 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-black/60 leading-relaxed font-light text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Section */}
          <div ref={purchaseSectionRef} className="grid lg:grid-cols-3 gap-16">
            
            {/* Left Column - Social Proof */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                
                {/* Stats */}
                <div className="mb-12">
                  <h3 className="text-3xl font-light text-black mb-8">Vertrauen Sie</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-black/10">
                      <span className="text-black/60 font-light">Aktive Mitglieder</span>
                      <span className="text-2xl font-light text-black">{recentPurchases.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-black/10">
                      <span className="text-black/60 font-light">Zufriedenheitsrate</span>
                      <span className="text-2xl font-light text-black">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-black/10">
                      <span className="text-black/60 font-light">Support Verfügbarkeit</span>
                      <span className="text-2xl font-light text-black">24/7</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-black/5 rounded-3xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-black to-black/80 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-light text-sm">MS</span>
                    </div>
                    <div>
                      <div className="font-light text-black">Maria Schmidt</div>
                      <div className="text-sm text-black/60">Geschäftsführerin</div>
                    </div>
                  </div>
                  <blockquote className="text-lg text-black/80 font-light italic leading-relaxed">
                    "Die Premium-Mitgliedschaft hat meine Arbeitsweise revolutioniert. Absolut empfehlenswert."
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Card */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-black/10 rounded-3xl p-12 shadow-2xl shadow-black/10 sticky top-8">
                
                {/* Live Activity */}
                <div className="flex items-center justify-between mb-12 p-6 bg-black/5 rounded-2xl">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-4"></div>
                    <span className="font-light text-black">Live Aktivität</span>
                  </div>
                  <span className="text-black/60 font-light">
                    {currentViewers} Personen schauen gerade
                  </span>
                </div>

                {/* Pricing */}
                <div className="text-center mb-12">
                  <div className="flex items-baseline justify-center mb-4">
                    {priceReduction && (
                      <span className="text-3xl text-black/40 line-through mr-6 font-light">2,99€</span>
                    )}
                    <span className="text-7xl font-extralight text-black tracking-tight">{currentPrice.toFixed(2)}€</span>
                    <span className="text-black/60 ml-4 text-2xl font-light">/Monat</span>
                  </div>
                  {priceReduction && (
                    <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full">
                      <span className="text-green-800 font-light">Sie sparen 1,00€ monatlich</span>
                    </div>
                  )}
                </div>

                {/* Progress to Price Drop */}
                {!priceReduction && (
                  <div className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-light text-black">Bis zur Preisreduzierung</span>
                      <span className="text-black/60 font-light">{3000 - recentPurchases} verbleibend</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-black/60 font-light">
                      Ab 3.000 Mitgliedern sinkt der Preis auf 1,99€/Monat
                    </p>
                  </div>
                )}

                {/* PayPal Button */}
                <div className="mb-8">
                  <div ref={containerRef} id="paypal-button-container"></div>
                </div>

                {/* Loading State */}
                {paymentInitiated && (
                  <div className="mb-8 flex justify-center">
                    <div className="flex items-center space-x-4 text-black/60">
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span className="font-light">Zahlung wird verarbeitet...</span>
                    </div>
                  </div>
                )}

                {/* Security & Guarantees */}
                <div className="space-y-4 mb-8">
                  {[
                    "Jederzeit kündbar",
                    "14 Tage Widerrufsrecht", 
                    "Keine versteckten Kosten",
                    "Sofortiger Zugang",
                    "256-Bit SSL Verschlüsselung"
                  ].map((guarantee, index) => (
                    <div key={index} className="flex items-center text-black/70 font-light">
                      <svg className="w-5 h-5 text-green-600 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {guarantee}
                    </div>
                  ))}
                </div>

                {/* Payment Methods */}
                <div className="border-t border-black/10 pt-8">
                  <div className="text-center text-sm text-black/60 mb-6 font-light">Akzeptierte Zahlungsmethoden</div>
                  <div className="flex justify-center space-x-6">
                    {[
                      { name: 'PayPal', color: 'bg-blue-600' },
                      { name: 'Visa', color: 'bg-blue-800' },
                      { name: 'Mastercard', color: 'bg-red-600' },
                      { name: 'Apple Pay', color: 'bg-black' }
                    ].map((method) => (
                      <div key={method.name} className={`w-16 h-10 ${method.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-xs font-medium text-white">{method.name.slice(0, 4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="mt-32 max-w-5xl mx-auto">
            <h2 className="text-4xl font-light text-black mb-16 text-center">
              Rechtliche Informationen
            </h2>
            
            <div className="grid md:grid-cols-3 gap-16 text-black/70 leading-relaxed font-light">
              <div>
                <h3 className="font-medium text-black mb-6 text-xl">Allgemeine Geschäftsbedingungen</h3>
                <p className="text-lg">
                  Mit dem Abschluss des Abonnements erkennen Sie unsere Allgemeinen Geschäftsbedingungen an. 
                  Das Abonnement verlängert sich automatisch monatlich und kann jederzeit gekündigt werden.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-black mb-6 text-xl">Widerrufsrecht</h3>
                <p className="text-lg">
                  Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
                  Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-black mb-6 text-xl">Datenschutz</h3>
                <p className="text-lg">
                  Ihre personenbezogenen Daten werden entsprechend unserer Datenschutzerklärung verarbeitet. 
                  Wir geben Ihre Daten nicht an Dritte weiter und verwenden sie ausschließlich zur Vertragserfüllung.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Button - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={onTestPayment}
            className="bg-white text-black text-sm py-4 px-8 rounded-full hover:bg-black hover:text-white transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-105 font-light tracking-wide"
            title="Testzahlung durchführen"
          >
            Testabschluss
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-white/40 font-extralight tracking-widest text-sm">
            © {new Date().getFullYear()} eLvonix. ALLE RECHTE VORBEHALTEN.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;