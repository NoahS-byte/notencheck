// src/utils/gradeCalculations.ts
import { NOTENSKALA_SEK2, NOTENSKALA_SEK1, NotenErgebnis } from '../types';

// SEK2: Notenpunkte (0-15) Berechnung
export const calculateGradeFromPointsSek2 = (punkte: number): NotenErgebnis => {
  const geklemmtePunkte = Math.max(0, Math.min(15, punkte));
  const prozent = (geklemmtePunkte / 15) * 100;
  
  const notenInfo = NOTENSKALA_SEK2.find(skala => geklemmtePunkte >= skala.punkte) || NOTENSKALA_SEK2[NOTENSKALA_SEK2.length - 1];
  
  return {
    notenpunkte: geklemmtePunkte,
    note: notenInfo.note,
    prozent: Math.round(prozent * 100) / 100,
    beschreibung: notenInfo.beschreibung
  };
};

// SEK1: Prozentuale Berechnung (1-6)
export const calculateGradeFromPercentageSek1 = (prozent: number): NotenErgebnis => {
  const geklemmterProzent = Math.max(0, Math.min(100, prozent));
  
  // Für SEK1 finden wir die Note basierend auf dem Prozentwert
  const notenInfo = NOTENSKALA_SEK1.find(skala => geklemmterProzent >= skala.minProzent) || NOTENSKALA_SEK1[NOTENSKALA_SEK1.length - 1];
  
  return {
    notenpunkte: geklemmterProzent,
    note: notenInfo.note,
    prozent: geklemmterProzent,
    beschreibung: notenInfo.beschreibung
  };
};

// Alias für Abwärtskompatibilität
export const calculateGradeFromPercentage = calculateGradeFromPercentageSek1;

// Nächstbessere Note berechnen
export const getNextBetterGrade = (aktuellePunkte: number, bildungsstufe: 'sek1' | 'sek2' = 'sek2'): { punkte: number; note: string; fehlendePunkte: number } | null => {
  const skala = bildungsstufe === 'sek1' ? NOTENSKALA_SEK1 : NOTENSKALA_SEK2;
  
  const aktuellerWert = aktuellePunkte;
  
  const aktuellerIndex = skala.findIndex(skalaItem => 
    bildungsstufe === 'sek1' 
      ? aktuellerWert >= skalaItem.minProzent 
      : aktuellerWert >= skalaItem.punkte
  );
  
  if (aktuellerIndex <= 0) return null;
  
  const naechsteNote = skala[aktuellerIndex - 1];
  
  let fehlendePunkte;
  if (bildungsstufe === 'sek1') {
    const benoetigterProzent = naechsteNote.minProzent;
    fehlendePunkte = benoetigterProzent - aktuellerWert;
  } else {
    fehlendePunkte = naechsteNote.punkte - aktuellePunkte;
  }
  
  return {
    punkte: bildungsstufe === 'sek1' ? naechsteNote.minProzent : naechsteNote.punkte,
    note: naechsteNote.note,
    fehlendePunkte: Math.max(0, fehlendePunkte)
  };
};

// Punkte für nächste Note berechnen
export const getPointsForNextGrade = (achievedPoints: number, totalPoints: number, educationLevel: 'sek1' | 'sek2' = 'sek2'): { neededPoints: number; nextGrade: string } | null => {
  const scale = educationLevel === 'sek1' ? NOTENSKALA_SEK1 : NOTENSKALA_SEK2;
  
  const currentPercentage = (achievedPoints / totalPoints) * 100;
  const currentGradeIndex = scale.findIndex(scaleItem => currentPercentage >= scaleItem.minProzent);
  
  if (currentGradeIndex <= 0) return null;
  
  const nextGrade = scale[currentGradeIndex - 1];
  const neededPercentage = nextGrade.minProzent;
  const neededPoints = Math.ceil((neededPercentage * totalPoints) / 100);
  const missingPoints = neededPoints - achievedPoints;
  
  return {
    neededPoints: Math.max(0, missingPoints),
    nextGrade: nextGrade.grade
  };
};

// Gesamtnote berechnen
export const calculateOverallGrade = (punkte: number, bildungsstufe: 'sek1' | 'sek2'): NotenErgebnis => {
  if (bildungsstufe === 'sek1') {
    return calculateGradeFromPercentageSek1(punkte);
  } else {
    return calculateGradeFromPointsSek2(punkte);
  }
};

// Deutsche Funktionsnamen für zukünftige Verwendung
export const berechneNoteAusPunktenSek2 = calculateGradeFromPointsSek2;
export const berechneNoteAusProzentSek1 = calculateGradeFromPercentageSek1;
export const berechneNaechsteBessereNote = getNextBetterGrade;
export const berechneGesamtnote = calculateOverallGrade;