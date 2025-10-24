import React, { useState, useCallback } from 'react';
import { Target, TrendingUp, School } from 'lucide-react';
import { 
  calculateGradeFromPercentageSek1, 
  calculateGradeFromPointsSek2,
  getPointsForNextGrade 
} from '../utils/gradeCalculations';
import { NOTENSKALA_SEK1, NOTENSKALA_SEK2 } from '../types';

const PerformanceCalculator: React.FC = () => {
  const [educationLevel, setEducationLevel] = useState<'sek1' | 'sek2'>('sek1');
  const [totalPoints, setTotalPoints] = useState<number>(40);
  const [achievedPoints, setAchievedPoints] = useState<number>(0);

  const calculateResults = useCallback(() => {
    if (totalPoints <= 0) return null;
    
    const percentage = (achievedPoints / totalPoints) * 100;
    
    let gradeResult;
    if (educationLevel === 'sek1') {
      gradeResult = calculateGradeFromPercentageSek1(percentage);
    } else {
      const notenpunkte = (percentage / 100) * 15;
      gradeResult = calculateGradeFromPointsSek2(notenpunkte);
    }
    
    const nextGradeInfo = getPointsForNextGrade(achievedPoints, totalPoints, educationLevel);
    
    return {
      percentage,
      notenpunkte: (percentage / 100) * 15,
      gradeResult,
      nextGradeInfo
    };
  }, [totalPoints, achievedPoints, educationLevel]);

  const results = calculateResults();

  const getGradeScaleInfo = () => {
    if (educationLevel === 'sek1') {
      return NOTENSKALA_SEK1.map(item => (
        <div key={item.note} className="font-medium">
          <strong>{item.note}:</strong> ab {item.minProzent}% ({item.beschreibung})
        </div>
      ));
    } else {
      return NOTENSKALA_SEK2.map(item => (
        <div key={item.note} className="font-medium">
          <strong>{item.note}:</strong> {item.punkte} Punkte ({item.beschreibung})
        </div>
      ));
    }
  };

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-900">
        <div className="flex items-center gap-4">
          <Target className="h-8 w-8 text-gray-900" />
          <h2 className="text-3xl font-bold text-gray-900">Leistungskontrolle</h2>
        </div>
        
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Gesamtpunktzahl
          </label>
          <input
            type="number"
            min="1"
            value={totalPoints}
            onChange={(e) => setTotalPoints(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center"
            placeholder="z.B. 40"
          />
        </div>

        <div>
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Erreichte Punktzahl
          </label>
          <input
            type="number"
            min="0"
            max={totalPoints}
            value={achievedPoints}
            onChange={(e) => setAchievedPoints(Math.max(0, Math.min(totalPoints, parseInt(e.target.value) || 0)))}
            className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 text-xl font-bold text-center"
            placeholder="z.B. 28"
          />
        </div>
      </div>

      {results && (
        <div className="space-y-8">
          {/* Progress Bar */}
          <div className="bg-white border-2 border-gray-900 h-8 overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, results.percentage)}%` }}
            />
          </div>

          {/* Results */}
          <div className="bg-gray-50 border-4 border-gray-900 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">ERGEBNIS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-700 mb-2">Prozentualer Anteil</div>
                <div className="text-6xl font-black text-gray-900">{results.percentage.toFixed(1)}%</div>
              </div>
              
              {/* Note nur für SEK1 anzeigen */}
              {educationLevel === 'sek1' && (
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-700 mb-2">Schulnote</div>
                  <div className="text-6xl font-black text-gray-900">{results.gradeResult.note}</div>
                </div>
              )}
              
              {/* Notenpunkte nur für SEK2 anzeigen */}
              {educationLevel === 'sek2' && (
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-700 mb-2">Notenpunkte</div>
                  <div className="text-6xl font-black text-gray-900">{results.notenpunkte.toFixed(1)}</div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-2">Bewertung</div>
              <div className="text-2xl font-bold text-gray-900">{results.gradeResult.beschreibung}</div>
            </div>
          </div>

          {/* Next Grade Info */}
          {results.nextGradeInfo && results.nextGradeInfo.neededPoints > 0 && (
            <div className="bg-white border-2 border-gray-900 p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-gray-900" />
                <h4 className="text-xl font-bold text-gray-900">Nächstbessere Note</h4>
              </div>
              <div className="text-center">
                <div className="text-lg text-gray-900 mb-2">
                  Für die Note <span className="font-bold">{results.nextGradeInfo.nextGrade}</span> benötigen Sie noch:
                </div>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  {results.nextGradeInfo.neededPoints} {results.nextGradeInfo.neededPoints === 1 ? 'Punkt' : 'Punkte'}
                </div>
                <div className="text-lg text-gray-700">
                  Das entspricht {((results.nextGradeInfo.neededPoints / totalPoints) * 100).toFixed(1)}% der Gesamtpunktzahl.
                </div>
              </div>
            </div>
          )}

          {/* Perfect Score Message */}
          {results.percentage >= (educationLevel === 'sek1' ? 93 : 95) && (
            <div className="bg-white border-2 border-gray-900 p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {educationLevel === 'sek1' ? 'Hervorragende Leistung!' : 'Ausgezeichnet!'}
                </h4>
                <p className="text-lg text-gray-900">
                  {educationLevel === 'sek1' 
                    ? 'Sie haben die beste Note erreicht. Weiter so!' 
                    : 'Sie haben eine ausgezeichnete Punktzahl erreicht.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-10 bg-gray-50 border-2 border-gray-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <School className="h-6 w-6 text-gray-900" />
          <h4 className="text-lg font-bold text-gray-900">
            Bewertungsskala ({educationLevel === 'sek1' ? '1-6 Notensystem' : '15-Punkte-System'})
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-900">
          {getGradeScaleInfo()}
        </div>
        <div className="mt-4 text-xs text-gray-600 italic">
          Basierend auf der {educationLevel === 'sek1' ? 'NOTENSKALA_SEK1' : 'NOTENSKALA_SEK2'} aus types.ts
        </div>
      </div>
    </div>
  );
};

export default PerformanceCalculator;