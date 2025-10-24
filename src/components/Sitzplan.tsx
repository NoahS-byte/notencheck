import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Users,
  Grid,
  GripVertical,
  Download,
  Printer,
  Settings,
  X,
  Edit3,
  Shuffle,
  Square,
  ChevronDown,
  ChevronUp,
  School,
  Search,
  Filter,
  Database,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Monitor,
  Palette,
  Smartphone,
  Desktop,
  User,
  Calendar,
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  SchoolService,
  SchoolClass,
  School as SchoolType,
} from '../services/schoolService';
import * as XLSX from 'xlsx';

interface SitzplanProps {
  currentUserId: string;
}

interface Classroom {
  id: string;
  name: string;
  className: string;
  roomNumber: string;
  rows: number;
  columns: number;
  studentsPerDesk: number;
  desks: Desk[][];
}

interface Desk {
  id: string;
  students: Student[];
  isEmpty: boolean;
  position: { row: number; col: number };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  isExcluded?: boolean;
}

interface LocalSchoolClass {
  id: string;
  name: string;
  students: Student[];
  is_selected?: boolean;
}

interface ExcelColumn {
  header: string;
  index: number;
}

interface ImportConfig {
  firstNameColumn: string;
  lastNameColumn: string;
  availableColumns: ExcelColumn[];
}

interface PDFTheme {
  id: string;
  name: string;
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  textColor: [number, number, number];
  backgroundColor: [number, number, number];
  lineWidth: number;
  hasBackground: boolean;
}

