// src/types/index.ts
export interface Hauptaufgabe {
  id: string;
  aufgabe: string;
  notenpunkte: number;
  gewichtung: number;
}

export interface Teilbewertung {
  id: string;
  aufgabe: string;
  gerundet: boolean;
  notenpunkte: number;
  gewichtung: number;
}

export interface NotenErgebnis {
  notenpunkte: number;
  note: string;
  prozent: number;
  beschreibung: string;
}

export interface NotenskalaItem {
  punkte: number;
  note: string;
  minProzent: number;
  beschreibung: string;
}

// SEK2 Notenskala (0-15 Punkte)
export const NOTENSKALA_SEK2: NotenskalaItem[] = [
  { punkte: 15, note: '15', minProzent: 95, beschreibung: 'Sehr gut+' },
  { punkte: 14, note: '14', minProzent: 90, beschreibung: 'Sehr gut' },
  { punkte: 13, note: '13', minProzent: 85, beschreibung: 'Sehr gut-' },
  { punkte: 12, note: '12', minProzent: 80, beschreibung: 'Gut+' },
  { punkte: 11, note: '11', minProzent: 75, beschreibung: 'Gut' },
  { punkte: 10, note: '10', minProzent: 70, beschreibung: 'Gut-' },
  { punkte: 9, note: '9', minProzent: 65, beschreibung: 'Befriedigend+' },
  { punkte: 8, note: '8', minProzent: 60, beschreibung: 'Befriedigend' },
  { punkte: 7, note: '7', minProzent: 55, beschreibung: 'Befriedigend-' },
  { punkte: 6, note: '6', minProzent: 50, beschreibung: 'Ausreichend+' },
  { punkte: 5, note: '5', minProzent: 45, beschreibung: 'Ausreichend' },
  { punkte: 4, note: '4', minProzent: 39, beschreibung: 'Ausreichend-' },
  { punkte: 3, note: '3', minProzent: 33, beschreibung: 'Mangelhaft+' },
  { punkte: 2, note: '2', minProzent: 27, beschreibung: 'Mangelhaft' },
  { punkte: 1, note: '1', minProzent: 20, beschreibung: 'Mangelhaft-' },
  { punkte: 0, note: '0', minProzent: 0, beschreibung: 'Ungenügend' }
];

// SEK1 Notenskala (1-6)
export const NOTENSKALA_SEK1: NotenskalaItem[] = [
  { punkte: 0, note: '1', minProzent: 93, beschreibung: 'Sehr gut' },
  { punkte: 0, note: '2', minProzent: 80, beschreibung: 'Gut' },
  { punkte: 0, note: '3', minProzent: 70, beschreibung: 'Befriedigend' },
  { punkte: 0, note: '4', minProzent: 40, beschreibung: 'Ausreichend' },
  { punkte: 0, note: '5', minProzent: 20, beschreibung: 'Mangelhaft' },
  { punkte: 0, note: '6', minProzent: 0, beschreibung: 'Ungenügend' }
];

// Alias-Namen für Abwärtskompatibilität
export type MainTask = Hauptaufgabe;
export type SubTask = Teilbewertung;
export type GradeResult = NotenErgebnis;
export type GradeScaleItem = NotenskalaItem;
export const GRADE_SCALE = NOTENSKALA_SEK2;
export const GRADE_SCALE_SEK1 = NOTENSKALA_SEK1;