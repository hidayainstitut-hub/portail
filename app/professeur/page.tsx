"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ParentInscrit {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  prochainCours: string;
  paiementStatut: string;
  montantDu: string;
  enfants?: {
    id: string;
    nom: string;
    prenom: string;
    groupe?: string;
    parent_id: string;
  }[];
}

export default function TeacherDashboard() {
  // Données du professeur connecté
  const professeur = {
    prenom: "Oum",
    nom: "Aisha",
  };

  // --- GESTION DES PARENTS INSCRITS ---
  const [parentsInscrits, setParentsInscrits] = useState<ParentInscrit[]>([]);
  const [parentEdite, setParentEdite] = useState<ParentInscrit | null>(null);

 // --- GESTION DES PARENTS ET ELEVES DEPUIS SUPABASE ---
  useEffect(() => {
    async function fetchDonneesSupabase() {
      // 1. Récupérer les parents
      const { data: parentsData, error: parentsError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "parent");

      // 2. Récupérer les enfants (students)
      const { data: enfantsData, error: enfantsError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

      if (!parentsError && !enfantsError) {
        // Associer chaque enfant à son parent via son parent_id
        const parentsAvecEnfants = parentsData.map((parent) => ({
          ...parent,
          // S'assure que le champ correspond à ce qu'attend ton tableau de bord (ex: "enfants" ou "eleves")
          enfants: enfantsData.filter((enfant) => enfant.parent_id === parent.id),
        }));

        setParentsInscrits(parentsAvecEnfants);
      }
    }

    fetchDonneesSupabase();
  }, []);

  const sauvegarderModification = (parentMisAJour: ParentInscrit) => {
    const nouveauxParents = parentsInscrits.map(p => 
      p.id === parentMisAJour.id ? parentMisAJour : p
    );
    setParentsInscrits(nouveauxParents);
    localStorage.setItem("hidaya_parents_inscrits", JSON.stringify(nouveauxParents));
    setParentEdite(null);
  };
  // ------------------------------------

  // État des onglets du menu principal du professeur (ajout de "administration")
  const [ongletActif, setOngletActif] = useState<
    "accueil" | "groupes" | "seances" | "recitation" | "administration" | "compte"
  >("accueil");

  // Notifications
  const [notificationsOuvertes, setNotificationsOuvertes] = useState(false);

  // Groupes gérés par le professeur
  const [groupes] = useState([
    {
      id: 1,
      nom: "Groupe A",
      horaire: "Samedi 9h00 - 11h00",
      lienMeet: "https://meet.google.com/abc-defg-hij",
      progressionAnnuelle: "65%",
      prochaineSeance: "Samedi 14 septembre - 9h00",
      notionsActuelles: "Sourate An-Naba' (versets 1-20)",
      notionsARevoir: "Makharij des lettres (ح et خ)",
      elevesCount: 8,
      eleves: [
        { id: 101, prenom: "Ibrahim", parent: "Karim El Amrani", present: true, statutPresence: "Présent", recitation: "Juz Amma - P. 5 validée" },
        { id: 102, prenom: "Maryam", parent: "Fatima Zahra", present: true, statutPresence: "Retard (10 min)", recitation: "Juz Amma - P. 3 en cours" },
        { id: 103, prenom: "Youssef", parent: "Ahmed Benali", present: false, statutPresence: "Absent", recitation: "Juz Amma - P. 2 validée" },
      ]
    },
    {
      id: 2,
      nom: "Groupe B",
      horaire: "Samedi 11h00 - 13h00",
      lienMeet: "https://meet.google.com/xyz-uvwx-rst",
      progressionAnnuelle: "40%",
      prochaineSeance: "Samedi 14 septembre - 11h00",
      notionsActuelles: "Sourate Al-Mulk",
      notionsARevoir: "Règles du Noon Sakinah",
      elevesCount: 6,
      eleves: [
        { id: 201, prenom: "Ayoub", parent: "Samir K.", present: true, statutPresence: "Présent", recitation: "Juz Tabaraka - P. 1 en cours" }
      ]
    },
    {
      id: 3,
      nom: "Groupe C",
      horaire: "Dimanche 9h00 - 11h00",
      lienMeet: "https://meet.google.com/ghi-jklm-nop",
      progressionAnnuelle: "50%",
      prochaineSeance: "Dimanche 15 septembre - 9h00",
      notionsActuelles: "Sourate Al-Waqi'ah",
      notionsARevoir: "Madd Lazim",
      elevesCount: 5,
      eleves: []
    },
    {
      id: 4,
      nom: "Groupe D",
      horaire: "Dimanche 11h00 - 13h00",
      lienMeet: "https://meet.google.com/qrs-tuvw-xyz",
      progressionAnnuelle: "30%",
      prochaineSeance: "Dimanche 15 septembre - 11h00",
      notionsActuelles: "Apprentissage des bases du Coran",
      notionsARevoir: "Reconnaissance des lettres",
      elevesCount: 4,
      eleves: []
    }
  ]);

  // État pour la sélection d'un groupe actif dans l'onglet Groupes / Présences
  const [groupeSelectionne, setGroupeSelectionne] = useState(groupes[0]);

  // État pour la gestion rapide des présences
  const [presences, setPresences] = useState<{ [key: number]: string }>(
    Object.fromEntries(groupes[0].eleves.map(e => [e.id, e.statutPresence]))
  );

  const modifierPresence = (eleveId: number, statut: string) => {
    setPresences(prev => ({ ...prev, [eleveId]: statut }));
  };

  // Base de données simulée des comptes-rendus par date (Format 'YYYY-MM-DD')
  const [comptesRendusParDate, setComptesRendusParDate] = useState<{ [key: string]: { titre: string; resume: string; notionsTravaillees: string; devoirs: string; publie: boolean } }>({
    "2026-10-03": {
      titre: "Séance 4 : Sourate An-Naba'",
      resume: "Apprentissage des 10 premiers versets et correction des points de articulation.",
      notionsTravaillees: "Tajwid de base, Récitation rythmée",
      devoirs: "Lire et répéter les pages 8 à 10",
      publie: true,
    },
    "2026-10-10": {
      titre: "Séance 5 : Sourate An-Naba' (Suite)",
      resume: "Apprentissage de la fin de la sourate et révision générale.",
      notionsTravaillees: "Makharij et règles de ghunna",
      devoirs: "Préparer la récitation complète pour la prochaine fois",
      publie: false,
    }
  });

  // Date sélectionnée (par défaut aujourd'hui au format YYYY-MM-DD)
  const [dateSelectionnee, setDateSelectionnee] = useState<string>("2026-10-03");

  // Récupérer ou initialiser le compte-rendu pour la date sélectionnée
  const compteRenduActuel = comptesRendusParDate[dateSelectionnee] || {
    titre: `Séance du ${dateSelectionnee}`,
    resume: "Aucun résumé enregistré pour cette date. Remplissez les champs ci-dessous.",
    notionsTravaillees: "À définir",
    devoirs: "À définir",
    publie: false,
  };

  // Fonction pour modifier les champs du formulaire de la date en cours
  const mettreAJourCompteRendu = (champ: string, valeur: any) => {
    setComptesRendusParDate(prev => ({
      ...prev,
      [dateSelectionnee]: {
        ...(prev[dateSelectionnee] || compteRenduActuel),
        [champ]: valeur
      }
    }));
  };

  return (
    <main className="min-h-screen bg-[#A8D58F] pb-16">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo sans fond.png"
              alt="Hidaya Institut"
              width={55}
              height={55}
              priority
            />
            <div>
              <h1 className="text-xl font-bold text-green-900">
                Hidaya Institut
              </h1>
              <p className="text-sm text-green-700">Portail Professeur</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationsOuvertes(!notificationsOuvertes)}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-700 bg-white text-lg font-bold text-green-700 shadow transition hover:bg-green-50"
            >
              🔔
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                1
              </span>
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-700 bg-white text-xl shadow transition hover:bg-green-50" title="Déconnexion">
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Notifications panneau déroulant */}
      {notificationsOuvertes && (
        <div className="fixed right-6 top-24 z-50 w-80 rounded-3xl border border-green-200 bg-white p-5 shadow-2xl">
          <h2 className="text-lg font-bold text-green-900">Notifications Professeur</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-green-50 p-3">
              <p className="font-semibold text-green-900 text-sm">Absence signalée</p>
              <p className="text-xs text-green-700 mt-1">Youssef Benali sera absent ce samedi.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation interne du Professeur */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-2 shadow-sm border border-green-100">
          <button
            onClick={() => setOngletActif("accueil")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              ongletActif === "accueil"
                ? "bg-green-700 text-white"
                : "text-green-900 hover:bg-green-50"
            }`}
          >
            🏠 Accueil
          </button>
          <button
            onClick={() => setOngletActif("groupes")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              ongletActif === "groupes"
                ? "bg-green-700 text-white"
                : "text-green-900 hover:bg-green-50"
            }`}
          >
            👥 Mes Groupes & Élèves
          </button>
          <button
            onClick={() => setOngletActif("seances")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              ongletActif === "seances"
                ? "bg-green-700 text-white"
                : "text-green-900 hover:bg-green-50"
            }`}
          >
            📅 Séances & Compte-rendus
          </button>
          <button
            onClick={() => setOngletActif("recitation")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              ongletActif === "recitation"
                ? "bg-green-700 text-white"
                : "text-green-900 hover:bg-green-50"
            }`}
          >
            📖 Suivi Qour&apos;an
          </button>
          <button
            onClick={() => setOngletActif("administration")}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              ongletActif === "administration"
                ? "bg-green-700 text-white"
                : "text-green-900 hover:bg-green-50"
            }`}
          >
            ⚙️ Administration
          </button>
        </div>
      </div>

      {/* Contenu dynamique selon l'onglet actif */}
      <div className="mx-auto max-w-7xl px-6 mt-8 space-y-8">
        
        {/* ========================================================= */}
        {/* ONGLET 1 : ACCUEIL PROFESSEUR */}
        {/* ========================================================= */}
        {ongletActif === "accueil" && (
          <>
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100">
              <h2 className="text-3xl font-bold text-green-900">
                Bienvenue, Oum {professeur.nom} ! 👩‍‍🏫
              </h2>
              <p className="mt-3 text-lg text-green-800">
                N&apos;oublie pas la bonne intention ! Certes, notre bien aimé a dit ((innamal -a3maalou bi n-niyyaat))
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100">
              <h3 className="text-2xl font-bold text-green-900 mb-6">📅 Agenda</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {groupes.map((g) => (
                  <div key={g.id} className="rounded-2xl border border-green-100 bg-green-50/40 p-6">
                    <h4 className="text-xl font-bold text-green-900">{g.nom}</h4>
                    <p className="text-sm font-semibold text-green-700 mt-1">🕒 {g.horaire}</p>
                    <p className="text-sm text-green-800 mt-2"><strong>Prochaine séance :</strong> {g.prochaineSeance}</p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <a
                        href={g.lienMeet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-green-800"
                      >
                        🎥 Ouvrir le lien Meet
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100">
              <h3 className="text-2xl font-bold text-green-900 mb-4">📝 Plan du jour</h3>
              <div className="rounded-2xl bg-green-50/50 p-6 border border-green-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-green-900">{compteRenduActuel.titre}</h4>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Prêt à diffuser</span>
                </div>
                <p className="text-green-800 mt-3"><strong>Objectif :</strong> {compteRenduActuel.resume}</p>
                <p className="text-green-800 mt-1"><strong>Notions :</strong> {compteRenduActuel.notionsTravaillees}</p>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* ONGLET 2 : GESTION DES GROUPES ET ÉLÈVES */}
        {/* ========================================================= */}
        {ongletActif === "groupes" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-green-900">👥 Vue détaillée par groupe</h3>
                <div className="flex flex-wrap gap-2">
                  {groupes.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGroupeSelectionne(g);
                        setPresences(Object.fromEntries(g.eleves.map(e => [e.id, e.statutPresence])));
                      }}
                      className={`rounded-xl px-4 py-2 font-semibold text-sm transition ${
                        groupeSelectionne.id === g.id
                          ? "bg-green-700 text-white"
                          : "border border-green-700 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {g.nom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-green-50/50 p-5 border border-green-100">
                  <p className="text-sm font-semibold text-green-700">Progression annuelle</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{groupeSelectionne.progressionAnnuelle}</p>
                </div>
                <div className="rounded-2xl bg-green-50/50 p-5 border border-green-100">
                  <p className="text-sm font-semibold text-green-700">Notions travaillées</p>
                  <p className="text-base font-semibold text-green-900 mt-2">{groupeSelectionne.notionsActuelles}</p>
                </div>
                <div className="rounded-2xl bg-green-50/50 p-5 border border-green-100">
                  <p className="text-sm font-semibold text-green-700">Notions à revoir</p>
                  <p className="text-base font-semibold text-red-700 mt-2">{groupeSelectionne.notionsARevoir}</p>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="text-xl font-bold text-green-900 mb-4">📋 Appel & Présences rapides</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-green-100 text-sm font-semibold text-green-700">
                        <th className="py-3 px-4">Élève</th>
                        <th className="py-3 px-4">Parent contact</th>
                        <th className="py-3 px-4">Présence</th>
                        <th className="py-3 px-4">Suivi Récitation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50">
                      {groupeSelectionne.eleves.map((eleve) => (
                        <tr key={eleve.id} className="text-green-900 hover:bg-green-50/20">
                          <td className="py-4 px-4 font-bold">👦 {eleve.prenom}</td>
                          <td className="py-4 px-4 text-sm text-green-700">{eleve.parent}</td>
                          <td className="py-4 px-4">
                            <select
                              value={presences[eleve.id] || "Présent"}
                              onChange={(e) => modifierPresence(eleve.id, e.target.value)}
                              className="rounded-xl border border-green-200 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-green-700"
                            >
                              <option value="Présent">✅ Présent</option>
                              <option value="Retard">⏰ Retard</option>
                              <option value="Absent">❌ Absent</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-sm text-green-800">{eleve.recitation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ONGLET 3 : PRÉPARATION DES SÉANCES & COMPTE RENDU */}
        {/* ========================================================= */}
        {ongletActif === "seances" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-green-100 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-green-900">
                  🖊 Compte rendu de séance & Calendrier
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Sélectionnez une date dans le calendrier pour afficher ou modifier le compte rendu correspondant.
                </p>
              </div>

              {/* Calendrier interactif intégré à côté du titre */}
              <div className="flex items-center gap-3 bg-green-50 p-3 rounded-2xl border border-green-200">
                <span className="text-xl">📅</span>
                <div>
                  <label className="block text-xs font-bold text-green-800 uppercase tracking-wider">Date de la séance</label>
                  <input
                    type="date"
                    value={dateSelectionnee}
                    onChange={(e) => setDateSelectionnee(e.target.value)}
                    className="mt-1 bg-white border border-green-300 rounded-xl px-3 py-1.5 text-sm font-semibold text-green-900 outline-none focus:border-green-700 shadow-sm cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-green-700">Titre de la séance</label>
                <input
                  type="text"
                  value={compteRenduActuel.titre}
                  onChange={(e) => mettreAJourCompteRendu("titre", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-green-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Notions travaillées</label>
                <input
                  type="text"
                  value={compteRenduActuel.notionsTravaillees}
                  onChange={(e) => mettreAJourCompteRendu("notionsTravaillees", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-green-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-green-700">Résumé et ce qui a été fait</label>
              <textarea
                rows={3}
                value={compteRenduActuel.resume}
                onChange={(e) => mettreAJourCompteRendu("resume", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-green-700">Devoirs et ressources à consulter (PDF / Vidéo / Capsules)</label>
              <textarea
                rows={2}
                value={compteRenduActuel.devoirs}
                onChange={(e) => mettreAJourCompteRendu("devoirs", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-green-700"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-green-100">
              <span className="text-sm font-semibold text-emerald-700">
                {compteRenduActuel.publie ? "✅ Publié et diffusé aux parents/élèves pour cette date" : "⏳ Prêt à être publié pour cette date"}
              </span>
              <button
                onClick={() => mettreAJourCompteRendu("publie", true)}
                className="rounded-2xl bg-green-700 px-8 py-3 font-semibold text-white shadow-md hover:bg-green-800 transition"
              >
                Publier le compte-rendu (Diffusion automatique)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ONGLET 4 : SUIVI QOUR'AN / RÉCITATION */}
        {/* ========================================================= */}
        {ongletActif === "recitation" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100 space-y-6">
            <h3 className="text-2xl font-bold text-green-900">
              📖 Gestion et Validation du Qour&apos;an / Récitation ({groupeSelectionne.nom})
            </h3>
            <p className="text-sm text-green-800">
              Suivi individuel des portions mémorisées. L&apos;élève récite en direct en classe et vous validez sa portion ci-dessous pour mettre à jour sa progression.
            </p>

            <div className="space-y-4">
              {groupeSelectionne.eleves.map((eleve) => (
                <div key={eleve.id} className="flex flex-wrap items-center justify-between rounded-2xl bg-green-50/40 p-5 border border-green-100 gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-green-900">👦 {eleve.prenom}</h4>
                    <p className="text-sm text-green-700 mt-0.5">Statut actuel : {eleve.recitation}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-800 transition">
                      Valider la portion ✔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div> 
        )}

        {/* ========================================================= */}
        {/* ONGLET 5 : ADMINISTRATION */}
        {/* ========================================================= */}
        {ongletActif === "administration" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100 space-y-6">
            <h3 className="text-2xl font-bold text-green-900">⚙️ Administration - Gestion des Inscriptions</h3>
            <p className="text-sm text-green-700">
              Consultez et modifiez les informations des parents inscrits enregistrés dans le système.
            </p>

            {parentsInscrits.length === 0 ? (
              <div className="rounded-2xl bg-green-50/50 p-6 text-center border border-green-100">
                <p className="text-green-800 font-medium">Aucun parent inscrit trouvé dans le stockage local.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-green-100 text-sm font-semibold text-green-700">
                      <th className="py-3 px-4">Parent / Contact</th>
                      <th className="py-3 px-4">Téléphone / Email</th>
                      <th className="py-3 px-4">Groupe assigné</th>
                      <th className="py-3 px-4">Paiement</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {parentsInscrits.map((parent) => (
                      <tr key={parent.id} className="text-green-900 hover:bg-green-50/20">
                        <td className="py-4 px-4 font-bold">{parent.prenom} {parent.nom}</td>
                        <td className="py-4 px-4 text-sm text-green-700">
                          <div>{parent.telephone}</div>
                          <div className="text-xs text-green-600">{parent.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            parent.paiementStatut === "Payé" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {parent.paiementStatut || "En attente"} ({parent.montantDu || "0€"})
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setParentEdite(parent)}
                            className="rounded-xl bg-green-700 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-green-800 transition"
                          >
                            Modifier ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal de modification d'un parent */}
            {parentEdite && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-green-100 space-y-4">
                  <h4 className="text-xl font-bold text-green-900">Modifier le parent : {parentEdite.prenom} {parentEdite.nom}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-green-700">Groupe assigné</label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-green-200 p-2.5 text-sm outline-none focus:border-green-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-green-700">Statut du paiement</label>
                      <select
                        value={parentEdite.paiementStatut}
                        onChange={(e) => setParentEdite({ ...parentEdite, paiementStatut: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-green-200 p-2.5 text-sm outline-none focus:border-green-700 bg-white font-semibold"
                      >
                        <option value="Payé">Payé</option>
                        <option value="En attente">En attente</option>
                        <option value="Impayé">Impayé</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-green-700">Montant dû</label>
                      <input
                        type="text"
                        value={parentEdite.montantDu}
                        onChange={(e) => setParentEdite({ ...parentEdite, montantDu: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-green-200 p-2.5 text-sm outline-none focus:border-green-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-green-100">
                    <button
                      onClick={() => setParentEdite(null)}
                      className="rounded-xl border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => sauvegarderModification(parentEdite)}
                      className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-800 transition"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}