const Sitzplan: React.FC<SitzplanProps> = ({ currentUserId }) => {
  // Sitzplan States
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSettings, setExpandedSettings] = useState(true);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Datenbank States
  const [classes, setClasses] = useState<LocalSchoolClass[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Import States
  const [importMode, setImportMode] = useState<'database' | 'excel' | 'manual'>(
    'database'
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    firstNameColumn: '',
    lastNameColumn: '',
    availableColumns: [],
  });
  const [importedStudents, setImportedStudents] = useState<Student[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Globale Einstellungen
  const [globalSettings, setGlobalSettings] = useState({
    rows: 4,
    columns: 6,
    studentsPerDesk: 2,
  });

  // PDF Themes - OPTIMIERTES BLAU PROFESSIONAL DESIGN
  const [selectedTheme, setSelectedTheme] = useState<string>('blue');
  const pdfThemes: PDFTheme[] = [
    {
      id: 'blue',
      name: 'Blau Professional Premium',
      primaryColor: [13, 36, 89],
      secondaryColor: [30, 64, 175],
      textColor: [15, 23, 42],
      backgroundColor: [255, 255, 255],
      lineWidth: 1.2,
      hasBackground: true,
    },
    {
      id: 'black',
      name: 'Schwarz-Weiß Premium',
      primaryColor: [0, 0, 0],
      secondaryColor: [45, 55, 72],
      textColor: [0, 0, 0],
      backgroundColor: [255, 255, 255],
      lineWidth: 1.5,
      hasBackground: false,
    },
    {
      id: 'ink',
      name: 'Tinte Sparen Pro',
      primaryColor: [25, 25, 25],
      secondaryColor: [80, 80, 80],
      textColor: [0, 0, 0],
      backgroundColor: [255, 255, 255],
      lineWidth: 0.4,
      hasBackground: false,
    },
  ];

  // Frei-Objekt
  const freeStudent: Student = {
    id: 'free',
    firstName: 'Frei',
    lastName: '',
  };

  // Mobile Detection mit verbesserter Logik
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Automatisch Settings auf Mobile ausblenden
      if (mobile && showSettings) {
        setShowSettings(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [showSettings]);

  // 1. USER ID ABRUF
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await import('../lib/supabase').then((mod) =>
          mod.supabase.auth.getUser()
        );
        if (user) {
          setUserId(user.id);
        } else {
          setUserId('demo-user');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setUserId('demo-user');
      }
    };

    getCurrentUser();
  }, []);

  // 2. SCHULEN ABRUF
  useEffect(() => {
    const loadSchools = async () => {
      if (userId) {
        setLoading(true);
        try {
          const schoolsData = await SchoolService.getSchools(userId);
          setSchools(schoolsData);

          if (schoolsData.length > 0 && !selectedSchool) {
            setSelectedSchool(schoolsData[0].id);
          }
        } catch (error) {
          console.error('Fehler beim Laden der Schulen:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSchools();
  }, [userId]);

  // 3. KLASSEN UND SCHÜLER ABRUF
  useEffect(() => {
    const loadClasses = async () => {
      if (userId && selectedSchool) {
        setLoading(true);
        try {
          const classesData = await SchoolService.getClasses(
            userId,
            selectedSchool
          );
          const classesWithStudents = await Promise.all(
            classesData.map(async (cls) => {
              const students = await SchoolService.getStudents(cls.id);
              return {
                id: cls.id,
                name: cls.name,
                students: students.map((student) => ({
                  id: student.id,
                  firstName: student.firstName || 'Unbekannt',
                  lastName: student.lastName || 'Unbekannt',
                  isExcluded: false,
                })),
                is_selected: false,
              };
            })
          );

          setClasses(classesWithStudents);

          if (classesWithStudents.length > 0 && !selectedClass) {
            setSelectedClass(classesWithStudents[0].id);
          }
        } catch (error) {
          console.error('Fehler beim Laden der Klassen:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadClasses();
  }, [selectedSchool, userId]);

  // Aktuelle Klasse aus Datenbank
  const currentClass = classes.find((c) => c.id === selectedClass);

  // Verfügbare Schüler basierend auf Import-Modus
  const getAvailableStudents = () => {
    if (importMode === 'excel' || importMode === 'manual') {
      return importedStudents.filter((student) => !student.isExcluded);
    }

    if (currentClass) {
      return currentClass.students.filter((student) => !student.isExcluded);
    }
    return [];
  };

  // Verfügbare Schüler in Sidebar laden
  useEffect(() => {
    const availableStudents = getAvailableStudents();
    setAvailableStudents(availableStudents);
  }, [currentClass, classes, importedStudents, importMode]);

  // Mock Data für Entwicklung als Fallback
  useEffect(() => {
    if (
      classes.length === 0 &&
      !selectedClassroom &&
      importMode === 'database'
    ) {
      const mockClassroom: Classroom = {
        id: '1',
        name: 'Mathematik - Raum 101',
        className: '10a',
        roomNumber: '101',
        rows: globalSettings.rows,
        columns: globalSettings.columns,
        studentsPerDesk: globalSettings.studentsPerDesk,
        desks: Array(globalSettings.rows)
          .fill(null)
          .map((_, row) =>
            Array(globalSettings.columns)
              .fill(null)
              .map((_, col) => ({
                id: `${row}-${col}`,
                students: [],
                isEmpty: true,
                position: { row, col },
              }))
          ),
      };
      setClassrooms([mockClassroom]);
      setSelectedClassroom(mockClassroom);
    }
  }, [classes, importMode, globalSettings]);

  // Warnung bei Sitzplatz-Schüler-Diskrepanz
  const checkSeatStudentDiscrepancy = () => {
    if (!selectedClassroom) return null;

    const totalSeats =
      selectedClassroom.rows *
      selectedClassroom.columns *
      selectedClassroom.studentsPerDesk;
    const totalStudents =
      getAvailableStudents().length +
      selectedClassroom.desks
        .flat()
        .flatMap((desk) => desk.students.filter((s) => s.id !== 'free')).length;

    if (totalSeats < totalStudents) {
      return {
        type: 'warning' as const,
        message: `⚠️ Zu viele Schüler! ${totalStudents} Schüler aber nur ${totalSeats} Sitzplätze verfügbar.`,
      };
    }

    if (totalSeats > totalStudents + 5) {
      return {
        type: 'info' as const,
        message: `ℹ️ Viele freie Plätze: ${
          totalSeats - totalStudents
        } von ${totalSeats} Sitzplätzen frei.`,
      };
    }

    return null;
  };

  const discrepancyWarning = checkSeatStudentDiscrepancy();

  // Excel Datei Handler
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          alert('Die Excel-Datei enthält keine Daten oder nur Überschriften.');
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[];

        setExcelData(rows);
        setImportConfig({
          firstNameColumn: '',
          lastNameColumn: '',
          availableColumns: headers.map((header, index) => ({
            header: header || `Spalte ${index + 1}`,
            index,
          })),
        });

        setShowImportModal(true);
      } catch (error) {
        console.error('Fehler beim Lesen der Excel-Datei:', error);
        alert(
          'Fehler beim Lesen der Excel-Datei. Bitte überprüfen Sie das Format.'
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Schüler aus Excel importieren
  const confirmExcelImport = () => {
    if (!importConfig.firstNameColumn || !importConfig.lastNameColumn) {
      alert('Bitte wählen Sie Spalten für Vor- und Nachnamen aus.');
      return;
    }

    const firstNameIndex = importConfig.availableColumns.findIndex(
      (col) => col.header === importConfig.firstNameColumn
    );
    const lastNameIndex = importConfig.availableColumns.findIndex(
      (col) => col.header === importConfig.lastNameColumn
    );

    const students: Student[] = excelData
      .filter((row) => row[firstNameIndex] && row[lastNameIndex])
      .map((row, index) => ({
        id: `excel-${index}`,
        firstName: String(row[firstNameIndex]).trim(),
        lastName: String(row[lastNameIndex]).trim(),
        isExcluded: false,
      }));

    setImportedStudents(students);
    setShowImportModal(false);
    setImportMode('excel');

    // Neuen Sitzplan erstellen
    createNewClassroom();
  };

  // Manuelle Schüler-Eingabe
  const addManualStudent = () => {
    const newStudent: Student = {
      id: `manual-${Date.now()}`,
      firstName: 'Neuer',
      lastName: 'Schüler',
      isExcluded: false,
    };
    setImportedStudents((prev) => [...prev, newStudent]);
    setImportMode('manual');
  };

  const updateManualStudent = (
    id: string,
    field: 'firstName' | 'lastName',
    value: string
  ) => {
    setImportedStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  const removeManualStudent = (id: string) => {
    setImportedStudents((prev) => prev.filter((student) => student.id !== id));
  };

  // KORRIGIERTE BANK-REIHENFOLGE: Reihe 1 Bank 1 wird als erstes gefüllt
  const getDisplayDesks = () => {
    if (!selectedClassroom) return [];

    // Für die Anzeige: Reihe 1 (vorne) wird oben angezeigt, Reihe 1 Bank 1 ist links oben
    return [...selectedClassroom.desks].reverse();
  };

  const handleDragStart = (e: React.DragEvent, student: Student) => {
    setDraggedStudent(student);
    e.dataTransfer.setData('text/plain', student.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (row: number, col: number) => {
    if (!selectedClassroom || !draggedStudent) return;

    // KORREKTE UMRECHNUNG: Angezeigte Reihe auf tatsächliche Reihe umrechnen
    // Reihe 1 in der Anzeige = letzte Reihe im Array (vorne bei Tafel)
    const actualRow = selectedClassroom.rows - 1 - row;
    const desk = selectedClassroom.desks[actualRow][col];

    // Prüfen ob Platz verfügbar ist
    if (desk.students.length >= selectedClassroom.studentsPerDesk) {
      return;
    }

    const updatedDesks = selectedClassroom.desks.map((r) => [...r]);

    // Wenn "Frei" platziert wird
    if (draggedStudent.id === 'free') {
      const updatedStudents = [...desk.students, freeStudent];
      updatedDesks[actualRow][col] = {
        ...desk,
        students: updatedStudents,
        isEmpty: false,
      };
    } else {
      // Normaler Schüler
      const updatedStudents = [...desk.students, draggedStudent];
      updatedDesks[actualRow][col] = {
        ...desk,
        students: updatedStudents,
        isEmpty: updatedStudents.length === 0,
      };

      // Nur bei echten Schülern aus verfügbarer Liste entfernen
      setAvailableStudents((prev) =>
        prev.filter((s) => s.id !== draggedStudent.id)
      );
    }

    const updatedClassroom = {
      ...selectedClassroom,
      desks: updatedDesks,
    };

    setSelectedClassroom(updatedClassroom);
    setDraggedStudent(null);
  };

  const removeStudentFromDesk = (
    row: number,
    col: number,
    studentId: string
  ) => {
    if (!selectedClassroom) return;

    // KORREKTE UMRECHNUNG: Angezeigte Reihe auf tatsächliche Reihe
    const actualRow = selectedClassroom.rows - 1 - row;
    const updatedDesks = selectedClassroom.desks.map((r) => [...r]);
    const desk = updatedDesks[actualRow][col];
    const student = desk.students.find((s) => s.id === studentId);

    const updatedStudents = desk.students.filter((s) => s.id !== studentId);

    updatedDesks[actualRow][col] = {
      ...desk,
      students: updatedStudents,
      isEmpty: updatedStudents.length === 0,
    };

    const updatedClassroom = {
      ...selectedClassroom,
      desks: updatedDesks,
    };

    setSelectedClassroom(updatedClassroom);

    // Nur bei echten Schülern zurück zur verfügbaren Liste hinzufügen
    if (student && student.id !== 'free') {
      setAvailableStudents((prev) => [...prev, student]);
    }
  };

  const updateClassroomLayout = (updates: Partial<Classroom>) => {
    if (!selectedClassroom) return;

    const updatedClassroom = {
      ...selectedClassroom,
      ...updates,
    };

    if (updates.rows !== undefined || updates.columns !== undefined) {
      const rows = updates.rows || selectedClassroom.rows;
      const columns = updates.columns || selectedClassroom.columns;

      // Alle Schüler zurück zur verfügbaren Liste
      const allStudents = selectedClassroom.desks
        .flat()
        .flatMap((desk) => desk.students.filter((s) => s.id !== 'free'));
      setAvailableStudents((prev) => [...prev, ...allStudents]);

      const newDesks = Array(rows)
        .fill(null)
        .map((_, row) =>
          Array(columns)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              students: [],
              isEmpty: true,
              position: { row, col },
            }))
        );

      updatedClassroom.desks = newDesks;
    }

    setSelectedClassroom(updatedClassroom);
  };

  // Globale Einstellungen anwenden
  const applyGlobalSettings = () => {
    if (!selectedClassroom) return;

    updateClassroomLayout({
      rows: globalSettings.rows,
      columns: globalSettings.columns,
      studentsPerDesk: globalSettings.studentsPerDesk,
    });
  };

  // Automatisches Auffüllen der Sitzplätze - KORRIGIERT: Beginnt mit Reihe 1 Bank 1
  const autoFillSeats = () => {
    if (!selectedClassroom || availableStudents.length === 0) return;

    const studentsToPlace = [...availableStudents];
    const shuffledStudents = [...studentsToPlace].sort(
      () => Math.random() - 0.5
    );

    const updatedDesks = selectedClassroom.desks.map((row) => [...row]);

    // KORREKTE REIHENFOLGE: Beginne mit Reihe 1 (vorne bei Tafel) = letzte Reihe im Array
    for (
      let actualRow = selectedClassroom.rows - 1;
      actualRow >= 0;
      actualRow--
    ) {
      for (let col = 0; col < selectedClassroom.columns; col++) {
        if (shuffledStudents.length === 0) break;

        const desk = updatedDesks[actualRow][col];
        const availableSpots =
          selectedClassroom.studentsPerDesk - desk.students.length;

        for (let i = 0; i < availableSpots; i++) {
          if (shuffledStudents.length > 0) {
            const student = shuffledStudents.pop()!;
            desk.students.push(student);
            desk.isEmpty = false;
          }
        }
      }
      if (shuffledStudents.length === 0) break;
    }

    const updatedClassroom = {
      ...selectedClassroom,
      desks: updatedDesks,
    };

    setSelectedClassroom(updatedClassroom);
    setAvailableStudents([]);
  };

  const createNewClassroom = () => {
    setIsCreatingNew(true);
    const newClassroom: Classroom = {
      id: Date.now().toString(),
      name: 'Neuer Sitzplan',
      className: '',
      roomNumber: '',
      rows: globalSettings.rows,
      columns: globalSettings.columns,
      studentsPerDesk: globalSettings.studentsPerDesk,
      desks: Array(globalSettings.rows)
        .fill(null)
        .map((_, row) =>
          Array(globalSettings.columns)
            .fill(null)
            .map((_, col) => ({
              id: `${row}-${col}`,
              students: [],
              isEmpty: true,
              position: { row, col },
            }))
        ),
    };

    setClassrooms((prev) => [...prev, newClassroom]);
    setSelectedClassroom(newClassroom);
    setAvailableStudents([]);
  };

  const updateClassroomName = (newName: string) => {
    if (!selectedClassroom) return;

    const updatedClassroom = {
      ...selectedClassroom,
      name: newName,
    };

    setSelectedClassroom(updatedClassroom);

    // Update auch in der classrooms Liste
    setClassrooms((prev) =>
      prev.map((classroom) =>
        classroom.id === selectedClassroom.id ? updatedClassroom : classroom
      )
    );

    if (isCreatingNew) {
      setIsCreatingNew(false);
    }
  };

  const saveSitzplan = () => {
    console.log('Saving sitzplan:', selectedClassroom);
    alert('Sitzplan gespeichert!');
  };

  const resetSitzplan = () => {
    if (!selectedClassroom) return;

    const allStudents = selectedClassroom.desks
      .flat()
      .flatMap((desk) => desk.students.filter((s) => s.id !== 'free'));
    const resetDesks = selectedClassroom.desks.map((row) =>
      row.map((desk) => ({
        ...desk,
        students: [],
        isEmpty: true,
      }))
    );

    setSelectedClassroom({
      ...selectedClassroom,
      desks: resetDesks,
    });

    setAvailableStudents((prev) => [...prev, ...allStudents]);
  };

  // PERFEKTE PDF-GENERIERUNG MIT ALLEN VERBESSERUNGEN
  const generatePDFSitzplan = () => {
    if (!selectedClassroom) return;

    const theme = pdfThemes.find((t) => t.id === selectedTheme) || pdfThemes[0];

    // Automatische Orientierung basierend auf Reihenanzahl und Spalten
    const usePortrait = selectedClassroom.rows > selectedClassroom.columns;
    const pdf = new jsPDF(usePortrait ? 'portrait' : 'landscape', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // VERBESSERTER HEADER MIT MEHR ABSTAND
    const headerHeight = 30;
    if (theme.hasBackground) {
      pdf.setFillColor(...theme.primaryColor);
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    }

    // Titel
    pdf.setFontSize(20);
    pdf.setTextColor(
      theme.hasBackground ? 255 : theme.textColor[0],
      theme.hasBackground ? 255 : theme.textColor[1],
      theme.hasBackground ? 255 : theme.textColor[2]
    );
    pdf.setFont(undefined, 'bold');

    // Titel auf maximale Breite prüfen
    const title = selectedClassroom.name.toUpperCase();
    const titleWidth = pdf.getTextWidth(title);
    const maxTitleWidth = pageWidth - 40;

    if (titleWidth > maxTitleWidth) {
      pdf.setFontSize(16);
    }

    pdf.text(title, pageWidth / 2, 15, { align: 'center' });

    // NEUE INFO-BOX STATT DETAILS
    const currentDate = new Date().toLocaleDateString('de-DE');
    const creatorName = 'Max Mustermann';

    pdf.setFontSize(8);
    pdf.setTextColor(
      theme.hasBackground ? 220 : theme.textColor[0],
      theme.hasBackground ? 220 : theme.textColor[1],
      theme.hasBackground ? 220 : theme.textColor[2]
    );

    // Info-Box Hintergrund
    const infoBoxWidth = 70;
    const infoBoxHeight = 18;
    const infoBoxX = pageWidth - infoBoxWidth - 10;
    const infoBoxY = 6;

    pdf.setFillColor(250, 250, 250);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(
      infoBoxX,
      infoBoxY,
      infoBoxWidth,
      infoBoxHeight,
      2,
      2,
      'FD'
    );

    // Info-Box Inhalt
    pdf.setTextColor(80, 80, 80);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Ersteller:`, infoBoxX + 4, infoBoxY + 6);
    pdf.setFont(undefined, 'normal');

    // Ersteller-Namen kürzen falls zu lang
    const creatorDisplay =
      creatorName.length > 12
        ? creatorName.substring(0, 10) + '...'
        : creatorName;
    pdf.text(creatorDisplay, infoBoxX + 20, infoBoxY + 6);

    pdf.setFont(undefined, 'bold');
    pdf.text(`Erstellt:`, infoBoxX + 4, infoBoxY + 12);
    pdf.setFont(undefined, 'normal');
    pdf.text(currentDate, infoBoxX + 20, infoBoxY + 12);

    // Berechnung der optimalen Größe mit verbesserter Logik
    const margin = 12;
    const boardHeight = 12;
    const verticalSpacing = 8;

    const availableHeight =
      pageHeight - margin - headerHeight - boardHeight - verticalSpacing - 20;
    const availableWidth = pageWidth - 2 * margin;

    const totalBanks = selectedClassroom.columns;
    const totalRows = selectedClassroom.rows;
    const seatsPerBank = selectedClassroom.studentsPerDesk;

    // Optimale Bank-Größe berechnen mit verbesserter Skalierung
    const bankSpacing = 6;
    const totalBankSpacing = (totalBanks - 1) * bankSpacing;

    let bankWidth = Math.max(
      20,
      (availableWidth - totalBankSpacing) / totalBanks
    );
    let bankHeightValue = Math.max(
      25,
      (availableHeight - (totalRows - 1) * verticalSpacing) / totalRows
    );

    // Dynamische Anpassung basierend auf verfügbarem Platz
    const totalNeededWidth = totalBanks * bankWidth + totalBankSpacing;
    const totalNeededHeight =
      totalRows * bankHeightValue + (totalRows - 1) * verticalSpacing;

    if (totalNeededWidth > availableWidth) {
      bankWidth = (availableWidth - totalBankSpacing) / totalBanks;
    }

    if (totalNeededHeight > availableHeight) {
      bankHeightValue =
        (availableHeight - (totalRows - 1) * verticalSpacing) / totalRows;
    }

    // Schriftgröße basierend auf Bank-Größe anpassen
    const minFontSizeMM = 3; // ~8.5pt
    const baseFontSize = Math.max(minFontSizeMM, bankHeightValue / 5);
    const finalFontSize = Math.min(baseFontSize, bankHeightValue / 4);

    const startY = margin + headerHeight;

    // Sitzplan Grid zeichnen mit SCHWARZEN CLEANEN UMRANDUNGEN
    for (
      let displayRow = 0;
      displayRow < selectedClassroom.rows;
      displayRow++
    ) {
      // KORREKTE UMRECHNUNG für PDF: Reihe 1 (vorne) wird oben angezeigt
      const actualRow = selectedClassroom.rows - 1 - displayRow;

      for (let col = 0; col < selectedClassroom.columns; col++) {
        const x = margin + col * (bankWidth + bankSpacing);
        const y = startY + displayRow * (bankHeightValue + verticalSpacing);

        const desk = selectedClassroom.desks[actualRow][col];

        // Bank Hintergrund - CLEAN DESIGN
        pdf.setFillColor(...theme.backgroundColor);
        pdf.setDrawColor(0, 0, 0); // SCHWARZE UMRANDUNG
        pdf.setLineWidth(1.0); // CLEANE LINIEN
        pdf.rect(x, y, bankWidth, bankHeightValue, 'FD');

        // Bank Label - PROFESSIONELL
        pdf.setFontSize(finalFontSize * 0.6);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont(undefined, 'bold');
        const label = `R${displayRow + 1}B${col + 1}`;
        const labelWidth = pdf.getTextWidth(label);

        // Label positionieren, falls Platz
        if (labelWidth < bankWidth - 4) {
          pdf.text(label, x + 3, y + 5);
        }

        // Schüler Plätze
        const seatWidth = bankWidth / seatsPerBank;

        for (let seat = 0; seat < seatsPerBank; seat++) {
          const seatX = x + seat * seatWidth;

          // Sitzplatz Rahmen - CLEAN SCHWARZ
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.5);
          pdf.rect(seatX, y, seatWidth, bankHeightValue);

          // Trennlinie zwischen Sitzplätzen
          if (seat < seatsPerBank - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.2);
            pdf.line(
              seatX + seatWidth,
              y,
              seatX + seatWidth,
              y + bankHeightValue
            );
          }

          const student = desk.students[seat];
          const textX = seatX + seatWidth / 2;
          const textY = y + bankHeightValue / 2;

          if (student) {
            pdf.setFontSize(finalFontSize);

            if (student.id === 'free') {
              pdf.setTextColor(120, 120, 120);
              pdf.setFont(undefined, 'normal');
              const text = 'Frei';
              const textWidth = pdf.getTextWidth(text);

              // Text kürzen falls nötig
              if (textWidth > seatWidth - 2) {
                pdf.setFontSize(finalFontSize * 0.8);
              }
              pdf.text(text, textX - pdf.getTextWidth(text) / 2, textY);
            } else {
              pdf.setTextColor(...theme.textColor);

              // Vorname mit automatischer Größenanpassung
              const firstName = student.firstName;
              let firstNameFontSize = finalFontSize;
              let firstNameWidth = pdf.getTextWidth(firstName);

              if (firstNameWidth > seatWidth - 4) {
                firstNameFontSize = finalFontSize * 0.8;
                pdf.setFontSize(firstNameFontSize);
                firstNameWidth = pdf.getTextWidth(firstName);
              }

              pdf.setFont(undefined, 'bold');
              pdf.text(
                firstName,
                textX - firstNameWidth / 2,
                textY - finalFontSize / 3
              );

              // Nachname mit automatischer Größenanpassung
              const lastName = student.lastName;
              let lastNameFontSize = finalFontSize;
              let lastNameWidth = pdf.getTextWidth(lastName);

              if (lastNameWidth > seatWidth - 4) {
                lastNameFontSize = finalFontSize * 0.8;
                pdf.setFontSize(lastNameFontSize);
                lastNameWidth = pdf.getTextWidth(lastName);
              }

              pdf.text(
                lastName,
                textX - lastNameWidth / 2,
                textY + finalFontSize / 3
              );

              // Schriftgröße zurücksetzen
              pdf.setFontSize(finalFontSize);
            }
          } else {
            pdf.setFontSize(finalFontSize * 0.7);
            pdf.setTextColor(180, 180, 180);
            pdf.setFont(undefined, 'normal');
            const text = 'frei';
            const textWidth = pdf.getTextWidth(text);

            if (textWidth > seatWidth - 2) {
              pdf.setFontSize(finalFontSize * 0.6);
            }
            pdf.text(text, textX - pdf.getTextWidth(text) / 2, textY);
          }
        }
      }
    }

    // TAFEL UNTER DEM SITZPLAN
    const boardWidth = Math.min(
      pageWidth * 0.6,
      totalBanks * (bankWidth + bankSpacing) - bankSpacing
    );
    const boardX = (pageWidth - boardWidth) / 2;
    const boardY =
      startY +
      selectedClassroom.rows * (bankHeightValue + verticalSpacing) +
      10;

    // Tafel Design
    if (theme.hasBackground) {
      pdf.setFillColor(...theme.primaryColor);
    } else {
      pdf.setFillColor(50, 50, 50);
    }
    pdf.rect(boardX, boardY, boardWidth, boardHeight, 'F');

    // Tafel-Text
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    pdf.text('TAFEL', pageWidth / 2, boardY + boardHeight / 2 + 1, {
      align: 'center',
    });

    pdf.save(`Sitzplan_${selectedClassroom.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Gefilterte Schüler
  const filteredStudents = availableStudents.filter(
    (student) =>
      !searchTerm ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedClassroom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white border-2 border-gray-900 p-6 sm:p-12 max-w-2xl w-full text-center rounded-2xl shadow-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Layout className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">
            KEIN SITZPLAN AUSGEWÄHLT
          </h3>
          <p className="text-gray-600 mb-6 sm:mb-8 font-medium text-sm sm:text-base">
            Erstellen Sie einen neuen Sitzplan oder wählen Sie einen vorhandenen
            aus.
          </p>
          <button
            onClick={createNewClassroom}
            className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-black hover:bg-gray-800 transition-all duration-300 border-2 border-gray-900 hover:shadow-lg rounded-lg text-sm sm:text-base"
          >
            NEUEN SITZPLAN ERSTELLEN
          </button>
        </div>
      </div>
    );
  }

  const displayDesks = getDisplayDesks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header mit VERBESSERTEM ABSTAND UND LAYOUT */}
      <div className="bg-white border-b-2 border-gray-900 shadow-sm sticky top-0 z-40">
        <div className="max-w-[100vw] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-black rounded-xl flex-shrink-0">
                <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight truncate">
                  SITZPLAN EDITOR
                </h1>
                <p className="text-gray-600 font-medium text-xs sm:text-sm truncate">
                  Professionelle Sitzplan-Gestaltung
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-xs sm:text-sm flex-1 sm:flex-none justify-center min-w-[80px]"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                {isMobile
                  ? showSettings
                    ? 'HIDE'
                    : 'SHOW'
                  : showSettings
                  ? 'AUSBLENDEN'
                  : 'EINSTELLUNGEN'}
              </button>

              {!isMobile && (
                <>
                  <button
                    onClick={autoFillSeats}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-xs sm:text-sm flex-1 sm:flex-none justify-center min-w-[80px]"
                    disabled={availableStudents.length === 0}
                  >
                    <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
                    AUTO-FILL
                  </button>
                  <button
                    onClick={resetSitzplan}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-xs sm:text-sm flex-1 sm:flex-none justify-center min-w-[80px]"
                  >
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                    RESET
                  </button>
                </>
              )}

              <button
                onClick={() => setShowPDFModal(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-900 text-white font-black hover:bg-black transition-all duration-300 rounded-lg border-2 border-gray-900 hover:shadow-lg text-xs sm:text-sm flex-1 sm:flex-none justify-center min-w-[80px]"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                {isMobile ? 'PDF' : 'PDF EXPORT'}
              </button>
              <button
                onClick={saveSitzplan}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-black text-white font-black hover:bg-gray-800 transition-all duration-300 rounded-lg border-2 border-gray-900 hover:shadow-lg text-xs sm:text-sm flex-1 sm:flex-none justify-center min-w-[80px]"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                {isMobile ? 'SAVE' : 'SPEICHERN'}
              </button>
            </div>
          </div>

          {/* Classroom Name Editor */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isEditingName || isCreatingNew ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
                <input
                  type="text"
                  value={selectedClassroom.name}
                  onChange={(e) => updateClassroomName(e.target.value)}
                  onBlur={() => {
                    setIsEditingName(false);
                    setIsCreatingNew(false);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      setIsCreatingNew(false);
                    }
                  }}
                  className="text-base sm:text-lg font-black bg-white border-2 border-gray-900 px-3 sm:px-4 py-2 focus:outline-none focus:border-gray-600 w-full sm:w-80 rounded-lg"
                  autoFocus
                  placeholder="SITZPLAN NAME..."
                />
                {isCreatingNew && (
                  <span className="text-xs text-gray-500 font-medium">
                    Bitte geben Sie einen Namen für den Sitzplan ein
                  </span>
                )}
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setIsCreatingNew(false);
                  }}
                  className="p-2 bg-black text-white hover:bg-gray-800 transition-colors border-2 border-gray-900 rounded-lg flex-shrink-0"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-black text-gray-900 truncate">
                  {selectedClassroom.name}
                </h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 sm:p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-300 rounded-lg flex-shrink-0"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[100vw] mx-auto px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Warnung bei Sitzplatz-Schüler-Diskrepanz */}
        {discrepancyWarning && (
          <div
            className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border-2 ${
              discrepancyWarning.type === 'warning'
                ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                : 'bg-blue-50 border-blue-400 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm sm:text-base">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              {discrepancyWarning.message}
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 lg:gap-6 min-h-[calc(100vh-200px)]">
          {/* Hauptbereich - Sitzplan */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-white border-2 border-gray-900 p-3 sm:p-4 lg:p-6 flex-1 flex flex-col rounded-xl shadow-sm min-h-0">
              {/* Settings Panel */}
              {showSettings && (
                <div className="mb-3 sm:mb-4 lg:mb-6 p-3 sm:p-4 bg-white border-2 border-gray-900 rounded-lg flex-shrink-0">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => setExpandedSettings(!expandedSettings)}
                  >
                    <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wide">
                      KONFIGURATION
                    </h3>
                    <button className="p-1 text-gray-500 hover:text-gray-900 transition-colors">
                      {expandedSettings ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {expandedSettings && (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Globale Einstellungen */}
                      <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          <Monitor className="h-4 w-4 text-blue-600" />
                          <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
                            GLOBALE EINSTELLUNGEN
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 sm:mb-2 uppercase tracking-wide">
                              Reihen
                            </label>
                            <input
                              type="number"
                              value={globalSettings.rows}
                              min="1"
                              max="20"
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  rows: parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 text-center rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 sm:mb-2 uppercase tracking-wide">
                              Bänke pro Reihe
                            </label>
                            <input
                              type="number"
                              value={globalSettings.columns}
                              min="1"
                              max="20"
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  columns: parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 text-center rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 sm:mb-2 uppercase tracking-wide">
                              Schüler pro Bank
                            </label>
                            <select
                              value={globalSettings.studentsPerDesk}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  studentsPerDesk: parseInt(e.target.value),
                                }))
                              }
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                            >
                              <option value={1}>1 Schüler</option>
                              <option value={2}>2 Schüler</option>
                              <option value={3}>3 Schüler</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={applyGlobalSettings}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white font-black hover:bg-blue-700 transition-all duration-300 rounded-lg border-2 border-blue-600 text-xs sm:text-sm"
                        >
                          <Check className="h-3 w-3" />
                          EINSTELLUNGEN ANWENDEN
                        </button>
                      </div>

                      {/* Import-Modus Selektor */}
                      <div className="p-3 sm:p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">
                          SCHÜLERQUELLE
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                          <button
                            onClick={() => setImportMode('database')}
                            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border-2 rounded-lg font-black transition-all duration-300 text-xs sm:text-sm ${
                              importMode === 'database'
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white'
                            }`}
                          >
                            <Database className="h-3 w-3" />
                            {isMobile ? 'DB' : 'DATENBANK'}
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border-2 rounded-lg font-black transition-all duration-300 text-xs sm:text-sm ${
                              importMode === 'excel'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-900 border-gray-900 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            <Upload className="h-3 w-3" />
                            {isMobile ? 'EXCEL' : 'EXCEL IMPORT'}
                          </button>
                          <button
                            onClick={() => {
                              setImportMode('manual');
                              if (importedStudents.length === 0) {
                                addManualStudent();
                              }
                            }}
                            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border-2 rounded-lg font-black transition-all duration-300 text-xs sm:text-sm ${
                              importMode === 'manual'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-900 border-gray-900 hover:bg-green-600 hover:text-white'
                            }`}
                          >
                            <Users className="h-3 w-3" />
                            {isMobile ? 'MANUAL' : 'MANUELL'}
                          </button>
                        </div>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleExcelUpload}
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                        />

                        {/* Info je nach Modus */}
                        {importMode === 'database' && currentClass && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                              <Database className="h-3 w-3" />
                              <span className="text-xs font-black">
                                {currentClass.name}
                              </span>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {getAvailableStudents().length} von{' '}
                              {currentClass.students.length} Schülern verfügbar
                            </div>
                          </div>
                        )}

                        {importMode === 'excel' &&
                          importedStudents.length > 0 && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-green-800">
                                <FileSpreadsheet className="h-3 w-3" />
                                <span className="text-xs font-black">
                                  Excel Import
                                </span>
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                {importedStudents.length} Schüler importiert
                              </div>
                            </div>
                          )}

                        {importMode === 'manual' && (
                          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <Users className="h-3 w-3" />
                              <span className="text-xs font-black">
                                Manuelle Eingabe
                              </span>
                            </div>
                            <div className="text-xs text-yellow-600 mt-1">
                              {importedStudents.length} Schüler erfasst
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Klassenselektor Dropdowns (nur für Datenbank-Modus) */}
                      {importMode === 'database' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 uppercase tracking-wide">
                              Schule
                            </label>
                            <select
                              value={selectedSchool}
                              onChange={(e) =>
                                setSelectedSchool(e.target.value)
                              }
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                              disabled={loading}
                            >
                              {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                  {school.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 uppercase tracking-wide">
                              Klasse
                            </label>
                            <select
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                              disabled={loading || classes.length === 0}
                            >
                              {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 uppercase tracking-wide">
                              Aktuelle Reihen
                            </label>
                            <input
                              type="number"
                              value={selectedClassroom.rows}
                              min="1"
                              max="20"
                              onChange={(e) =>
                                updateClassroomLayout({
                                  rows: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 text-center rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 uppercase tracking-wide">
                              Aktuelle Bänke
                            </label>
                            <input
                              type="number"
                              value={selectedClassroom.columns}
                              min="1"
                              max="20"
                              onChange={(e) =>
                                updateClassroomLayout({
                                  columns: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 text-center rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Manuelle Schülerverwaltung (nur für Manual-Modus) */}
                      {importMode === 'manual' && (
                        <div className="p-3 bg-white border-2 border-gray-300 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
                              SCHÜLERLISTE
                            </h4>
                            <button
                              onClick={addManualStudent}
                              className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs font-black hover:bg-gray-800 transition-all duration-300 rounded-lg"
                            >
                              <Plus className="h-3 w-3" />
                              HINZUFÜGEN
                            </button>
                          </div>

                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {importedStudents.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-300 rounded"
                              >
                                <input
                                  type="text"
                                  value={student.firstName}
                                  onChange={(e) =>
                                    updateManualStudent(
                                      student.id,
                                      'firstName',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Vorname"
                                  className="flex-1 px-2 py-1 bg-white border border-gray-400 rounded text-xs focus:outline-none focus:border-gray-600"
                                />
                                <input
                                  type="text"
                                  value={student.lastName}
                                  onChange={(e) =>
                                    updateManualStudent(
                                      student.id,
                                      'lastName',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nachname"
                                  className="flex-1 px-2 py-1 bg-white border border-gray-400 rounded text-xs focus:outline-none focus:border-gray-600"
                                />
                                <button
                                  onClick={() =>
                                    removeManualStudent(student.id)
                                  }
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-black text-gray-900 mb-1 uppercase tracking-wide">
                            Schüler/Bank
                          </label>
                          <select
                            value={selectedClassroom.studentsPerDesk}
                            onChange={(e) =>
                              updateClassroomLayout({
                                studentsPerDesk: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                          >
                            <option value={1}>1 Schüler</option>
                            <option value={2}>2 Schüler</option>
                            <option value={3}>3 Schüler</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <button
                            onClick={createNewClassroom}
                            className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-xs sm:text-sm"
                          >
                            <Plus className="h-3 w-3" />
                            NEUER SITZPLAN
                          </button>
                        </div>

                        <div className="sm:col-span-2 flex items-end">
                          {loading && (
                            <div className="text-xs text-gray-500 font-medium">
                              Lade Schülerdaten...
                            </div>
                          )}
                          {!loading && (
                            <div className="text-xs sm:text-sm text-gray-900 font-black">
                              {getAvailableStudents().length} SCHÜLER VERFÜGBAR
                              {importMode === 'database' &&
                                currentClass &&
                                ` • ${currentClass.name}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sitzplan Grid */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="bg-white border-2 border-gray-900 p-3 sm:p-4 lg:p-6 flex-1 overflow-auto rounded-lg min-h-0">
                  <div
                    className="grid gap-2 sm:gap-3 lg:gap-4 auto-rows-min justify-center"
                    style={{
                      gridTemplateColumns: `repeat(${
                        selectedClassroom.columns
                      }, minmax(${isMobile ? '90px' : '120px'}, 1fr))`,
                    }}
                  >
                    {displayDesks.map((row, displayRowIndex) =>
                      row.map((desk, colIndex) => (
                        <div
                          key={desk.id}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(displayRowIndex, colIndex)}
                          className={`
                            border-2 p-2 sm:p-3 cursor-pointer transition-all duration-300 flex flex-col rounded-lg min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]
                            ${
                              desk.isEmpty
                                ? 'bg-white border-gray-400 hover:bg-gray-50 hover:border-gray-600'
                                : 'bg-white border-gray-700 hover:border-black'
                            }
                          `}
                        >
                          <div className="text-xs font-black text-gray-900 text-center mb-1 sm:mb-2 uppercase tracking-wide">
                            R{displayRowIndex + 1}B{colIndex + 1}
                          </div>

                          {desk.students.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <Users className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 opacity-50" />
                                <span className="text-xs font-black uppercase tracking-wide">
                                  LEER
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`flex-1 grid gap-1 sm:gap-2 ${
                                selectedClassroom.studentsPerDesk === 1
                                  ? 'grid-cols-1'
                                  : selectedClassroom.studentsPerDesk === 2
                                  ? 'grid-cols-2'
                                  : 'grid-cols-3'
                              }`}
                            >
                              {Array.from({
                                length: selectedClassroom.studentsPerDesk,
                              }).map((_, index) => {
                                const student = desk.students[index];
                                return student ? (
                                  <div
                                    key={student.id}
                                    className={`border p-1 sm:p-2 flex flex-col justify-center rounded ${
                                      student.id === 'free'
                                        ? 'bg-gray-100 border-gray-400'
                                        : 'bg-white border-gray-400 hover:border-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className={`text-xs sm:text-sm font-black leading-tight break-words ${
                                            student.id === 'free'
                                              ? 'text-gray-600'
                                              : 'text-gray-900'
                                          }`}
                                        >
                                          {student.firstName}
                                        </div>
                                        {student.lastName && (
                                          <div className="text-xs text-gray-700 font-medium leading-tight break-words">
                                            {student.lastName}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeStudentFromDesk(
                                            displayRowIndex,
                                            colIndex,
                                            student.id
                                          );
                                        }}
                                        className="text-gray-500 hover:text-gray-900 text-base font-black transition-colors ml-1 flex-shrink-0"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={index}
                                    className="bg-gray-100 border border-dashed border-gray-400 p-1 sm:p-2 flex items-center justify-center rounded hover:border-gray-600 transition-colors"
                                  >
                                    <span className="text-xs text-gray-500 font-black uppercase tracking-wide">
                                      FREI
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* TAFEL GRAFIK UNTER DER TABELLE */}
                  <div className="mt-4 sm:mt-6 lg:mt-8 flex justify-center">
                    <div className="bg-black text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg text-center max-w-md w-full border-2 border-gray-900">
                      <div className="font-black text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2">
                        <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
                        TAFEL
                      </div>
                      <div className="text-xs text-gray-300 mt-1 font-medium">
                        REIHE 1 IST DIREKT VOR DER TAFEL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schüler-Selektor Sidebar - Optimiert für Mobile */}
          {(!isMobile || window.innerWidth >= 1024) && (
            <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0">
              <div className="bg-white border-2 border-gray-900 p-3 sm:p-4 lg:p-6 h-full flex flex-col rounded-xl shadow-sm min-h-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 border-b-2 border-gray-900">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wide truncate">
                      SCHÜLERLISTE
                    </h3>
                    <p className="text-xs text-gray-600 font-medium truncate">
                      {availableStudents.length} VERFÜGBAR
                      {importMode === 'database' &&
                        currentClass &&
                        ` • ${currentClass.name}`}
                    </p>
                  </div>
                </div>

                {/* Suchfeld */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Schüler suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Frei-Objekt zum Drag & Drop */}
                <div className="mb-3 p-2 bg-gray-50 border-2 border-gray-900 rounded-lg">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, freeStudent)}
                    className="flex items-center gap-2 p-2 bg-white border-2 border-gray-900 cursor-grab hover:border-gray-600 hover:bg-gray-50 transition-all duration-300 active:cursor-grabbing rounded"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                      <Square className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-gray-600 text-sm">
                        FREI
                      </div>
                      <div className="text-gray-500 text-xs font-medium">
                        Platz reservieren
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-2 min-h-0">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, student)}
                      className="flex items-center gap-2 p-2 bg-white border-2 border-gray-400 cursor-grab hover:border-gray-600 hover:bg-gray-50 transition-all duration-300 active:cursor-grabbing rounded"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black rounded flex items-center justify-center flex-shrink-0">
                        <GripVertical className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-gray-900 text-sm leading-tight truncate">
                          {student.firstName}
                        </div>
                        <div className="text-gray-600 text-xs font-medium leading-tight truncate">
                          {student.lastName}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredStudents.length === 0 && !loading && (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-black text-sm uppercase tracking-wide">
                        ALLE SCHÜLER PLATZIERT
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 animate-pulse" />
                      </div>
                      <p className="text-gray-500 font-black text-sm uppercase tracking-wide">
                        LADE SCHÜLER...
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile-spezifische Buttons */}
                {isMobile && (
                  <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                    <button
                      onClick={autoFillSeats}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-sm"
                      disabled={availableStudents.length === 0}
                    >
                      <Shuffle className="h-4 w-4" />
                      AUTO-FILL
                    </button>
                    <button
                      onClick={resetSitzplan}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      RESET
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Export Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-gray-900 rounded-2xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">
                    PDF EXPORT
                  </h3>
                  <p className="text-gray-600 font-medium text-sm">
                    Wählen Sie das Design für den Sitzplan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPDFModal(false)}
                className="p-1 sm:p-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 sm:mb-3">
                  Farbschema
                </label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {pdfThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`flex items-center gap-2 sm:gap-3 p-3 border-2 rounded-lg transition-all duration-300 ${
                        selectedTheme === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300"
                        style={{
                          backgroundColor: theme.hasBackground
                            ? `rgb(${theme.primaryColor.join(',')})`
                            : 'white',
                          borderColor: `rgb(${theme.primaryColor.join(',')})`,
                        }}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-black text-gray-900 text-sm sm:text-base">
                          {theme.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {theme.id === 'ink'
                            ? 'Dünne Linien, keine Füllflächen'
                            : theme.id === 'black'
                            ? 'Klassisch Schwarz-Weiß'
                            : 'Premium Blau-Design mit schwarzen Umrandungen'}
                        </div>
                      </div>
                      {selectedTheme === theme.id && (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-black">NEUE FEATURES</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Professionelle Info-Box mit Ersteller & Datum</div>
                  <div>• Saubere schwarze Bank-Umrandungen</div>
                  <div>• Automatische Textanpassung ohne Überlappungen</div>
                  <div>• Optimiertes Layout für alle Größen</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowPDFModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-sm"
              >
                ABBRECHEN
              </button>
              <button
                onClick={() => {
                  generatePDFSitzplan();
                  setShowPDFModal(false);
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white font-black hover:bg-blue-700 transition-all duration-300 rounded-lg border-2 border-blue-600 text-sm"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Download className="h-4 w-4" />
                  PDF ERSTELLEN
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-gray-900 rounded-2xl max-w-2xl w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">
                    EXCEL IMPORT
                  </h3>
                  <p className="text-gray-600 font-medium text-sm">
                    Wählen Sie die Spalten für Vor- und Nachnamen aus
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 sm:p-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Vorname Spalte
                </label>
                <select
                  value={importConfig.firstNameColumn}
                  onChange={(e) =>
                    setImportConfig((prev) => ({
                      ...prev,
                      firstNameColumn: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                >
                  <option value="">Spalte auswählen...</option>
                  {importConfig.availableColumns.map((column) => (
                    <option key={column.index} value={column.header}>
                      {column.header}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Nachname Spalte
                </label>
                <select
                  value={importConfig.lastNameColumn}
                  onChange={(e) =>
                    setImportConfig((prev) => ({
                      ...prev,
                      lastNameColumn: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium text-gray-900 rounded-lg text-sm"
                >
                  <option value="">Spalte auswählen...</option>
                  {importConfig.availableColumns.map((column) => (
                    <option key={column.index} value={column.header}>
                      {column.header}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-black">VORSCHAU</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    Gefundene Schüler:{' '}
                    {
                      excelData.filter(
                        (row) =>
                          row[
                            importConfig.availableColumns.findIndex(
                              (col) =>
                                col.header === importConfig.firstNameColumn
                            )
                          ] &&
                          row[
                            importConfig.availableColumns.findIndex(
                              (col) =>
                                col.header === importConfig.lastNameColumn
                            )
                          ]
                      ).length
                    }
                  </div>
                  {excelData.slice(0, 3).map((row, index) => {
                    const firstNameIndex =
                      importConfig.availableColumns.findIndex(
                        (col) => col.header === importConfig.firstNameColumn
                      );
                    const lastNameIndex =
                      importConfig.availableColumns.findIndex(
                        (col) => col.header === importConfig.lastNameColumn
                      );

                    if (firstNameIndex === -1 || lastNameIndex === -1)
                      return null;

                    return (
                      <div key={index} className="text-gray-500">
                        {row[firstNameIndex]} {row[lastNameIndex]}
                      </div>
                    );
                  })}
                  {excelData.length > 3 && (
                    <div>... und {excelData.length - 3} weitere</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg text-sm"
              >
                ABBRECHEN
              </button>
              <button
                onClick={confirmExcelImport}
                disabled={
                  !importConfig.firstNameColumn || !importConfig.lastNameColumn
                }
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg border-2 border-blue-600 text-sm"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Check className="h-4 w-4" />
                  IMPORTIEREN
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sitzplan;
