import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Settings, Bell } from 'lucide-react';

type TimerMode = 'countdown' | 'specific-time';

const Timer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [minutes, setMinutes] = useState(25);
  const [targetTime, setTargetTime] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const expectedTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for notification sound
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    return () => {
      if (intervalRef.current) {
        window.clearTimeout(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode === 'countdown') {
      setTimeLeft(minutes * 60);
    } else {
      calculateTimeToTarget();
    }
  }, [minutes, targetTime, mode]);

  const calculateTimeToTarget = () => {
    if (!targetTime) return;
    
    const now = new Date();
    const [hours, mins] = targetTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, mins, 0, 0);
    
    // If target time is earlier today, assume it's tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = Math.floor((target.getTime() - now.getTime()) / 1000);
    setTimeLeft(Math.max(0, diff));
  };

  const startTimer = () => {
    if (timeLeft <= 0) return;
    
    setIsRunning(true);
    setIsFinished(false);
    
    // ULTRA-PRECISE timing using performance.now() with drift compensation
    startTimeRef.current = performance.now();
    expectedTimeRef.current = startTimeRef.current + 1000;
    
    const tick = () => {
      const now = performance.now();
      
      // Only update when we've reached the expected time (prevents drift)
      if (now >= expectedTimeRef.current) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playNotificationSound();
            return 0;
          }
          return prev - 1;
        });
        
        // Calculate next expected time with drift compensation
        expectedTimeRef.current += 1000;
      }
      
      // Schedule next tick with drift compensation (guarantees 1000ms = 1 second)
      const drift = now - expectedTimeRef.current;
      intervalRef.current = window.setTimeout(tick, Math.max(1, 1000 - drift));
    };
    
    tick();
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      window.clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    if (intervalRef.current) {
      window.clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (mode === 'countdown') {
      setTimeLeft(minutes * 60);
    } else {
      calculateTimeToTarget();
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback: show browser notification if audio fails
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Timer beendet!', {
            body: 'Die eingestellte Zeit ist abgelaufen.',
            icon: '/icon.png'
          });
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (mode === 'countdown') {
      const total = minutes * 60;
      return total > 0 ? ((total - timeLeft) / total) * 100 : 0;
    }
    return 0; // For specific time mode, we don't show progress
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-900">
        <Clock className="h-8 w-8 text-gray-900" />
        <h2 className="text-3xl font-bold text-gray-900">Timer</h2>
      </div>

      {/* Mode Selection */}
      <div className="mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => setMode('countdown')}
            className={`px-6 py-3 font-bold transition-all duration-300 ${
              mode === 'countdown'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Countdown-Timer
          </button>
          <button
            onClick={() => setMode('specific-time')}
            className={`px-6 py-3 font-bold transition-all duration-300 ${
              mode === 'specific-time'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Bis zu bestimmter Uhrzeit
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-10">
        {mode === 'countdown' ? (
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Minuten
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 1)}
              disabled={isRunning}
              className="w-full max-w-xs px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
            />
          </div>
        ) : (
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Zielzeit (HH:MM)
            </label>
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              disabled={isRunning}
              className="w-full max-w-xs px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center disabled:bg-gray-100"
            />
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="bg-gray-50 border-4 border-gray-900 p-12 mb-8">
        <div className="text-center">
          <div className={`text-8xl font-black mb-8 transition-all duration-300 ${
            isFinished ? 'text-red-600 animate-pulse' : 
            isRunning ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {formatTime(timeLeft)}
          </div>

          {mode === 'countdown' && (
            <div className="w-full bg-gray-200 h-4 mb-6 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isFinished ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}

          {isFinished && (
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
              <div className="text-2xl font-bold text-red-800 mb-2">
                ⏰ Zeit abgelaufen!
              </div>
              <div className="text-red-700">
                {mode === 'countdown' 
                  ? `${minutes} Minuten sind vergangen.`
                  : `Die Zielzeit ${targetTime} wurde erreicht.`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6 mb-8">
        {!isRunning ? (
          <button
            onClick={startTimer}
            disabled={timeLeft <= 0}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <Play className="h-5 w-5" />
            Starten
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex items-center gap-3 px-8 py-4 bg-yellow-600 text-white font-bold hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105"
          >
            <Pause className="h-5 w-5" />
            Pausieren
          </button>
        )}

        <button
          onClick={resetTimer}
          className="flex items-center gap-3 px-6 py-4 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all duration-300"
        >
          <RotateCcw className="h-5 w-5" />
          Zurücksetzen
        </button>
      </div>

      {/* Info */}
      <div className="bg-gray-50 border-2 border-gray-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-gray-900" />
          <h4 className="text-lg font-bold text-gray-900">Timer-Modi</h4>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Countdown-Timer:</strong> Zählt von einer bestimmten Minutenzahl rückwärts</p>
          <p><strong>Bis zu bestimmter Uhrzeit:</strong> Zählt bis zu einer festgelegten Tageszeit</p>
          <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <Bell className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Browser-Benachrichtigungen werden bei Ablauf der Zeit angezeigt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;