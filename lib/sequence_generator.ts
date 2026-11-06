import programmeA from "@/data/niveau/groupe-a.json";
import programmeB from "@/data/niveau/groupe-b.json";
import programmeC from "@/data/niveau/groupe-c.json";
import programmeD from "@/data/niveau/groupe-d.json";
import notionsMapData from "@/data/arabe/notions_mapping.json";
import exercicesMapData from "@/data/arabe/exercices_mapping.json";
import engineConfigData from "@/data/arabe/revision_engine.json";

export interface Exercice {
  id: string;
  notion_id: string;
  consigne: string;
  type: string;
  question?: string;
  options?: string[];
  reponse_correcte?: string;
  mots?: string[];
  phrases?: {
    traductions: string[];
    texte: string;
  }[];
  paires?: {
    arabe: string;
    francais: string;
  }[];
}

export interface Notion {
  id: string;
  titre: string;
  categorie: string;
  regle_courte: string;
}

export interface Sequence {
  groupe: string;
  seance_recente: any;
  notions_couvertes: any[];
  exercices: any[];
}

const notionsMap = notionsMapData as Record<string, any>;
const exercicesMap = exercicesMapData as Record<string, any>;

const programmesMap: Record<string, any> = {
  "groupe-a": programmeA,
  "groupe-b": programmeB,
  "groupe-c": programmeC,
  "groupe-d": programmeD,
};

export function generateSequenceForGroup(groupeId: string): Sequence {
  const programme = programmesMap[groupeId] || programmeA;

  let seanceRecente: any = null;
  let notionIds: string[] = [];

  // Support du format d'objet avec clés de séances (ex: "A1", "A2", "A3"...)
  if (programme && typeof programme === "object" && !Array.isArray(programme) && !programme.seances) {
    const keys = Object.keys(programme);
    if (keys.length > 0) {
      // Sélectionne la première/dernière séance disponible dans l'objet
      const lastKey = keys[0]; 
      seanceRecente = programme[lastKey];
      if (seanceRecente && Array.isArray(seanceRecente.notions)) {
        notionIds = seanceRecente.notions;
      } else if (seanceRecente && Array.isArray(seanceRecente.notions_ids)) {
        notionIds = seanceRecente.notions_ids;
      }
    }
  } else {
    // Support du format tableau ou clé directes
    seanceRecente = programme.seances?.[0] || programme.seance_recente || programme;
    notionIds =
      seanceRecente?.notions_ids ||
      seanceRecente?.notions ||
      programme.notions_ids ||
      [];
  }

  // Association des notions détaillées
  const notionsCouvertes = notionIds
    .map((id) => notionsMap[id] || { id, titre: id })
    .filter(Boolean);

  // Extraction des exercices correspondants
  const exercices: any[] = [];
  notionIds.forEach((notionId) => {
    if (exercicesMap[notionId]) {
      if (Array.isArray(exercicesMap[notionId])) {
        exercices.push(...exercicesMap[notionId]);
      } else {
        exercices.push(exercicesMap[notionId]);
      }
    }
  });

  return {
    groupe: groupeId,
    seance_recente: seanceRecente,
    notions_couvertes: notionsCouvertes,
    exercices: exercices,
  };
}