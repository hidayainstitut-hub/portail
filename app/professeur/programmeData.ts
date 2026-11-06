export interface SeanceProgramme {
  groupe: string;
  semaine: string;
  date: string;
  heure: string;
  titre: string;
  notions: string;
  devoirs: string;
}

export const programmeGlobal: SeanceProgramme[] = [
  { 
    groupe: "Groupe C", 
    semaine: "C1", 
    date: "2026-10-03", 
    heure: "16:15", 
    titre: "Alif, Ba, Ta, Tha", 
    notions: "Bases de lecture - Alphabet", 
    devoirs: "Réviser Alif, Ba, Ta, Tha" 
  },
  { groupe: "Groupe A", semaine: "A1", date: "2026-10-03", heure: "14:00", titre: "Alif, Ba, Ta, Tha", notions: "Bases de lecture - Alphabet", devoirs: "Réviser Alif, Ba, Ta, Tha" },
  { groupe: "Groupe A", semaine: "A2", date: "2026-10-10", heure: "14:00", titre: "Djim, Ha, Kha", notions: "Bases de lecture - Alphabet", devoirs: "Réviser Djim, Ha, Kha + A1" },
];