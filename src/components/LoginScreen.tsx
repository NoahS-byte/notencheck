import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserPlus,
  LogIn,
  Shield,
  Gift,
  School,
  ArrowLeft,
  CheckCircle,
  Cpu,
  Cloud,
  Database,
  Zap,
  Brain,
  Rocket,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { AuthService, AuthUser } from '../services/authService';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success'
  >('idle');

  const [invitationCode, setInvitationCode] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invite');
  });

  useEffect(() => {
    if (invitationCode) {
      setIsLogin(false);
    }
  }, [invitationCode]);

  const [typingText, setTypingText] = useState('');
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const text = 'DIGITALE SCHULE 3.0';
    let index = 0;

    const interval = setInterval(() => {
      setTypingText(text.slice(0, index + 1));
      index++;

      if (index === text.length) {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Feature rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Brain, text: 'KI-gestütztes Lernen', desc: 'Adaptive Lernpfade' },
    { icon: Rocket, text: 'Echtzeit-Analyse', desc: 'Sofortige Einblicke' },
    { icon: Globe, text: 'Vernetzte Klassen', desc: 'Kollaboratives Lernen' },
    { icon: ShieldCheck, text: '100% DSGVO-konform', desc: 'Made in Germany' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setButtonState('loading');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await AuthService.signIn(email, password);
        console.log('Sign in successful, user:', user);
        setButtonState('success');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onLogin(user);
      } else {
        if (password.length < 6) {
          throw new Error('Passwort muss mindestens 6 Zeichen lang sein');
        }

        const user = await AuthService.signUp(
          email,
          password,
          displayName,
          invitationCode || undefined
        );
        setButtonState('success');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (invitationCode) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        onLogin(user);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
      );
      setButtonState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setSchoolId('');
    setButtonState('idle');
  };

  const FeatureIcon = features[currentFeature].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.3)_1px,transparent_1px)] bg-[size:60px_60px] animate-[gridMove_20s_linear_infinite]" />

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-[orbFloat_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-[orbFloat_12s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-[orbFloat_10s_ease-in-out_infinite_1s]" />

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl h-[780px] relative z-10 flex gap-8">
        {/* Left Panel - Vision */}
        <div className="flex-1 bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-12 flex flex-col justify-between relative overflow-hidden group">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-indigo-500/20 opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:200%_200%] animate-shimmer" />

          {/* Content */}
          <div className="relative">
            {/* Animated Logo */}
            <div className="w-36 h-36 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl mb-10 flex items-center justify-center shadow-2xl border border-cyan-500/30 transform group-hover:scale-105 group-hover:rotate-2 transition-all duration-500">
              <div className="relative">
                <Rocket className="h-20 w-20 text-cyan-400" />
                <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-6xl font-black text-white tracking-tight leading-none mb-6 min-h-[120px]">
                {typingText}
                <span className="animate-pulse text-cyan-400">|</span>
              </h1>
              <div className="w-72 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transform group-hover:scale-x-110 transition-transform duration-500" />
            </div>

            <p className="text-2xl text-slate-300 font-medium tracking-wide mb-12">
              Die nächste Evolution des Bildungswesens
            </p>

            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 transform group-hover:scale-105 transition-all duration-500 mb-12">
              {' '}
              {/* Added mb-12 for large margin bottom */}
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  <FeatureIcon className="h-8 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">
                    {features[currentFeature].text}
                  </h3>
                  <p className="text-cyan-300 text-sm">
                    {features[currentFeature].desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      index === currentFeature ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Platform Benefits */}
          <div className="relative mt-8">
            {' '}
            {/* Added mt-8 for additional top margin */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                'KI-gestützte Lernanalyse',
                'Echtzeit-Kollaboration',
                'Automatisierte Berichte',
                '100% Deutsche Infrastruktur',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span className="text-slate-300 text-sm font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
              <p className="text-white font-black text-lg text-center">
                ZUKUNFT DER BILDUNG • MADE IN GERMANY 🇩🇪
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login */}
        <div className="flex-1 bg-slate-800/30 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Glass Header */}
          <div className="bg-gradient-to-r from-slate-800/60 to-cyan-900/30 backdrop-blur-2xl text-white p-10 border-b border-cyan-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />

            <div className="relative">
              <div className="flex items-center gap-6 mb-3">
                <div className="w-20 h-20 bg-cyan-500/20 backdrop-blur-lg border border-cyan-500/30 rounded-2xl flex items-center justify-center">
                  {isLogin ? (
                    <LogIn className="h-10 w-10 text-cyan-400 animate-bounceIn" />
                  ) : (
                    <UserPlus className="h-10 w-10 text-cyan-400 animate-bounceIn" />
                  )}
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">
                    {isLogin ? 'ZUGANG ZUR ZUKUNFT' : 'NEUE ÄRA STARTEN'}
                  </h2>
                  <p className="text-cyan-300/80 text-xl font-medium">
                    {isLogin
                      ? 'Betreten Sie die Bildungsplattform von Morgen'
                      : 'Werden Sie Teil der digitalen Revolution'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-10 h-[520px] overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-7">
                {/* Back to Login */}
                {!isLogin && invitationCode && (
                  <button
                    type="button"
                    onClick={switchMode}
                    className="flex items-center gap-3 text-cyan-300 hover:text-cyan-400 font-bold transition-colors group mb-2"
                  >
                    <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                    Zurück zur Anmeldung
                  </button>
                )}

                {/* Display Name */}
                {!isLogin && (
                  <div className="transform transition-all duration-300">
                    <label className="block text-sm font-black text-white mb-3 uppercase tracking-widest">
                      Anzeigename
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-6 w-6 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-bold rounded-2xl transition-all duration-300 hover:bg-white/15"
                        placeholder="Max Mustermann"
                      />
                    </div>
                  </div>
                )}

                {/* School ID */}
                {!isLogin && (
                  <div className="transform transition-all duration-300">
                    <label className="block text-sm font-black text-white mb-3 uppercase tracking-widest">
                      Schul-ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <School className="h-6 w-6 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-bold rounded-2xl transition-all duration-300 hover:bg-white/15"
                        placeholder="SCHULE-2024-ABC123"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium ml-1">
                      Ihre institutionelle Identifikation
                    </p>
                  </div>
                )}

                {/* Email Field */}
                <div className="transform transition-all duration-300">
                  <label className="block text-sm font-black text-white mb-3 uppercase tracking-widest">
                    E-Mail Adresse
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-6 w-6 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-bold rounded-2xl transition-all duration-300 hover:bg-white/15"
                      placeholder="ihre@email.de"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="transform transition-all duration-300">
                  <label className="block text-sm font-black text-white mb-3 uppercase tracking-widest">
                    Passwort
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-6 w-6 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border-2 border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-bold rounded-2xl transition-all duration-300 hover:bg-white/15"
                      placeholder={
                        isLogin ? '••••••••' : 'Mindestens 6 Zeichen'
                      }
                      required
                      minLength={isLogin ? undefined : 6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6" />
                      ) : (
                        <Eye className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 p-4 rounded-2xl animate-shake">
                  <p className="text-red-200 font-black text-center text-sm">
                    {error}
                  </p>
                </div>
              )}

              {/* Invitation Code */}
              {invitationCode && (
                <div className="bg-cyan-500/20 backdrop-blur-sm border-2 border-cyan-400/50 p-4 rounded-2xl transform transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="h-6 w-6 text-cyan-300" />
                    <span className="font-black text-cyan-300 text-lg">
                      ZUKUNFTS-VERSION AKTIV
                    </span>
                  </div>
                  <p className="text-cyan-200 font-bold text-sm">
                    Einladungscode:{' '}
                    <span className="font-mono bg-cyan-500/30 px-3 py-1 rounded-lg border border-cyan-400/50">
                      {invitationCode}
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-5 bg-cyan-600/20 backdrop-blur-sm border-2 border-cyan-500/30 text-white font-black hover:bg-cyan-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-4 rounded-2xl transform hover:scale-[1.02] shadow-2xl relative overflow-hidden group"
                >
                  {/* Enhanced Loading Animation */}
                  {buttonState === 'loading' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 animate-[shimmerLoad_1.5s_ease-in-out_infinite]" />
                  )}

                  <div className="relative z-10 flex items-center gap-4">
                    {buttonState === 'loading' && (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <div className="absolute inset-0 w-7 h-7 border-3 border-cyan-300 border-b-transparent rounded-full animate-spin reverse" />
                        </div>
                        <span className="text-lg animate-pulse">
                          {isLogin
                            ? 'ZUGANG WIRD VORBEREITET...'
                            : 'REVOLUTION WIRD GESTARTET...'}
                        </span>
                      </div>
                    )}

                    {buttonState === 'success' && (
                      <div className="flex items-center gap-3 animate-bounceIn">
                        <div className="relative">
                          <CheckCircle className="h-7 w-7" />
                          <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping" />
                        </div>
                        <span className="text-lg">ERFOLG!</span>
                      </div>
                    )}

                    {buttonState === 'idle' && (
                      <>
                        {isLogin ? (
                          <Rocket className="h-6 w-6" />
                        ) : (
                          <Zap className="h-6 w-6" />
                        )}
                        <span className="text-lg">
                          {isLogin ? 'JETZT STARTEN' : 'REVOLUTION STARTEN'}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Switch Mode Button */}
                {!invitationCode && (
                  <button
                    type="button"
                    onClick={switchMode}
                    className="px-8 py-5 bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600 text-white font-black hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-500 rounded-2xl flex items-center justify-center gap-3 transform hover:scale-105 group"
                  >
                    {isLogin ? (
                      <>
                        <UserPlus className="h-5 w-5" />
                        <span>NEU</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>LOGIN</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Security Footer */}
              <div className="pt-6 border-t-2 border-slate-600">
                <div className="flex items-center gap-4 justify-center">
                  <ShieldCheck className="h-6 w-6 text-cyan-400" />
                  <span className="text-sm font-black text-slate-300 tracking-widest">
                    100% DEUTSCHE INFRASTRUKTUR • DSGVO KONFORM
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -30px) scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes shimmerLoad {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
