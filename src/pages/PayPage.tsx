import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ArrowRight, 
  Star, 
  Shield, 
  Users, 
  Zap,
  Clock,
  FileText,
  BarChart3,
  Settings,
  X,
  BookOpen,
  Calculator,
  LayoutGrid,
  School
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  savings?: string;
  image: string;
}

const PayPage: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'trial' | 'private' | 'school'>('private');
  const [schoolLicenses, setSchoolLicenses] = useState(20);
  const [prioritySupport, setPrioritySupport] = useState(false);
  const [extendedBackup, setExtendedBackup] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  // Exit Intent Popup
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0) {
        setShowExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // Scroll effect for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: "Dr. Sarah Weber",
      role: "Schulleiterin, Gymnasium München",
      content: "Die Effizienzsteigerung ist bemerkenswert. Unsere Lehrer sparen täglich Stunden bei der Notenverwaltung."
    },
    {
      name: "Michael Schmidt",
      role: "Mathematiklehrer, Berlin",
      content: "Endlich ein Tool, das wirklich versteht, was Lehrer brauchen. Intuitiv und mächtig zugleich."
    },
    {
      name: "Prof. Dr. Anna Müller",
      role: "Fachbereichsleiterin, Hamburg",
      content: "Die Statistik-Features haben unsere Qualitätssicherung revolutioniert. Absolute Empfehlung."
    }
  ];

  const faqs = [
    {
      question: "Kann ich ohne Kreditkarte starten?",
      answer: "Ja. Sie benötigen keine Kreditkarte für die 14-tägige Testversion."
    },
    {
      question: "Was passiert nach den 14 Tagen?",
      answer: "Ihre Daten bleiben erhalten. Sie können jederzeit upgraden oder pausieren."
    },
    {
      question: "Sind meine Daten sicher?",
      answer: "Ja. Ende-zu-Ende-Verschlüsselung, deutsche Rechenzentren, vollständig DSGVO-konform."
    },
    {
      question: "Kann ich kündigen?",
      answer: "Ja, jederzeit ohne Kündigungsfrist."
    }
  ];

  const licenseOptions = [
    { value: 10, label: '10 Lizenzen' },
    { value: 20, label: '20 Lizenzen', popular: true },
    { value: 30, label: '30 Lizenzen', discount: 15 },
    { value: 50, label: '50 Lizenzen', discount: 25 }
  ];

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const calculateSchoolPrice = () => {
    const basePrice = 299;
    const pricePerLicense = 12;
    const totalPrice = basePrice + (schoolLicenses * pricePerLicense);
    
    let discount = 0;
    if (schoolLicenses >= 50) discount = 25;
    else if (schoolLicenses >= 30) discount = 15;
    
    const discountedPrice = totalPrice * (1 - discount / 100);
    const prioritySupportPrice = prioritySupport ? 149 : 0;
    const backupPrice = extendedBackup ? 79 : 0;
    
    return {
      basePrice: totalPrice,
      discount,
      discountedPrice,
      prioritySupportPrice,
      backupPrice,
      finalPrice: discountedPrice + prioritySupportPrice + backupPrice,
      savings: totalPrice - discountedPrice
    };
  };

  const getPrivatePrice = () => {
    const monthlyPrice = 12.99;
    const yearlyPrice = 99.99;
    const yearlyMonthly = yearlyPrice / 12;
    const savings = (monthlyPrice * 12) - yearlyPrice;
    
    return {
      monthly: monthlyPrice,
      yearly: yearlyPrice,
      yearlyMonthly,
      savings
    };
  };

  const schoolPricing = calculateSchoolPrice();
  const privatePricing = getPrivatePrice();

  const tiers: PricingTier[] = [
    {
      id: 'trial',
      name: 'Testversion',
      description: '14 Tage voller Zugang',
      price: 0,
      image: '/notencheck_trial.png',
      features: [
        'Vollständiger Zugang zu allen Tools',
        'Bis zu 30 Schüler verwalten',
        'Notenberechnung & Sitzpläne',
        'Basis-Support per E-Mail',
        'Keine Kreditkarte erforderlich',
        'Jederzeit kündbar'
      ],
      cta: 'Kostenlos starten'
    },
    {
      id: 'private',
      name: 'Privatlizenz',
      description: 'Für individuelle Lehrkräfte',
      price: billingCycle === 'yearly' ? privatePricing.yearly : privatePricing.monthly,
      originalPrice: billingCycle === 'yearly' ? privatePricing.monthly * 12 : undefined,
      image: '/notencheck_private.png',
      features: [
        'Unbegrenzte Schüler & Klassen',
        'Alle Premium-Tools inklusive',
        'Cloud-Synchronisation',
        'Erweiterte Export-Funktionen',
        'Priority E-Mail Support',
        'Mobile App Zugang',
        'DSGVO-konforme Sicherheit'
      ],
      highlighted: true,
      badge: 'BELIEBTESTE WAHL',
      savings: billingCycle === 'yearly' ? `${privatePricing.savings.toFixed(0)}€ sparen` : undefined,
      cta: 'Jetzt upgraden'
    },
    {
      id: 'school',
      name: 'Schullizenz',
      description: 'Komplettlösung für Bildungseinrichtungen',
      price: schoolPricing.finalPrice,
      originalPrice: schoolPricing.discount > 0 ? schoolPricing.basePrice : undefined,
      image: '/notencheck_schools.png',
      features: [
        `${schoolLicenses} Lehrer-Lizenzen`,
        'Unbegrenzte Schülerkapazität',
        'Zentrale Administrationsoberfläche',
        'Erweiterte Analyse-Berichte',
        'Vollständige DSGVO-Compliance',
        'Persönliches Onboarding',
        prioritySupport ? '24/7 Priority Support' : 'Standard Support',
        extendedBackup ? 'Erweiterte Backup-Lösung' : 'Standard Backup'
      ],
      badge: schoolPricing.discount > 0 ? `${schoolPricing.discount}% RABATT` : 'FLEXIBEL',
      cta: 'Angebot anfordern'
    }
  ];

  const features = [
    {
      icon: <Calculator className="h-5 w-5" />,
      title: "Notenberechnung",
      description: "Automatische Berechnung nach 15-Punkte-System mit Gewichtung"
    },
    {
      icon: <LayoutGrid className="h-5 w-5" />,
      title: "Sitzpläne",
      description: "Drag & Drop Generator mit Schülerprofilen"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Leistungsanalytik",
      description: "Detaillierte Statistiken und Trendanalysen"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Klassenmanagement",
      description: "Zentrale Verwaltung aller Schülerdaten"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Berichtsgenerator",
      description: "Automatisierte Berichte für Eltern und Schulleitung"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "DSGVO-Sicherheit",
      description: "Vollständige Konformität mit Datenschutzgesetzen"
    }
  ];

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full border border-gray-300">
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-black mb-2">Noch unentschlossen?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Starten Sie kostenlos und überzeugen Sie sich selbst.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowExitPopup(false);
                    scrollToPricing();
                  }}
                  className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors border border-black text-sm"
                >
                  Kostenlos testen
                </button>
                <button 
                  onClick={() => setShowExitPopup(false)}
                  className="w-full text-gray-600 py-3 rounded-lg border border-gray-400 hover:border-black transition-colors text-sm"
                >
                  Später entscheiden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky CTA Bar */}
      {scrolled && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 z-40">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
                <span className="font-bold text-black text-sm">Notenrechner</span>
              </div>
              
              <button 
                onClick={scrollToPricing}
                className="bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm border border-black"
              >
                Jetzt starten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`border-b border-gray-300 ${scrolled ? 'pt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-black">Notenrechner</span>
            </div>
            <a 
              href="/"
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium border border-gray-400 px-4 py-2 rounded-lg hover:border-black"
            >
              Zurück zur App
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 mb-8 border border-gray-300">
            <Star className="h-3 w-3" />
            Über 10.000 Lehrer vertrauen auf uns
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6 tracking-tight">
            Verwaltungsstress
            <span className="block">beenden</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Bis zu 8 Stunden pro Woche sparen mit automatisierter Notenberechnung und intelligenter Klassenverwaltung.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <button 
              onClick={scrollToPricing}
              className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors border border-black"
            >
              Kostenlos testen
            </button>
            <button className="border border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-black hover:text-black transition-colors">
              Demo ansehen
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span>DSGVO-konform</span>
            </div>
            <div className="w-px h-3 bg-gray-400"></div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-green-600" />
              <span>Keine Kündigungsfrist</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg p-4 transition-all duration-300 hover:border-black group cursor-pointer"
            >
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="font-bold text-black text-sm mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-black mb-3">
            Einfache Preise
          </h2>
          <p className="text-gray-600">
            Wählen Sie den passenden Plan
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-black' : 'text-gray-500'}`}>
            Monatlich
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-12 h-6 bg-gray-300 rounded-full transition-colors border border-gray-400"
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full border border-gray-400 transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6 bg-black' : 'translate-x-0.5'
            }`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-black' : 'text-gray-500'}`}>
              Jährlich
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-300">
              2 MONATE GRATIS
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-lg border transition-all duration-500 cursor-pointer group ${
                tier.highlighted 
                  ? 'border-black scale-105 shadow-lg' 
                  : 'border-gray-300 hover:border-black'
              }`}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {tier.badge && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className={`px-3 py-1 rounded-full font-bold text-xs border ${
                    tier.highlighted 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border-gray-400'
                  }`}>
                    {tier.badge}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Product Image */}
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden border border-gray-300">
                  <img 
                    src={tier.image} 
                    alt={tier.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-lg font-bold text-black mb-1">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    {tier.originalPrice && (
                      <span className="text-sm text-gray-400 line-through font-medium">
                        {tier.originalPrice.toFixed(0)}€
                      </span>
                    )}
                    <div className="text-2xl font-bold text-black">
                      {tier.price === 0 ? 'Kostenlos' : `${tier.price.toFixed(tier.price % 1 === 0 ? 0 : 2)}€`}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {tier.price > 0 && (billingCycle === 'yearly' ? 'pro Jahr' : 'pro Monat')}
                  </div>
                  {tier.savings && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold mt-2 border border-green-300">
                      {tier.savings}
                    </div>
                  )}
                </div>

                {/* Expandable Features */}
                <div className="space-y-2 mb-6 text-left">
                  {tier.features.slice(0, hoveredTier === tier.id ? tier.features.length : 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        tier.highlighted ? 'bg-black border-black' : 'bg-gray-100 border-gray-300'
                      }`}>
                        <Check className={`h-3 w-3 ${
                          tier.highlighted ? 'text-white' : 'text-black'
                        }`} />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {tier.features.length > 4 && hoveredTier !== tier.id && (
                    <div className="text-gray-500 text-xs text-center pt-1">
                      + {tier.features.length - 4} weitere
                    </div>
                  )}
                </div>

                <button className={`w-full py-3 rounded-lg font-bold text-sm border transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-black text-white border-black hover:bg-gray-800'
                    : 'bg-white text-black border-black hover:bg-black hover:text-white'
                }`}>
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* School License Customization */}
        <div className={`max-w-2xl mx-auto mt-8 transition-all duration-500 overflow-hidden ${
          hoveredTier === 'school' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">Schullizenz anpassen</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-black mb-2">Anzahl Lizenzen</label>
              <div className="grid grid-cols-2 gap-2">
                {licenseOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSchoolLicenses(option.value)}
                    className={`relative p-3 border rounded-lg font-medium text-sm transition-all ${
                      schoolLicenses === option.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {option.label}
                    {option.popular && (
                      <div className="absolute -top-1 -right-1 bg-black text-white text-xs px-1 py-0.5 rounded font-bold">
                        BELIEBT
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded-lg hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={prioritySupport}
                  onChange={(e) => setPrioritySupport(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-400 rounded focus:ring-black"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-black text-sm">Priority Support</span>
                    <span className="bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-bold border border-gray-400">
                      +149€/Jahr
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs">
                    24/7 Support • 1h Antwortzeit
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded-lg hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={extendedBackup}
                  onChange={(e) => setExtendedBackup(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-400 rounded focus:ring-black"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-black text-sm">Extended Backup</span>
                    <span className="bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-bold border border-gray-400">
                      +79€/Jahr
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs">
                    365 Tage • Tägliche Backups
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-md mx-auto mt-8 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-bold text-black">30-Tage Geld-zurück-Garantie</h3>
            </div>
            <p className="text-gray-600 text-xs">
              Nicht zufrieden? Erhalten Sie Ihr Geld zurück.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Bereit zu starten?
          </h2>
          <p className="text-gray-300 text-sm mb-6">
            Schließen Sie sich über 10.000 Lehrern an.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors border border-white text-sm">
              Kostenlos testen
            </button>
            <button className="border border-gray-400 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors text-sm">
              Demo vereinbaren
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">N</span>
              </div>
              <span className="font-bold text-black text-sm">Notenrechner</span>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <a href="/impressum" className="hover:text-black transition-colors">Impressum</a>
              <a href="/agb" className="hover:text-black transition-colors">AGB</a>
              <div className="hover:text-black cursor-pointer">Datenschutz</div>
            </div>
            
            <div className="text-xs text-gray-500">
              © 2024 Notenrechner
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PayPage;