"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();

  const [profil, setProfil] = useState<"parent" | "eleve" | "prof" | null>(null);
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  const executerConnexion = async (emailAUtiliser?: string) => {
    setErreur("");
    const targetEmail = emailAUtiliser || identifiant;

    if (!targetEmail || !motDePasse) {
      setErreur("Veuillez saisir votre e-mail et votre mot de passe.");
      return;
    }

    // Authentification réelle avec Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: motDePasse,
    });

    if (error) {
      setErreur("Identifiants incorrects ou utilisateur introuvable.");
      return;
    }

    // Enregistre les infos d'accès locales si besoin
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    // Redirection vers le tableau de bord
    router.push("/professeur");
  };

  return (
    <>
      <main 
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8"
        style={{ 
          backgroundColor: "#7D9D70", // Vert sauge vif et lumineux
          fontFamily: "'Plus Jakarta Sans', sans-serif" 
        }}
      >
        
        {/* =========================================================
          ÉLÉMENTS DÉCORATIFS (Lettres et chiffres arabes bien espacés)
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
        <div className="relative z-10 w-full max-w-xl bg-[#F4F7F5]/95 backdrop-blur-md border border-[#5C7D50] shadow-2xl shadow-emerald-950/30 rounded-[2.5rem] p-8 sm:p-12 text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/90 rounded-3xl border border-[#D0DFD4] shadow-sm">
              <Image
                src="/logo sans fond.png"
                alt="Hidaya Institut"
                width={150}
                height={85}
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Nom avec la police Merriweather */}
          <h1 
            className="text-3xl sm:text-4xl font-bold text-emerald-950 tracking-tight"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Hidaya Institut
          </h1>

          {/* Texte d'accueil */}
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-emerald-900/90 font-light">
            Bon retour ! Poursuivez votre cheminement vers At-Taqwa.
          </p>

          {/* Message d'erreur */}
          {erreur && (
            <div className="mt-4 w-full rounded-2xl bg-red-100 p-3 text-xs font-medium text-red-700 border border-red-200">
              {erreur}
            </div>
          )}

          {/* ================= CHOIX DU PROFIL ================= */}
          {profil === null && (
            <>
              <h2 className="mt-6 text-base font-bold text-emerald-950">
                Vous êtes :
              </h2>

              <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setProfil("eleve");
                  }}
                  className="flex items-center justify-center rounded-2xl border-2 border-emerald-900 bg-white py-3 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 shadow-sm"
                >
                  📚 Élève
                </button>

                <button
                  onClick={() => {
                    setProfil("parent");
                  }}
                  className="flex items-center justify-center rounded-2xl border-2 border-emerald-900 bg-white py-3 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 shadow-sm"
                >
                  👥 Parent
                </button>

                <button
                  onClick={() => {
                    setProfil("prof");
                  }}
                  className="flex items-center justify-center rounded-2xl border-2 border-emerald-900 bg-white py-3 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 shadow-sm"
                >
                  👨‍🏫 Enseignant
                </button>
              </div>
            </>
          )}

          {/* ================= FORMULAIRE DE CONNEXION ================= */}
          {profil !== null && (
            <div className="mt-6 w-full animate-in fade-in duration-300">
              <button
                onClick={() => {
                  setProfil(null);
                  setErreur("");
                }}
                className="mb-4 text-xs font-bold text-emerald-800 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                ← Changer de rôle ({profil})
              </button>

              <form onSubmit={(e) => { e.preventDefault(); executerConnexion(); }} className="space-y-3">
                <input
                  type="text"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="Identifiant (ex: courriel de l'école)"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-5 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />

                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-5 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-900 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-950 shadow-lg shadow-emerald-950/20"
                >
                  Se connecter
                </button>
              </form>
            </div>
          )}

        

          {/* Liens bas de page */}
          <div className="mt-6 pt-4 border-t border-emerald-900/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-emerald-900">Pas encore de compte ?</span>
            <Link
              href="/inscription"
              className="font-bold text-emerald-950 underline hover:text-emerald-800"
            >
              Ouvrir un compte
            </Link>
          </div>

          <div className="mt-4">
            <Link
              href="/"
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}