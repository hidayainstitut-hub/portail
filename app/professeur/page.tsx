"use client";

import Image from "next/image";
import { useState, useEffect, type FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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

interface EleveRecitation {
  id: string;
  prenom: string;
  nom: string;
  groupeId?: string | null;
  groupeNom?: string | null;
  groupe?: string | null;
  currentJuz: string;
  currentPage: string;
  status: string;
  validated: boolean;
}

interface RegistrationRequest {
  id: string;
  parent_nom: string;
  parent_prenom: string;
  email: string;
  telephone: string | null;
  children: Array<{ prenom: string; groupe: string }>;
  status: string;
  created_at: string;
}

export default function TeacherDashboard() {
  const [professeurNom, setProfesseurNom] = useState("");

  const hidaya = "hidaya.institut.montreal@gmail.com";
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function recupererSession() {
      const { data, error } = await supabase.auth.getSession();

      if (ignore) return;

      if (!error) {
        setUserEmail(data.session?.user.email ?? null);
        if (data.session?.user.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("nom")
            .eq("id", data.session.user.id)
            .maybeSingle();
          if (!ignore) setProfesseurNom(profile?.nom ?? "");
        }
      } else {
        setUserEmail(null);
      }
    }

    recupererSession();

    return () => {
      ignore = true;
    };
  }, []);

  // --- GESTION DES PARENTS INSCRITS ---
  const [parentsInscrits, setParentsInscrits] = useState<ParentInscrit[]>([]);
  const [parentEdite, setParentEdite] = useState<ParentInscrit | null>(null);
  const [demandesInscription, setDemandesInscription] = useState<RegistrationRequest[]>([]);
  const [traitementDemande, setTraitementDemande] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchDemandesInscription() {
      const { data, error } = await supabase
        .from("registration_requests")
        .select("id, parent_nom, parent_prenom, email, telephone, children, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!error) {
        setDemandesInscription((data ?? []) as RegistrationRequest[]);
      }
    }

    fetchDemandesInscription();
  }, []);

  async function traiterDemande(requestId: string, action: "approve" | "reject") {
    if (traitementDemande) return;
    setTraitementDemande(requestId);

    const functionName = action === "approve"
      ? "approve_registration"
      : "reject_registration";
    const { error } = await supabase.rpc(functionName, { request_id: requestId });

    if (error) {
      alert(error.message);
    } else {
      setDemandesInscription((demandes) =>
        demandes.filter((demande) => demande.id !== requestId)
      );
    }
    setTraitementDemande(null);
  }

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
    }
  ]);

  // État pour la sélection d'un groupe actif dans l'onglet Groupes / Présences
  const [groupeSelectionne, setGroupeSelectionne] = useState(groupes[0]);

  const [elevesRecitation, setElevesRecitation] = useState<EleveRecitation[]>([]);
  const [loadingRecitation, setLoadingRecitation] = useState(false);
  const [validationEnCours, setValidationEnCours] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function chargerElevesRecitation() {
      setLoadingRecitation(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

      if (ignore) return;

      if (error || !data) {
        setElevesRecitation([]);
        setLoadingRecitation(false);
        return;
      }

      const groupeId = String(groupeSelectionne.id);
      const elevesDuGroupe = data.filter((profile) =>
        String(profile.group_id ?? profile.groupeId ?? "") === groupeId ||
        String(profile.groupeNom ?? profile.groupe ?? "") === groupeSelectionne.nom
      );

      const ids = elevesDuGroupe.map((profile) => String(profile.id));
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

      const elevesDynamiques = elevesDuGroupe.map((profile) => {
        const progression = progressions[String(profile.id)];
        const currentJuz = String(
          profile.current_juz ?? profile.juz ?? progression?.current_juz ?? progression?.juz ?? "Juz Amma"
        );
        const currentPage = String(
          profile.current_page ?? profile.page ?? progression?.current_page ?? progression?.page ?? "1"
        );
        const status = String(
          profile.recitation_status ?? progression?.status ?? `${currentJuz} - P. ${currentPage} en cours`
        );

        return {
          id: String(profile.id),
          prenom: String(profile.nom ?? ""),
          nom: "",
          groupeId: profile.group_id ?? profile.groupeId ?? null,
          groupeNom: profile.groupeNom ?? profile.groupe ?? null,
          groupe: profile.groupe ?? null,
          currentJuz,
          currentPage,
          status,
          validated: Boolean(progression?.validated ?? profile.recitation_validated),
        };
      });

      if (!ignore) setElevesRecitation(elevesDynamiques);
      setLoadingRecitation(false);
    }

    chargerElevesRecitation();

    const channel = supabase
      .channel(`recitation-progress-${groupeSelectionne.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recitation_progress" },
        () => {
          chargerElevesRecitation();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [groupeSelectionne]);

  const validerPortion = async (eleve: EleveRecitation) => {
    setValidationEnCours(eleve.id);

    const status = `${eleve.currentJuz} - P. ${eleve.currentPage} validée`;
    const { error } = await supabase.from("recitation_progress").insert({
      student_id: eleve.id,
      group_id: String(groupeSelectionne.id),
      current_juz: eleve.currentJuz,
      current_page: eleve.currentPage,
      status,
      validated: true,
      validated_at: new Date().toISOString(),
    });

    if (error) {
      alert(`Impossible d'enregistrer la validation : ${error.message}`);
      setValidationEnCours(null);
      return;
    }

    setElevesRecitation((eleves) =>
      eleves.map((item) =>
        item.id === eleve.id ? { ...item, status, validated: true } : item
      )
    );
    setValidationEnCours(null);
    alert(`Portion validée pour ${eleve.prenom} ${eleve.nom}.`);
  };

  interface EleveAppel {
    id: string;
    prenom: string;
    nom: string;
    parent: string;
  }

  const today = new Date();
  const dateDuJour = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [dateAppel, setDateAppel] = useState(dateDuJour);
  const [elevesAppel, setElevesAppel] = useState<EleveAppel[]>([]);
  const [loadingAppel, setLoadingAppel] = useState(false);
  const [presences, setPresences] = useState<Record<string, "Présent" | "Absent">>({});

  useEffect(() => {
    let ignore = false;

    async function chargerAppel() {
      setLoadingAppel(true);

      const { data: eleves, error } = await supabase
        .from("profiles")
        .select("id, nom, parent_id, group_id, groupeId, groupeNom, groupe, role")
        .eq("role", "student");

      if (error || !eleves) {
        if (!ignore) {
          setElevesAppel([]);
          setPresences({});
          setLoadingAppel(false);
        }
        return;
      }

      const elevesDuGroupe = eleves.filter((profile) =>
        String(profile.group_id ?? profile.groupeId ?? "") === String(groupeSelectionne.id) ||
        String(profile.groupeNom ?? profile.groupe ?? "") === groupeSelectionne.nom
      );

      const parentIds = elevesDuGroupe
        .map((eleve) => eleve.parent_id)
        .filter((id): id is string => Boolean(id));

      let parents: Array<{ id: string; nom?: string; telephone?: string; email?: string }> = [];
      if (parentIds.length > 0) {
        const { data: parentsData } = await supabase
          .from("profiles")
            .select("id, nom, telephone, email")
          .in("id", parentIds);
        parents = parentsData ?? [];
      }

      const parentsParId = new Map(parents.map((parent) => [String(parent.id), parent]));
      const listeEleves = elevesDuGroupe.map((profile) => {
        const prenom = String(profile.nom ?? "").trim();
        const nom = "";
        const parent = profile.parent_id ? parentsParId.get(String(profile.parent_id)) : undefined;
        const parentNom = parent
          ? String(parent.nom ?? "").trim()
          : "";
        const contact = parent
          ? [parentNom, parent.telephone, parent.email].filter(Boolean).join(" · ")
          : "Contact non renseigné";

        return { id: String(profile.id), prenom, nom, parent: contact };
      });

      const ids = listeEleves.map((eleve) => eleve.id);
      let records: Array<{ student_id: string; status: string }> = [];
      if (ids.length > 0) {
        const { data } = await supabase
          .from("attendances")
          .select("student_id, status")
          .eq("group_id", String(groupeSelectionne.id))
          .eq("attendance_date", dateAppel)
          .in("student_id", ids);
        records = data ?? [];
      }

      const statutParEleve: Record<string, "Présent" | "Absent"> = {};
      for (const record of records) {
        if (record.status === "Présent" || record.status === "Absent") {
          statutParEleve[String(record.student_id)] = record.status;
        }
      }

      if (!ignore) {
        setElevesAppel(listeEleves);
        setPresences(statutParEleve);
        setLoadingAppel(false);
      }
    }

    chargerAppel();

    const channel = supabase
      .channel(`attendances-${groupeSelectionne.id}-${dateAppel}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendances" },
        () => chargerAppel()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [groupeSelectionne, dateAppel]);

  const modifierPresence = async (eleveId: string, statut: "Présent" | "Absent") => {
    setPresences((current) => ({ ...current, [eleveId]: statut }));

    const { error } = await supabase.from("attendances").upsert(
      {
        student_id: eleveId,
        group_id: String(groupeSelectionne.id),
        attendance_date: dateAppel,
        status: statut,
      },
      { onConflict: "student_id,group_id,attendance_date" }
    );

    if (error) {
      alert(`Impossible d'enregistrer la présence : ${error.message}`);
    }
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

  const supabaseClient = createClientComponentClient();
  const [groupId, setGroupId] = useState<string>("1");
  const [summary, setSummary] = useState<string>("");
  const [homework, setHomework] = useState<string>("");
  const [resourceUrl, setResourceUrl] = useState<string>("");
  const [exerciseType, setExerciseType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!groupId || !summary.trim()) {
      alert("Sélectionnez un groupe et renseignez le résumé de la séance.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseClient.from("course_reports").insert({
      group_id: groupId,
      summary: summary.trim(),
      homework: homework.trim(),
      course_date: dateSelectionnee,
      is_published: true,
      resource_url: resourceUrl.trim() || null,
      exercise_type: exerciseType || null,
    });

    setLoading(false);

    if (error) {
      alert(`Erreur lors de l'enregistrement : ${error.message}`);
      return;
    }

    mettreAJourCompteRendu("publie", true);
    alert("Compte-rendu publié avec succès aux élèves et aux parents !");
    setSummary("");
    setHomework("");
    setResourceUrl("");
    setExerciseType("");
  };

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
              <p className="text-xs text-green-700 mt-1">Les absences enregistrées apparaîtront ici.</p>
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

        {/* Bouton Administration visible UNIQUEMENT pour le mail officiel de l'école */}
        {userEmail?.toLowerCase() === hidaya.toLowerCase() && (
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
        )}
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
                Bienvenue, {professeurNom} !
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
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-xl font-bold text-green-900">📋 Appel & Présences rapides</h4>
                  <div className="flex items-center gap-2">
                    <label htmlFor="date-appel" className="text-sm font-semibold text-green-700">Date de l&apos;appel</label>
                    <input
                      id="date-appel"
                      type="date"
                      value={dateAppel}
                      onChange={(e) => setDateAppel(e.target.value)}
                      className="rounded-xl border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-950 outline-none focus:border-green-700"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-green-100 text-sm font-semibold text-green-700">
                        <th className="py-3 px-4">Élève</th>
                        <th className="py-3 px-4">Parent contact</th>
                        <th className="py-3 px-4">Présence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50">
                      {loadingAppel ? (
                        <tr>
                          <td colSpan={3} className="py-6 px-4 text-center text-sm text-green-700">
                            Chargement des élèves...
                          </td>
                        </tr>
                      ) : elevesAppel.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 px-4 text-center text-sm text-green-700">
                            Aucun élève connecté à ce groupe.
                          </td>
                        </tr>
                      ) : elevesAppel.map((eleve) => (
                        <tr key={eleve.id} className="text-green-900 hover:bg-green-50/20">
                          <td className="py-4 px-4 font-bold">👦 {[eleve.prenom, eleve.nom].filter(Boolean).join(" ")}</td>
                          <td className="py-4 px-4 text-sm text-green-700">{eleve.parent}</td>
                          <td className="py-4 px-4">
                            <select
                              value={presences[eleve.id] ?? ""}
                              onChange={(e) => modifierPresence(eleve.id, e.target.value as "Présent" | "Absent")}
                              className="rounded-xl border border-green-200 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-green-700"
                            >
                              <option value="">Sélectionner</option>
                              <option value="Présent">✅ Présent</option>
                              <option value="Absent">❌ Absent</option>
                            </select>
                          </td>
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
                    className="mt-1 bg-white border border-green-300 rounded-xl px-3 py-1.5 text-sm font-semibold text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700 shadow-sm cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-green-700">Groupe concerné</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 bg-white p-3 outline-none focus:border-green-700"
                >
                  {groupes.map((groupe) => (
                    <option key={groupe.id} value={String(groupe.id)}>
                      {groupe.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Titre de la séance</label>
                <input
                  type="text"
                  value={compteRenduActuel.titre}
                  onChange={(e) => mettreAJourCompteRendu("titre", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Notions travaillées</label>
                <input
                  type="text"
                  value={compteRenduActuel.notionsTravaillees}
                  onChange={(e) => mettreAJourCompteRendu("notionsTravaillees", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-green-700">Résumé et ce qui a été fait</label>
              <textarea
                rows={3}
                value={compteRenduActuel.resume}
                onChange={(e) => mettreAJourCompteRendu("resume", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-green-200 p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-green-700">Devoirs et ressources à consulter (PDF / Vidéo / Capsules)</label>
              <textarea
                rows={2}
                value={compteRenduActuel.devoirs}
                onChange={(e) => mettreAJourCompteRendu("devoirs", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-green-200 p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
              />
            </div>

            <form onSubmit={handlePublish} className="space-y-4 rounded-2xl border border-green-100 bg-green-50/50 p-6">
              <h4 className="text-lg font-bold text-green-900">📝 Publier aux élèves et aux parents</h4>
              <div>
                <label className="block text-sm font-semibold text-green-700">Résumé de la séance</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  required
                  className="mt-2 w-full rounded-2xl border border-green-200 bg-white p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
                  placeholder="Qu'est-ce qui a été étudié aujourd'hui ?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-700">Devoirs / prochaine séance</label>
                <input
                  type="text"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 bg-white p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
                  placeholder="Ex. : apprendre les sourates..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-700">Lien vers une ressource</label>
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 bg-white p-3 text-green-950 placeholder:text-green-700/50 outline-none focus:border-green-700"
                  placeholder="https://.../support.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-700">Exercice interactif</label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-green-200 bg-white p-3 text-green-950 outline-none focus:border-green-700"
                >
                  <option value="">Aucun exercice</option>
                  <option value="recitation">Récitation</option>
                  <option value="quiz">Quiz</option>
                  <option value="revision">Révision</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-green-700 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Envoi en cours..." : "Envoyer aux élèves et parents"}
              </button>
            </form>

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
              {loadingRecitation && (
                <p className="text-sm font-semibold text-green-700">Chargement des élèves...</p>
              )}
              {!loadingRecitation && elevesRecitation.length === 0 && (
                <p className="rounded-2xl bg-green-50 p-5 text-sm font-semibold text-green-700">
                  Aucun élève trouvé pour ce groupe.
                </p>
              )}
              {elevesRecitation.map((eleve) => (
                <div key={eleve.id} className="flex flex-wrap items-center justify-between rounded-2xl bg-green-50/40 p-5 border border-green-100 gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-green-900">👦 {eleve.prenom} {eleve.nom}</h4>
                    <p className="text-sm text-green-700 mt-0.5">
                      Statut actuel : {eleve.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => validerPortion(eleve)}
                      disabled={validationEnCours === eleve.id}
                      className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-800 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {validationEnCours === eleve.id
                        ? "Enregistrement..."
                        : eleve.validated
                          ? "Portion validée ✔"
                          : "Valider la portion ✔"}
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
        {ongletActif === "administration" && userEmail?.toLowerCase() === hidaya.toLowerCase() && (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-green-100 space-y-6">
            <h3 className="text-2xl font-bold text-green-900">⚙️ Administration - Gestion des Inscriptions</h3>
            <p className="text-sm text-green-700">
              Consultez et modifiez les informations des parents inscrits enregistrés dans le système.
            </p>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
              <h4 className="text-lg font-bold text-green-900">Demandes en attente</h4>
              {demandesInscription.length === 0 ? (
                <p className="mt-3 text-sm text-green-800">Aucune demande en attente.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {demandesInscription.map((demande) => (
                    <div key={demande.id} className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold text-green-900">
                            {demande.parent_prenom} {demande.parent_nom}
                          </p>
                          <p className="text-sm text-green-700">{demande.email}</p>
                          {demande.telephone && (
                            <p className="text-sm text-green-700">{demande.telephone}</p>
                          )}
                          {Array.isArray(demande.children) && demande.children.length > 0 && (
                            <p className="mt-2 text-xs text-green-700">
                              Enfants : {demande.children.map((enfant) =>
                                `${enfant.prenom} (${enfant.groupe})`
                              ).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => traiterDemande(demande.id, "approve")}
                            disabled={traitementDemande === demande.id}
                            className="rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800 disabled:opacity-50"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => traiterDemande(demande.id, "reject")}
                            disabled={traitementDemande === demande.id}
                            className="rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Rejeter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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