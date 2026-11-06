"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function FormulaireParent() {
  const router = useRouter();

  const [etape, setEtape] = useState(1);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissanceParent, setDateNaissanceParent] = useState("");

  const [enfants, setEnfants] = useState([
    {
      nom: "",
      prenom: "",
      naissance: "",
    },
  ]);

  const [telephone, setTelephone] = useState("");
  const [courriel, setCourriel] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // Si aucun groupe n'est spécifié dans l'URL, on affiche un message d'erreur bloquant
   {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#7D9D70] p-6">
        <div className="bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] text-center max-w-md shadow-2xl border border-[#5C7D50]">
          <Image src="/logo sans fond.png" alt="Logo" width={100} height={60} className="mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-red-600">Erreur d'inscription</h1>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            Aucun groupe n'est spécifié pour l'instant.
          </p>
        </div>
      </main>
    );
  }

  function calculerAge(date: string) {
    const naissance = new Date(date);
    const aujourdHui = new Date();

    let age = aujourdHui.getFullYear() - naissance.getFullYear();
    const mois = aujourdHui.getMonth() - naissance.getMonth();

    if (
      mois < 0 ||
      (mois === 0 && aujourdHui.getDate() < naissance.getDate())
    ) {
      age--;
    }

    return age;
  }

  function genererIdentifiant() {
    if (!prenom || !nom) return "prenom.nom@hidaya";
    return `${prenom.trim().toLowerCase()}.${nom.trim().toLowerCase()}@hidaya`;
  }

  function ajouterEnfant() {
    setEnfants([
      ...enfants,
      {
        nom: "",
        prenom: "",
        naissance: "",
      },
    ]);
  }

  function modifierEnfant(
    index: number,
    champ: string,
    valeur: string
  ) {
    const copie = [...enfants];
    copie[index] = {
      ...copie[index],
      [champ]: valeur,
    };
    setEnfants(copie);
  }

  function continuer() {
    if (etape === 1) {
      if (!nom || !prenom || !dateNaissanceParent) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      if (calculerAge(dateNaissanceParent) < 18) {
        alert(
          "Un compte parent est réservé aux personnes âgées de 18 ans et plus."
        );
        return;
      }
    }

    if (etape === 3 && (!telephone || !courriel)) {
      alert("Veuillez remplir vos coordonnées de contact.");
      return;
    }

    if (etape === 4 && (!motDePasse || motDePasse !== confirmation)) {
      alert("Veuillez vérifier vos mots de passe.");
      return;
    }

    if (etape < 5) {
      setEtape(etape + 1);
    }
  }

  function retour() {
    if (etape > 1) {
      setEtape(etape - 1);
    }
  }

  async function terminer() {
  try {
    // 1. Enregistrer le parent dans la table 'profiles'
    const { data: parentData, error: parentError } = await supabase
      .from("profiles")
      .insert([
        {
          nom,
          prenom,
          telephone,
          email: courriel,
          role: "parent",
        },
      ])
      .select()
      .single();

    if (parentError) throw parentError;

    // 2. Si le parent a des enfants, les enregistrer dans 'profiles'
    if (enfants && enfants.length > 0) {
      const enfantsAInserer = enfants.map((enfant: any) => ({
        nom: enfant.nom,
        prenom: enfant.prenom,
        role: "student",
        parent_id: parentData.id, // Relie l'enfant au parent
      }));

      const { error: enfantsError } = await supabase
        .from("profiles")
        .insert(enfantsAInserer);

      if (enfantsError) throw enfantsError;
    }

    alert("Inscription réussie ! Bienvenue sur votre portail Hidaya Institut.");
    router.push("/parent");
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    alert("Une erreur est survenue lors de l'inscription : " + error.message);
  }
}

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8"
      style={{
        backgroundColor: "#7D9D70",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* =========================================================
        ÉLÉMENTS DÉCORATIFS (Lettres et chiffres arabes espacés)
        ========================================================= */}
      <div className="absolute inset-0 opacity-45 pointer-events-none overflow-hidden select-none font-serif text-emerald-950 font-bold">
        <div className="absolute top-12 left-16 text-8xl -rotate-12">أ</div>
        <div className="absolute top-36 left-32 text-6xl rotate-12">١</div>
        <div className="absolute top-14 right-20 text-9xl rotate-12">ه</div>
        <div className="absolute top-40 right-40 text-7xl -rotate-12">٢</div>
        <div className="absolute top-1/2 -translate-y-1/2 left-12 text-9xl -rotate-6">ب</div>
        <div className="absolute top-1/3 left-24 text-7xl rotate-45">ج</div>
        <div className="absolute top-1/2 -translate-y-1/2 right-16 text-9xl -rotate-12">و</div>
        <div className="absolute top-1/3 right-32 text-8xl rotate-12">ز</div>
        <div className="absolute bottom-16 left-20 text-9xl rotate-12">د</div>
        <div className="absolute bottom-36 left-44 text-7xl -rotate-12">٣</div>
        <div className="absolute bottom-16 right-24 text-9xl -rotate-45">ح</div>
        <div className="absolute bottom-36 right-48 text-8xl rotate-6">٤</div>
      </div>

      {/* =========================================================
        GRAND CADRE CENTRAL SPACIEUX ET CHALEUREUX
        ========================================================= */}
      <div className="relative z-10 w-full max-w-xl bg-[#F4F7F5]/95 backdrop-blur-md border border-[#5C7D50] shadow-2xl shadow-emerald-950/35 rounded-[2.5rem] p-8 sm:p-12">

        {/* En-tête */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-white/90 rounded-3xl border border-[#D0DFD4] shadow-sm mb-4">
            <Image
              src="/logo sans fond.png"
              alt="Hidaya Institut"
              width={120}
              height={70}
              priority
              className="object-contain"
            />
          </div>

          <h1
            className="text-3xl font-bold text-emerald-950 tracking-tight"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Hidaya Institut
          </h1>
          <p className="mt-1 text-sm font-semibold text-emerald-800">
            Création de votre espace parent)
          </p>
        </div>

        {/* ================= ETAPE 1 ================= */}
        {etape === 1 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-950 text-center">
              👤 Vos informations
            </h2>
            <p className="mt-1 text-center text-xs text-emerald-900/80">
              Cette étape permet de vérifier que le titulaire du compte est majeur.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Nom
                </label>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  type="text"
                  placeholder="Votre nom"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Prénom
                </label>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  type="text"
                  placeholder="Votre prénom"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  📅 Date de naissance
                </label>
                <input
                  value={dateNaissanceParent}
                  onChange={(e) => setDateNaissanceParent(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPE 2 ================= */}
        {etape === 2 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-950 text-center">
              👶 Informations de vos enfants
            </h2>
            <p className="mt-1 text-center text-xs text-emerald-900/80">
              Enregistrez les enfants que vous souhaitez inscrire.
            </p>

            <div className="mt-6 space-y-6">
              {enfants.map((enfant, index) => (
                <div key={index} className="p-4 rounded-2xl bg-white/70 border border-emerald-800/20 space-y-3 shadow-sm">
                  <p className="text-xs font-bold text-emerald-900">Enfant #{index + 1}</p>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-emerald-950">Nom</label>
                    <input
                      type="text"
                      value={enfant.nom}
                      onChange={(e) => modifierEnfant(index, "nom", e.target.value)}
                      placeholder="Nom de l'enfant"
                      className="w-full rounded-xl border border-emerald-800/30 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-emerald-950">Prénom</label>
                    <input
                      type="text"
                      value={enfant.prenom}
                      onChange={(e) => modifierEnfant(index, "prenom", e.target.value)}
                      placeholder="Prénom de l'enfant"
                      className="w-full rounded-xl border border-emerald-800/30 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-emerald-950">Date de naissance</label>
                    <input
                      type="date"
                      value={enfant.naissance}
                      onChange={(e) => modifierEnfant(index, "naissance", e.target.value)}
                      className="w-full rounded-xl border border-emerald-800/30 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={ajouterEnfant}
                className="w-full py-2.5 rounded-2xl border border-dashed border-emerald-800 text-xs font-bold text-emerald-900 hover:bg-emerald-50 transition"
              >
                + Ajouter un autre enfant
              </button>
            </div>
          </div>
        )}

        {/* ================= ETAPE 3 ================= */}
        {etape === 3 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-950 text-center">
              📞 Coordonnées de contact
            </h2>
            <p className="mt-1 text-center text-xs text-emerald-900/80">
              Pour vous joindre facilement et recevoir les suivis.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Numéro WhatsApp / Téléphone
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+1 (514) 555-5555"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Adresse courriel
                </label>
                <input
                  type="email"
                  value={courriel}
                  onChange={(e) => setCourriel(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPE 4 ================= */}
        {etape === 4 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-950 text-center">
              🔐 Sécurité du compte
            </h2>
            <p className="mt-1 text-center text-xs text-emerald-900/80">
              Choisissez un mot de passe sécurisé.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Confirmation du mot de passe
                </label>
                <input
                  type="password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPE 5 ================= */}
        {etape === 5 && (
          <div className="mt-6 animate-in fade-in duration-300 text-center">
            <h2 className="text-2xl font-bold text-emerald-950">
              🎉 C'est terminé !
            </h2>
            <p className="mt-2 text-xs text-emerald-900/90 leading-relaxed">
              Voici votre nom d'utilisateur unique pour vous connecter à votre espace parent :
            </p>

            <div className="mt-6 rounded-2xl bg-white/90 border border-emerald-800/20 p-5 shadow-sm">
              <p className="text-xs font-bold text-emerald-900">
                Votre identifiant :
              </p>
              <p className="mt-2 text-xl font-bold text-emerald-800 break-all">
                {genererIdentifiant()}
              </p>
            </div>
          </div>
        )}

        {/* ================= PROGRESSION ================= */}
        <div className="mt-8">
          <div className="w-full h-2.5 rounded-full bg-emerald-900/10 overflow-hidden">
            <div
              className="h-full bg-emerald-900 transition-all duration-500"
              style={{
                width: `${(etape / 5) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-emerald-900">
            Étape {etape} sur 5
          </p>
        </div>

        {/* ================= BOUTONS ================= */}
        <div className="mt-6 flex gap-3">
          {etape > 1 && etape < 5 && (
            <button
              onClick={retour}
              className="flex-1 rounded-2xl border-2 border-emerald-900 py-3 text-xs font-bold text-emerald-950 hover:bg-emerald-50 transition shadow-sm"
            >
              Retour
            </button>
          )}

          {etape < 5 && (
            <button
              onClick={continuer}
              className="flex-1 rounded-2xl bg-emerald-900 py-3 text-xs font-bold text-white hover:bg-emerald-950 transition shadow-lg shadow-emerald-950/20"
            >
              Continuer
            </button>
          )}

          {etape === 5 && (
            <button
              onClick={terminer}
              className="w-full rounded-2xl bg-emerald-900 py-3 text-xs font-bold text-white hover:bg-emerald-950 transition shadow-lg shadow-emerald-950/20"
            >
              Accéder à mon espace
            </button>
          )}
        </div>

      </div>
    </main>
  );
}

// Enveloppement dans une Suspense boundary requis par Next.js pour l'utilisation de useSearchParams
export default function ParentInscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#7D9D70] flex items-center justify-center text-white font-bold">Chargement...</div>}>
      <FormulaireParent />
    </Suspense>
  );
}