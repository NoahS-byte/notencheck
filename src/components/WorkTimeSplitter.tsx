import React, { useState, useEffect, useRef } from 'react';
import { Split, Plus, Trash2, Maximize } from 'lucide-react';

interface WorkPeriod {
  id: string;
  task: string;
  minutes: number;
}

const WorkTimeSplitter: React.FC = () => {
  const [periods, setPeriods] = useState<WorkPeriod[]>([
    { id: Date.now().toString(), task: 'Aufgabe 1', minutes: 25 }
  ]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepSoundRef = useRef<OscillatorNode | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const currentPeriodIndexRef = useRef<number>(0);
  const periodsRef = useRef<WorkPeriod[]>([]);

  // Synchronisiere Refs mit State
  useEffect(() => {
    periodsRef.current = periods;
  }, [periods]);

  useEffect(() => {
    currentPeriodIndexRef.current = currentPeriodIndex;
  }, [currentPeriodIndex]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearTimeout(intervalRef.current);
      }
      if (beepSoundRef.current) {
        beepSoundRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const resetInactivityTimer = () => {
    setShowControls(true);
    
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const playBeepSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (beepSoundRef.current) {
        beepSoundRef.current.stop();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 1);
      
      beepSoundRef.current = oscillator;
    } catch (error) {
      console.log('Sound konnte nicht abgespielt werden');
    }
  };

  const addPeriod = () => {
    const newPeriod: WorkPeriod = {
      id: Date.now().toString(),
      task: `Aufgabe ${periods.length + 1}`,
      minutes: 25
    };
    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (id: string) => {
    if (periods.length > 1) {
      const newPeriods = periods.filter(p => p.id !== id);
      setPeriods(newPeriods);
      
      // Aktualisiere currentPeriodIndex falls nötig
      if (currentPeriodIndex >= newPeriods.length) {
        setCurrentPeriodIndex(Math.max(0, newPeriods.length - 1));
      }
    }
  };

  const updatePeriod = (id: string, field: keyof WorkPeriod, value: string | number) => {
    setPeriods(periods.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const startFullscreenTimer = () => {
    if (periods.length === 0) return;
    
    setIsFullscreen(true);
    setCurrentPeriodIndex(0);
    setTimeLeft(periods[0].minutes * 60);
    setIsRunning(true);
    setIsFinished(false);
    setShowControls(true);
    resetInactivityTimer();
    
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    
    startTimer();
  };

  const startTimer = () => {
    const startTime = performance.now();
    let expected = startTime + 1000;
    
    const tick = () => {
      const now = performance.now();
      const drift = now - expected;
      
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Zeit abgelaufen - zur nächsten Periode wechseln
          handlePeriodEnd();
          return 0;
        }
        return prev - 1;
      });
      
      expected += 1000;
      const nextTick = Math.max(0, 1000 - drift);
      
      intervalRef.current = window.setTimeout(tick, nextTick);
    };
    
    tick();
  };

  const handlePeriodEnd = () => {
    if (intervalRef.current) {
      window.clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    playBeepSound();
    
    // Verwende Ref für aktuellste Werte
    const currentIndex = currentPeriodIndexRef.current;
    const currentPeriods = periodsRef.current;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < currentPeriods.length) {
      // SOFORT zur nächsten Periode wechseln - keine Verzögerung!
      setCurrentPeriodIndex(nextIndex);
      setTimeLeft(currentPeriods[nextIndex].minutes * 60);
      
      // Timer sofort für nächste Periode starten
      startTimer();
    } else {
      // Alle Perioden abgeschlossen
      setIsRunning(false);
      setIsFinished(true);
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    setIsRunning(false);
    setIsFinished(false);
    setCurrentPeriodIndex(0);
    setTimeLeft(0);
    
    if (intervalRef.current) {
      window.clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    return periods.reduce((total, period) => total + period.minutes, 0);
  };

  const getProgressPercentage = () => {
    const totalSeconds = periods.reduce((total, period) => total + (period.minutes * 60), 0);
    const completedSeconds = periods.slice(0, currentPeriodIndex).reduce((total, period) => total + (period.minutes * 60), 0);
    const currentPeriodProgress = periods[currentPeriodIndex] ? (periods[currentPeriodIndex].minutes * 60) - timeLeft : 0;
    
    return totalSeconds > 0 ? ((completedSeconds + currentPeriodProgress) / totalSeconds) * 100 : 0;
  };

  // Fullscreen Timer View
  if (isFullscreen) {
    const currentPeriod = periods[currentPeriodIndex];
    const nextPeriod = periods[currentPeriodIndex + 1];
    
    return (
      <div 
        className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50 overflow-hidden"
        onMouseMove={resetInactivityTimer}
        onTouchStart={resetInactivityTimer}
      >
        <div className="text-center max-w-4xl mx-auto px-8 w-full">
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 h-2 mb-8 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          {/* Current Task */}
          <div className="mb-8">
            <h1 className="text-5xl font-black mb-4 break-words">
              {currentPeriod?.task || 'Fertig!'}
            </h1>
            <div className="text-xl opacity-80">
              {currentPeriodIndex + 1} von {periods.length}
            </div>
          </div>
          
          {/* Timer */}
          <div className={`text-8xl font-black mb-8 transition-all duration-300 ${
            isFinished ? 'text-green-400' : 
            timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            {isFinished ? 'FERTIG!' : formatTime(timeLeft)}
          </div>
          
          {/* Next Task Preview */}
          {!isFinished && nextPeriod && (
            <div className="text-lg opacity-60 mb-4">
              ⏭️ {nextPeriod.task} ({nextPeriod.minutes} Min.)
            </div>
          )}

          {/* Status Info */}
          {isFinished && (
            <div className="text-2xl font-bold text-green-400 animate-pulse">
              🎉 Alle Aufgaben erledigt!
            </div>
          )}
        </div>
        
        {/* Exit Button - nur sichtbar bei Aktivität */}
        {showControls && (
          <button
            onClick={exitFullscreen}
            className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-bold transition-colors border-2 border-white animate-pulse"
          >
            Verlassen
          </button>
        )}
      </div>
    );
  }

  // Main Configuration View
  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-900">
        <Split className="h-8 w-8 text-gray-900" />
        <h2 className="text-3xl font-bold text-gray-900">Arbeitszeitsplitter</h2>
      </div>

      {/* Sound Settings */}
      <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Toneinstellungen</h3>
            <p className="text-gray-700 text-sm">
              {soundEnabled ? 'Ton wird am Ende jeder Periode abgespielt' : 'Ton ist deaktiviert'}
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 border-2 border-gray-900 font-bold transition-all ${
              soundEnabled ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {soundEnabled ? 'Ton an' : 'Ton aus'}
          </button>
        </div>
      </div>

      {/* Periods Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Arbeitsperioden ({periods.length})
          </h3>
          <button
            onClick={addPeriod}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors border-2 border-gray-900"
          >
            <Plus className="h-4 w-4" />
            Periode hinzufügen
          </button>
        </div>
        
        <div className="overflow-x-auto border-2 border-gray-900">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Aufgabe</th>
                <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Minuten</th>
                <th className="px-4 py-3 text-center font-bold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period, index) => (
                <tr key={period.id} className={`border-b border-gray-900 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border-r border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={period.task}
                      onChange={(e) => updatePeriod(period.id, 'task', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium bg-white"
                      placeholder="Aufgabenbeschreibung"
                    />
                  </td>
                  <td className="border-r border-gray-300 px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={period.minutes}
                      onChange={(e) => updatePeriod(period.id, 'minutes', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center bg-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {periods.length > 1 && (
                      <button
                        onClick={() => removePeriod(period.id)}
                        className="p-2 text-black hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-gray-900"
                        title="Periode löschen"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border-4 border-gray-900 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Zusammenfassung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-gray-900">{periods.length}</div>
            <div className="text-gray-700 font-medium">Perioden</div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{getTotalTime()}</div>
            <div className="text-gray-700 font-medium">Minuten</div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">
              {Math.floor(getTotalTime() / 60)}:{(getTotalTime() % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-gray-700 font-medium">Stunden</div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={startFullscreenTimer}
          disabled={periods.length === 0 || periods.some(p => !p.task.trim() || p.minutes <= 0)}
          className="flex items-center gap-3 px-8 py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 mx-auto border-2 border-gray-900"
        >
          <Maximize className="h-5 w-5" />
          Timer starten ({periods.length} Perioden)
        </button>
        
        {periods.some(p => !p.task.trim() || p.minutes <= 0) && (
          <p className="text-red-600 font-medium mt-4">
            Bitte füllen Sie alle Aufgaben aus.
          </p>
        )}
      </div>

      {/* Quick Info */}
      <div className="mt-6 text-center text-sm text-gray-600">
        ⚡ Läuft automatisch durch alle {periods.length} Perioden
      </div>
    </div>
  );
};

export default WorkTimeSplitter;