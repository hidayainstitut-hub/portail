"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface EleveSuivi {
  id: string;
  nom: string;
  prenom: string;
  etoiles: number;
  fautes: string[];
  commentaire: string;
  currentJuz?: string;
  currentPage?: string;
  statut?: string;
}

interface ModuleRecitationProps {
  groupId?: string;
  groupName?: string;
}

export default function ModuleRecitation({
  groupId = "",
  groupName = "Groupe",
}: ModuleRecitationProps) {
  const [eleves, setEleves] = useState<EleveSuivi[]>([]);
  const [eleveSelectionneId, setEleveSelectionneId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerEleves() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

      if (error || !data) {
        setEleves([]);
        setLoading(false);
        return;
      }

      const elevesFiltres = data.filter((profile) => {
        if (!groupId && !groupName) return true;
        return (
          String(profile.group_id ?? profile.groupeId ?? "") === String(groupId) ||
          String(profile.groupeNom ?? profile.groupe ?? "") === groupName
        );
      });

      const ids = elevesFiltres.map((profile) => String(profile.id));
      let progressions: Record<string, Record<string, unknown>> = {};

      if (ids.length > 0) {
        const { data: progressData } = await supabase
          .from("recitation_progress")
          .select("*")
          .in("student_id", ids)
          .order("validated_at", { ascending: false });

        progressions = Object.fromEntries(
          (progressData ?? []).map((progress) => [
            String(progress.student_id ?? progress.profile_id),
            progress,
          ])
        );
      }

      const elevesDynamiques = elevesFiltres.map((profile) => {
        const progression = progressions[String(profile.id)];
        const currentJuz = String(
          profile.current_juz ?? profile.juz ?? progression?.current_juz ?? progression?.juz ?? "Juz Amma"
        );
        const currentPage = String(
          profile.current_page ?? profile.page ?? progression?.current_page ?? progression?.page ?? "1"
        );

        return {
          id: String(profile.id),
          nom: "",
          prenom: String(profile.nom ?? ""),
          etoiles: Number(progression?.stars ?? profile.etoiles ?? 0),
          fautes: Array.isArray(progression?.fautes) ? progression.fautes : [],
          commentaire: String(progression?.commentaire ?? ""),
          currentJuz,
          currentPage,
          statut: String(progression?.status ?? `${currentJuz} - P. ${currentPage} en cours`),
        };
      });

      setEleves(elevesDynamiques);
      setEleveSelectionneId((current) =>
        elevesDynamiques.some((eleve) => eleve.id === current)
          ? current
          : elevesDynamiques[0]?.id ?? ""
      );
      setLoading(false);
    }

    chargerEleves();
  }, [groupId, groupName]);

  const typesDeFautes = [
    { id: "makhraj", label: "Prononciation (Makhraj)" },
    { id: "tajwid", label: "Règles de Tajwid" },
    { id: "hesitation", label: "Hésitation / Fluence" },
    { id: "harakat", label: "Erreur de voyelle (Harakat)" },
  ];

  const eleveActuel = eleves.find((e) => e.id === eleveSelectionneId) || eleves[0];

  const changerEtoiles = (nb: number) => {
    setEleves(eleves.map((e) => (e.id === eleveActuel.id ? { ...e, etoiles: nb } : e)));
  };

  const basculerFaute = (fauteLabel: string) => {
    const nouvellesFautes = eleveActuel.fautes.includes(fauteLabel)
      ? eleveActuel.fautes.filter((f) => f !== fauteLabel)
      : [...eleveActuel.fautes, fauteLabel];
    setEleves(eleves.map((e) => (e.id === eleveActuel.id ? { ...e, fautes: nouvellesFautes } : e)));
  };

  const changerCommentaire = (texte: string) => {
    setEleves(eleves.map((e) => (e.id === eleveActuel.id ? { ...e, commentaire: texte } : e)));
  };

  const sauvegarderSuivi = async () => {
    if (!eleveActuel) return;

    const status = `${eleveActuel.currentJuz ?? "Juz Amma"} - P. ${eleveActuel.currentPage ?? "1"} validée`;
    const { error } = await supabase.from("recitation_progress").insert({
      student_id: eleveActuel.id,
      group_id: groupId || null,
      current_juz: eleveActuel.currentJuz ?? "Juz Amma",
      current_page: eleveActuel.currentPage ?? "1",
      status,
      validated: true,
      stars: eleveActuel.etoiles,
      fautes: eleveActuel.fautes,
      commentaire: eleveActuel.commentaire,
      validated_at: new Date().toISOString(),
    });

    if (error) {
      alert(`Impossible d'enregistrer la validation : ${error.message}`);
      return;
    }

    setEleves((current) =>
      current.map((eleve) =>
        eleve.id === eleveActuel.id ? { ...eleve, statut: status } : eleve
      )
    );
    alert(`Suivi enregistré avec succès pour ${eleveActuel.prenom} ${eleveActuel.nom} !`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 max-w-2xl mx-auto my-6 font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-emerald-900">Suivi des Récitations & Devoirs</h2>
          <p className="text-sm text-gray-500">Évaluez la prestation de l&apos;élève en direct</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
          {groupName || "Groupe"}
        </span>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un élève :</label>
        {loading ? (
          <p className="text-sm text-gray-500">Chargement des élèves...</p>
        ) : eleves.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun élève trouvé pour ce groupe.</p>
        ) : null}
        <div className="grid grid-cols-3 gap-2">
          {eleves.map((el) => (
            <button
              key={el.id}
              onClick={() => setEleveSelectionneId(el.id)}
              className={`p-3 rounded-xl text-sm font-medium transition-all text-left border ${
                eleveSelectionneId === el.id
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="font-bold">{el.prenom}</div>
              <div className="text-xs opacity-90">{el.nom}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-800 text-base">
          Évaluation de : <span className="text-emerald-700">{eleveActuel.prenom} {eleveActuel.nom}</span>
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Note (Étoiles) :</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => changerEtoiles(note)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  eleveActuel.etoiles >= note ? "text-amber-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
            <span className="self-center ml-2 text-sm font-bold text-gray-600">
              {eleveActuel.etoiles}/5
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Axes d&apos;amélioration / Fautes observées :</label>
          <div className="grid grid-cols-2 gap-2">
            {typesDeFautes.map((faute) => {
              const estCoche = eleveActuel.fautes.includes(faute.label);
              return (
                <button
                  key={faute.id}
                  type="button"
                  onClick={() => basculerFaute(faute.label)}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left transition-all border flex items-center justify-between ${
                    estCoche
                      ? "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>{faute.label}</span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${estCoche ? "bg-rose-500 text-white" : "border border-gray-300"}`}>
                    {estCoche ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarque pour les parents :</label>
          <textarea
            value={eleveActuel.commentaire}
            onChange={(e) => changerCommentaire(e.target.value)}
            placeholder="Ex: Très belle récitation, faire attention à la prononciation du 'Ain..."
            className="w-full p-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-800"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={sauvegarderSuivi}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-100"
        >
          Enregistrer le suivi du jour
        </button>
      </div>
    </div>
  );
}