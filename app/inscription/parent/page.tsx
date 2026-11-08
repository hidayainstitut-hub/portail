"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

function FormulaireParent() {
  const [etape, setEtape] = useState(1);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const [enfants, setEnfants] = useState([
    {
      prenom: "",
    },
  ]);

  const [telephone, setTelephone] = useState("");
  const [courriel, setCourriel] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function ajouterEnfant() {
    setEnfants([
      ...enfants,
      {
        prenom: "",
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
      if (!nom.trim() || !prenom.trim()) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }
    }

    if (etape === 2 && enfants.some((enfant) => !enfant.prenom.trim())) {
      alert("Veuillez saisir le prénom de chaque enfant.");
      return;
    }

    if (
      etape === 3 &&
      (!courriel.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel.trim()) ||
        motDePasse.length < 6 ||
        motDePasse !== confirmation)
    ) {
      alert("Veuillez saisir une adresse courriel valide et un mot de passe de 6 caractères minimum, puis confirmer celui-ci.");
      return;
    }

    if (etape < 3) {
      setEtape(etape + 1);
    } else {
      terminer();
    }
  }

  function retour() {
    if (etape > 1) {
      setEtape(etape - 1);
    }
  }

  async function terminer() {
    if (envoiEnCours) return;
    setEnvoiEnCours(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: courriel.trim(),
        password: motDePasse,
        options: {
          data: {
            nom: nom.trim(),
            prenom: prenom.trim(),
            full_name: `${prenom.trim()} ${nom.trim()}`,
            role: "pending",
            children: enfants.map((enfant) => ({
              prenom: enfant.prenom.trim(),
            })),
            telephone: telephone.trim(),
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Le compte n'a pas pu être créé.");
      await supabase.auth.signOut();
      setDemandeEnvoyee(true);
    } catch (error: unknown) {
      console.error("Erreur lors de l'inscription :", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

    if (demandeEnvoyee) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-[#7D9D70] p-6">
          <div className="w-full max-w-md rounded-[2.5rem] border border-[#5C7D50] bg-white/95 p-10 text-center shadow-2xl">
            <Image src="/logo sans fond.png" alt="Logo" width={120} height={70} className="mx-auto mb-5 object-contain" />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
            <h1 className="mt-5 text-2xl font-bold text-emerald-950">Demande reçue</h1>
            <p className="mt-3 text-sm leading-relaxed text-emerald-900">
              Votre demande d&apos;inscription a bien été reçue ! Votre compte sera activé par l&apos;administration sous peu.
            </p>
          </div>
        </main>
      );
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
                    <label className="block mb-1 text-xs font-semibold text-emerald-950">Prénom</label>
                    <input
                      type="text"
                      value={enfant.prenom}
                      onChange={(e) => modifierEnfant(index, "prenom", e.target.value)}
                      placeholder="Prénom de l'enfant"
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
                  Numéro WhatsApp
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
              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
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
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= PROGRESSION ================= */}
        <div className="mt-8">
          <div className="w-full h-2.5 rounded-full bg-emerald-900/10 overflow-hidden">
            <div
              className="h-full bg-emerald-900 transition-all duration-500"
              style={{
                width: `${(etape / 3) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-emerald-900">
            Étape {etape} sur 3
          </p>
        </div>

        {/* ================= BOUTONS ================= */}
        <div className="mt-6 flex gap-3">
          {etape > 1 && (
            <button
              onClick={retour}
              className="flex-1 rounded-2xl border-2 border-emerald-900 py-3 text-xs font-bold text-emerald-950 hover:bg-emerald-50 transition shadow-sm"
            >
              Retour
            </button>
          )}

          {etape < 3 && (
            <button
              onClick={continuer}
              className="flex-1 rounded-2xl bg-emerald-900 py-3 text-xs font-bold text-white hover:bg-emerald-950 transition shadow-lg shadow-emerald-950/20"
            >
              Continuer
            </button>
          )}

          {etape === 3 && (
            <button
              onClick={terminer}
              disabled={envoiEnCours}
              className="w-full rounded-2xl bg-emerald-900 py-3 text-xs font-bold text-white hover:bg-emerald-950 transition shadow-lg shadow-emerald-950/20"
            >
              {envoiEnCours ? "Envoi en cours..." : "S'inscrire"}
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