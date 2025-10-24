import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Calculator, ToggleLeft, ToggleRight } from 'lucide-react';
import { MainTask, SubTask } from '../types';
import { 
  calculateGradeFromPointsSek2, 
  calculateGradeFromPercentageSek1, 
  getNextBetterGrade 
} from '../utils/gradeCalculations';

interface ExamCalculatorProps {
  currentUserId: string;
}

const ExamCalculator: React.FC<ExamCalculatorProps> = ({ currentUserId }) => {
  const [educationLevel, setEducationLevel] = useState<'sek1' | 'sek2'>('sek2');
  const [inputMode, setInputMode] = useState<'noten' | 'punkte'>('noten');
  const [mainTasks, setMainTasks] = useState<MainTask[]>([
    { id: '1', aufgabe: 'Hauptaufgabe 1', notenpunkte: 0, gewichtung: 100 }
  ]);
  
  const [subTasks, setSubTasks] = useState<SubTask[]>([
    { id: '1', aufgabe: 'Inhalt', gerundet: false, notenpunkte: 0, gewichtung: 60 },
    { id: '2', aufgabe: 'Sprache', gerundet: false, notenpunkte: 0, gewichtung: 40 }
  ]);
  
  const [useSubTasks, setUseSubTasks] = useState(false);
  const [useMainTasksForContent, setUseMainTasksForContent] = useState(true);

  // Auto-calculate content points from main tasks (only if enabled and in SEK2)
  useEffect(() => {
    if (useMainTasksForContent && inputMode === 'noten' && educationLevel === 'sek2') {
      const totalMainPoints = mainTasks.reduce((sum, task) => sum + task.notenpunkte, 0);
      const averageMainPoints = mainTasks.length > 0 ? totalMainPoints / mainTasks.length : 0;
      
      setSubTasks(prev => prev.map((task, index) => 
        index === 0 ? { ...task, notenpunkte: averageMainPoints } : task
      ));
    }
  }, [mainTasks, useMainTasksForContent, inputMode, educationLevel]);

  const addMainTask = useCallback(() => {
    const newTask: MainTask = {
      id: Date.now().toString(),
      aufgabe: `Hauptaufgabe ${mainTasks.length + 1}`,
      notenpunkte: 0,
      gewichtung: 0
    };
    setMainTasks(prev => [...prev, newTask]);
  }, [mainTasks.length]);

  const removeMainTask = useCallback((id: string) => {
    setMainTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const updateMainTask = useCallback((id: string, field: keyof MainTask, value: string | number) => {
    setMainTasks(prev => prev.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  }, []);

  const addSubTask = useCallback(() => {
    const newTask: SubTask = {
      id: Date.now().toString(),
      aufgabe: `Teilbewertung ${subTasks.length + 1}`,
      gerundet: false,
      notenpunkte: 0,
      gewichtung: 0
    };
    setSubTasks(prev => [...prev, newTask]);
  }, [subTasks.length]);

  const removeSubTask = useCallback((id: string) => {
    setSubTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const updateSubTask = useCallback((id: string, field: keyof SubTask, value: string | number | boolean) => {
    if (id === subTasks[0]?.id && field === 'notenpunkte' && useMainTasksForContent && inputMode === 'noten' && educationLevel === 'sek2') {
      return;
    }
    
    setSubTasks(prev => prev.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  }, [subTasks, useMainTasksForContent, inputMode, educationLevel]);

  const calculateWeightedPoints = useCallback((task: MainTask | SubTask) => {
    if ('gerundet' in task) {
      const points = task.gerundet ? Math.round(task.notenpunkte) : task.notenpunkte;
      return points * (task.gewichtung / 100);
    }
    return task.notenpunkte * (task.gewichtung / 100);
  }, []);

  const calculateTotalResults = useCallback(() => {
    let gesamtnote = 0;
    let prozentwert = 0;
    
    if (educationLevel === 'sek1') {
      // SEK1: Spezifische Berechnung
      if (inputMode === 'punkte') {
        // Punkte-Modus für SEK1
        const totalAchievable = mainTasks.reduce((sum, task) => sum + (task.gewichtung || 0), 0);
        const totalAchieved = mainTasks.reduce((sum, task) => sum + task.notenpunkte, 0);
        
        if (totalAchievable > 0) {
          prozentwert = (totalAchieved / totalAchievable) * 100;
          gesamtnote = prozentwert; // Für SEK1 ist die Gesamtnote der Prozentwert
        }
      } else {
        // Noten-Modus für SEK1 - Hier müssen wir zuerst den Prozentwert berechnen
        if (useSubTasks) {
          // Für Teilbewertungen: gewichteter Durchschnitt
          const totalWeight = subTasks.reduce((sum, task) => sum + task.gewichtung, 0);
          const weightedSum = subTasks.reduce((sum, task) => {
            const points = task.gerundet ? Math.round(task.notenpunkte) : task.notenpunkte;
            return sum + (points * task.gewichtung);
          }, 0);
          
          if (totalWeight > 0) {
            gesamtnote = weightedSum / totalWeight;
            // Für SEK1 müssen wir die Note in einen Prozentwert umwandeln
            // Annahme: Note 1 = 100%, Note 6 = 0%
            prozentwert = Math.max(0, Math.min(100, 100 - ((gesamtnote - 1) * 20)));
          }
        } else {
          // Für Hauptaufgaben: gewichteter Durchschnitt
          const totalWeight = mainTasks.reduce((sum, task) => sum + task.gewichtung, 0);
          const weightedSum = mainTasks.reduce((sum, task) => sum + (task.notenpunkte * task.gewichtung), 0);
          
          if (totalWeight > 0) {
            gesamtnote = weightedSum / totalWeight;
            // Für SEK1 müssen wir die Note in einen Prozentwert umwandeln
            // Annahme: Note 1 = 100%, Note 6 = 0%
            prozentwert = Math.max(0, Math.min(100, 100 - ((gesamtnote - 1) * 20)));
          }
        }
      }
    } else {
      // SEK2: Spezifische Berechnung (bleibt gleich)
      if (inputMode === 'punkte') {
        const totalAchievable = mainTasks.reduce((sum, task) => sum + (task.gewichtung || 0), 0);
        const totalAchieved = mainTasks.reduce((sum, task) => sum + task.notenpunkte, 0);
        
        if (totalAchievable > 0) {
          prozentwert = (totalAchieved / totalAchievable) * 100;
          gesamtnote = (prozentwert / 100) * 15;
        }
      } else {
        if (useSubTasks) {
          gesamtnote = subTasks.reduce((sum, task) => sum + calculateWeightedPoints(task), 0);
        } else {
          const mainWeightedSum = mainTasks.reduce((sum, task) => sum + calculateWeightedPoints(task), 0);
          const mainWeightSum = mainTasks.reduce((sum, task) => sum + (task.gewichtung / 100), 0);
          gesamtnote = mainWeightSum > 0 ? mainWeightedSum / mainWeightSum : 0;
        }
        prozentwert = (gesamtnote / 15) * 100;
      }
    }
    
    let gradeResult;
    if (educationLevel === 'sek1') {
      gradeResult = calculateGradeFromPercentageSek1(prozentwert);
    } else {
      gradeResult = calculateGradeFromPointsSek2(gesamtnote);
    }
    
    return {
      gesamtnote,
      prozentwert,
      gradeResult
    };
  }, [mainTasks, subTasks, useSubTasks, calculateWeightedPoints, educationLevel, inputMode]);

  const results = calculateTotalResults();
  const nextBetterGrade = getNextBetterGrade(results.gesamtnote, educationLevel);

  // Überprüfe ob die Gewichtung 100% ergibt (nur im Noten-Modus)
  const totalMainWeight = mainTasks.reduce((sum, task) => sum + task.gewichtung, 0);
  const totalSubWeight = subTasks.reduce((sum, task) => sum + task.gewichtung, 0);
  const isWeightValid = inputMode === 'punkte' || (useSubTasks ? Math.abs(totalSubWeight - 100) < 0.1 : Math.abs(totalMainWeight - 100) < 0.1);

  // Validierung: Erreichte Punkte dürfen nicht über erreichbaren Punkten liegen
  const validateAchievedPoints = (taskId: string, achieved: number, achievable: number) => {
    if (achieved > achievable) {
      return achievable;
    }
    return achieved;
  };

  // Validierung: SEK1 Noten müssen ganze Zahlen zwischen 1-6 sein
  const validateSek1Grade = (value: string): number => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 6) {
      return 1;
    }
    return numValue;
  };

  // Platzhalter für Gewichtung basierend auf Index und Bildungsstufe
  const getWeightPlaceholder = (index: number, isSubTask: boolean = false) => {
    if (inputMode === 'punkte') {
      return index === 0 ? "30" : "0";
    }
    
    if (educationLevel === 'sek2') {
      if (isSubTask) {
        return "0";
      }
      return index === 0 ? "100" : "0";
    } else {
      // SEK1: Gleiches Verhalten wie SEK2
      if (isSubTask) {
        return "0";
      }
      return index === 0 ? "100" : "0";
    }
  };

  // Platzhalter für Notenpunkte basierend auf Bildungsstufe
  const getPointsPlaceholder = () => {
    if (inputMode === 'punkte') {
      return "0";
    }
    return educationLevel === 'sek2' ? "0" : "1";
  };

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8 relative">
      {/* Header mit Dropdowns */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-900">
        <div className="flex items-center gap-4">
          <Calculator className="h-8 w-8 text-gray-900" />
          <h2 className="text-3xl font-bold text-gray-900">
            {educationLevel === 'sek2' ? 'Klausur-Notenrechner' : 'Klassenarbeits-Rechner'}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Bildungsstufe Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Bildungsstufe</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as 'sek1' | 'sek2')}
              className="px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600"
            >
              <option value="sek1">Sekundarstufe 1</option>
              <option value="sek2">Sekundarstufe 2</option>
            </select>
          </div>

          {/* Eingabemodus Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Eingabemodus</label>
            <select
              value={inputMode}
              onChange={(e) => setInputMode(e.target.value as 'noten' | 'punkte')}
              className="px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600"
            >
              <option value="noten">Noten</option>
              <option value="punkte">Bewertungseinheiten</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gewichtungs-Warnung */}
      {!isWeightValid && inputMode === 'noten' && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400">
          <p className="text-yellow-800 font-medium">
            ⚠️ Die Gesamtgewichtung beträgt {useSubTasks ? totalSubWeight.toFixed(1) : totalMainWeight.toFixed(1)}%. 
            Bitte stellen Sie sicher, dass die Summe aller Gewichtungen genau 100% ergibt.
          </p>
        </div>
      )}

      {/* Main Tasks Table */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Hauptaufgaben</h3>
          <button
            onClick={addMainTask}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Aufgabe hinzufügen
          </button>
        </div>
        
        <div className="overflow-x-auto border-2 border-gray-900">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Aufgabe</th>
                {inputMode === 'noten' ? (
                  <>
                    <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">
                      {educationLevel === 'sek2' ? 'Notenpunkte' : 'Note (1-6)'}
                    </th>
                    <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Gewichtung (%)</th>
                    <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Gewichtet</th>
                  </>
                ) : (
                  <>
                    <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Erreichbare Punkte</th>
                    <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Erreichte Punkte</th>
                  </>
                )}
                <th className="px-4 py-3 text-center font-bold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {mainTasks.map((task, index) => (
                <tr key={task.id} className={`border-b border-gray-900 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border-r border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={task.aufgabe}
                      onChange={(e) => updateMainTask(task.id, 'aufgabe', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
                    />
                  </td>
                  
                  {inputMode === 'noten' ? (
                    <>
                      <td className="border-r border-gray-300 px-4 py-3">
                        <input
                          type="number"
                          min={educationLevel === 'sek2' ? "0" : "1"}
                          max={educationLevel === 'sek2' ? "15" : "6"}
                          step={educationLevel === 'sek2' ? "0.1" : "1"}
                          value={task.notenpunkte || ''}
                          onChange={(e) => {
                            let value: number;
                            if (educationLevel === 'sek1') {
                              value = validateSek1Grade(e.target.value);
                            } else {
                              value = parseFloat(e.target.value) || 0;
                            }
                            updateMainTask(task.id, 'notenpunkte', value);
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center placeholder-gray-400"
                          placeholder={getPointsPlaceholder()}
                        />
                      </td>
                      <td className="border-r border-gray-300 px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={task.gewichtung || ''}
                          onChange={(e) => updateMainTask(task.id, 'gewichtung', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center placeholder-gray-400"
                          placeholder={getWeightPlaceholder(index)}
                        />
                      </td>
                      <td className="border-r border-gray-300 px-4 py-3 font-bold text-center text-lg">
                        {calculateWeightedPoints(task).toFixed(2)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border-r border-gray-300 px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={task.gewichtung || ''}
                          onChange={(e) => updateMainTask(task.id, 'gewichtung', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center placeholder-gray-400"
                          placeholder={getWeightPlaceholder(index)}
                        />
                      </td>
                      <td className="border-r border-gray-300 px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={task.gewichtung}
                          step="1"
                          value={task.notenpunkte || ''}
                          onChange={(e) => {
                            const achieved = parseFloat(e.target.value) || 0;
                            const validated = validateAchievedPoints(task.id, achieved, task.gewichtung);
                            updateMainTask(task.id, 'notenpunkte', validated);
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center placeholder-gray-400"
                          placeholder="0"
                        />
                      </td>
                    </>
                  )}
                  
                  <td className="px-4 py-3 text-center">
                    {mainTasks.length > 1 && (
                      <button
                        onClick={() => removeMainTask(task.id)}
                        className="p-2 text-gray-900 hover:bg-gray-200 transition-colors"
                        title="Aufgabe löschen"
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

      {/* Sub Tasks Toggle - Nur im Noten-Modus */}
      {inputMode === 'noten' && educationLevel === 'sek2' && (
        <div className="mb-8">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={useSubTasks}
              onChange={(e) => setUseSubTasks(e.target.checked)}
              className="w-6 h-6 border-2 border-gray-900 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xl font-bold text-gray-900">Teilbewertungen verwenden</span>
          </label>
        </div>
      )}

      {/* Sub Tasks Table - Nur im Noten-Modus und SEK2 */}
      {useSubTasks && inputMode === 'noten' && educationLevel === 'sek2' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Teilbewertungen</h3>
            <button
              onClick={addSubTask}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Teilbewertung hinzufügen
            </button>
          </div>
          
          <div className="overflow-x-auto border-2 border-gray-900">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Aufgabe</th>
                  <th className="border-r border-gray-700 px-4 py-3 text-center font-bold">Gerundet</th>
                  <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Notenpunkte</th>
                  <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Gewichtung (%)</th>
                  <th className="border-r border-gray-700 px-4 py-3 text-left font-bold">Gewichtet</th>
                  <th className="px-4 py-3 text-center font-bold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {subTasks.map((task, index) => (
                  <tr key={task.id} className={`border-b border-gray-900 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="border-r border-gray-300 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={task.aufgabe}
                          onChange={(e) => updateSubTask(task.id, 'aufgabe', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
                        />
                        {index === 0 && (
                          <button
                            onClick={() => setUseMainTasksForContent(!useMainTasksForContent)}
                            className="p-2 text-gray-900 hover:bg-gray-200 transition-colors flex items-center gap-1"
                            title={useMainTasksForContent ? 'Automatische Berechnung deaktivieren' : 'Automatische Berechnung aktivieren'}
                          >
                            {useMainTasksForContent ? (
                              <ToggleRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={task.gerundet}
                        onChange={(e) => updateSubTask(task.id, 'gerundet', e.target.checked)}
                        className="w-5 h-5 border-2 border-gray-900 focus:ring-0 focus:ring-offset-0"
                      />
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="15"
                        step="0.1"
                        value={task.notenpunkte || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateSubTask(task.id, 'notenpunkte', value);
                        }}
                        disabled={index === 0 && useMainTasksForContent}
                        className={`w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center placeholder-gray-400 ${
                          index === 0 && useMainTasksForContent ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="0"
                        title={index === 0 && useMainTasksForContent ? 'Wird automatisch aus Hauptaufgaben berechnet' : ''}
                      />
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={task.gewichtung || ''}
                        onChange={(e) => updateSubTask(task.id, 'gewichtung', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center placeholder-gray-400"
                        placeholder={getWeightPlaceholder(index, true)}
                      />
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 font-bold text-center text-lg">
                      {calculateWeightedPoints(task).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {subTasks.length > 1 && (
                        <button
                          onClick={() => removeSubTask(task.id)}
                          className="p-2 text-gray-900 hover:bg-gray-200 transition-colors"
                          title="Teilbewertung löschen"
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
          
          {/* Content Auto-calculation Info */}
          {useMainTasksForContent && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                ℹ️ Die Notenpunkte für "Inhalt" werden automatisch aus dem Durchschnitt der Hauptaufgaben berechnet. 
                Klicken Sie auf den Toggle-Button neben "Inhalt", um die manuelle Eingabe zu aktivieren.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="bg-gray-50 border-4 border-gray-900 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">GESAMTERGEBNIS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Notenpunkte nur in SEK2 anzeigen */}
          {educationLevel === 'sek2' && (
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-2">
                {inputMode === 'punkte' ? 'Erreichte Punkte' : 'Notenpunkte'}
              </div>
              <div className="text-6xl font-black text-gray-900 mb-2">{results.gesamtnote.toFixed(2)}</div>
            </div>
          )}
          
          {/* Schulnote/Notenpunkte anzeigen */}
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">
              {educationLevel === 'sek2' ? 'Note' : 'Schulnote'}
            </div>
            <div className="text-6xl font-black text-gray-900 mb-2">{results.gradeResult.note}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">Prozentwert</div>
            <div className="text-4xl font-bold text-gray-900">{results.prozentwert.toFixed(1)}%</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">Bewertung</div>
            <div className="text-2xl font-bold text-gray-900">{results.gradeResult.beschreibung}</div>
          </div>
        </div>
        
        {nextBetterGrade && nextBetterGrade.missingPoints > 0 && (
          <div className="mt-8 p-6 bg-white border-2 border-gray-900">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 mb-2">
                Für die nächstbessere Note ({nextBetterGrade.grade}) fehlen noch:
              </div>
              <div className="text-4xl font-black text-gray-900">
                {nextBetterGrade.missingPoints.toFixed(2)} {educationLevel === 'sek2' ? 'Notenpunkte' : 'Punkte'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCalculator;