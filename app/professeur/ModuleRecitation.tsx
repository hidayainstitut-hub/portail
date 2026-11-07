"use client";

import { useState } from "react";

interface EleveSuivi {
  id: string;
  nom: string;
  prenom: string;
  etoiles: number;
  fautes: string[];
  commentaire: string;
}

export default function ModuleRecitation() {
  const [eleves, setEleves] = useState<EleveSuivi[]>([
    { id: "1", nom: "Benali", prenom: "Youssef", etoiles: 0, fautes: [], commentaire: "" },
    { id: "2", nom: "El Amrani", prenom: "Fatima", etoiles: 0, fautes: [], commentaire: "" },
    { id: "3", nom: "Kaddour", prenom: "Ibrahim", etoiles: 0, fautes: [], commentaire: "" },
  ]);

  const [eleveSelectionneId, setEleveSelectionneId] = useState<string>("1");

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

  const sauvegarderSuivi = () => {
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
          Groupe A
        </span>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un élève :</label>
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