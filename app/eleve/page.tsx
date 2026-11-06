"use client";

import { supabase } from "@/lib/supabase";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateSequenceForGroup } from "@/lib/sequence_generator";

   const [menuOpen, setMenuOpen] = useState(false);
function EspaceEleveContent() {  const searchParams = useSearchParams();
 const [eleve, setEleve] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerProfilEleve() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            setEleve(data);
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      } finally {
        setLoading(false);
      }
    }
    
    chargerProfilEleve();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Chargement de votre espace...</div>;
  }
  if (!eleve) {
    return <div className="flex h-screen items-center justify-center">Aucun profil trouvé pour cet utilisateur.</div>;
  }


  // 1. Récupération du groupe transmis (ex: ?groupe=groupe-a) - Par défaut Groupe A
  const groupeQuery = searchParams.get("groupe") || "groupe-a";

  // 2. Génération dynamique de la séquence pédagogique pour ce groupe
  const sequenceData = generateSequenceForGroup(groupeQuery);

  

  // Transformation des notions / séances du groupe en étapes de parcours
  const notions = sequenceData.notions_couvertes || [];
  const seanceTitre = sequenceData.seance_recente?.titre || "Révision de la semaine";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* 🟢 HEADER PRINCIPAL */}
      <header className="sticky top-0 z-30 bg-slate-800/90 backdrop-blur-md border-b border-emerald-500/20 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-emerald-400 transition text-xl"
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
          <div>
            <h1 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
              🧭 Hidaya Aventure
            </h1>
            <p className="text-xs text-slate-400">
              {eleve.nom} • <span className="text-emerald-300 font-semibold">{eleve.groupeNom}</span>
            </p>
          </div>
        </div>

        {/* STATS RAPIDES */}
        <div className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full">
            <span>🔥</span>
            <span>{eleve.streak} sem</span>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full">
            <span>⭐</span>
            <span>{eleve.etoiles}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full">
            <span>🏆</span>
            <span>{eleve.points} pts</span>
          </div>
        </div>
      </header>

      {/* 🔴 MENU TIROIR */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="relative w-72 max-w-[80%] bg-slate-800 border-r border-emerald-500/20 h-full p-5 flex flex-col justify-between z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-bold text-emerald-300">
                    {eleve.nom[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">{eleve.nom}</p>
                    <p className="text-xs text-emerald-400">{eleve.groupeNom} • Rang {eleve.rang}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/eleve/profil"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  👤 Profil & Rang
                </Link>
                <Link
                  href="/eleve/mission"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  ✨ Mission de la semaine
                </Link>
                <Link
                  href="/eleve/qouran"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  📖 Mon Qour'an
                </Link>
                <Link
                  href="/eleve/journal"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                
                  🏆 Trophées
                </Link>
              </nav>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <Link
                href="/connexion"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition text-sm font-semibold"
              >
                🚪 Déconnexion
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* 🌟 BANNIÈRE GUIDE HIDAYA */}
      <section className="bg-gradient-to-r from-emerald-950 via-slate-800 to-indigo-950 p-4 border-b border-emerald-500/20">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-amber-300 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-2xl">
                🤖
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-slate-950">
              Guide
            </span>
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-emerald-300 text-sm flex items-center gap-1.5">
              Guide Hidaya ✨
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              « As-Salamou ^Alaykoum {eleve.nom} ! Tu es dans le <strong className="text-emerald-400">{eleve.groupeNom}</strong>.
              Voici la capsule de révision préparée par ton enseignant.e ! »
            </p>
          </div>
        </div>
      </section>

      {/* 🗺️ CARTE D'AVENTURE DYNAMIQUE SELON LE GROUPE */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col items-center justify-center relative">
        <div className="w-full bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden my-4 backdrop-blur-sm">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Capsule : {eleve.groupeNom}
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-2">{seanceTitre}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {sequenceData.exercices?.length || 0} exercices • {notions.length} notions abordées
            </p>
          </div>

          {/* Liste des notions / étapes de la capsule */}
          <div className="relative flex flex-col items-center gap-8 py-4">
            {notions.map((notion: any, index: number) => {
              const isCurrent = index === 0; // Première notion = étape en cours
              const isLocked = index > 0;

              const offsetClass =
                index % 3 === 0
                  ? "self-center"
                  : index % 3 === 1
                  ? "self-start ml-8"
                  : "self-end mr-8";

              return (
                <div key={notion.id || index} className={`flex flex-col items-center z-10 ${offsetClass}`}>
                  <div className="relative group">
                    {isCurrent && (
                      <span className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping" />
                    )}

                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-xl shadow-xl border-4 transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? "bg-gradient-to-tr from-amber-500 to-emerald-500 border-amber-300 text-slate-950 scale-110 shadow-emerald-500/50"
                          : "bg-slate-700 border-slate-600 text-slate-500"
                      }`}
                    >
                      {isCurrent ? "▶" : "🔒"}
                    </div>
                  </div>

                  <div className="mt-2 text-center max-w-[180px]">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-amber-300" : "text-slate-400"
                      }`}
                    >
                      {notion.titre}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{notion.categorie}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🚀 BOUTON D'ACTION ADAPTÉ AU GROUPE */}
        <div className="w-full max-w-xl sticky bottom-4 z-20 px-2">
          <Link
            href={`/test-session?groupe=${eleve.groupeId}`}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-transform active:scale-95 border border-emerald-300"
          >
            ▶ LANCER LA CAPSULE ({eleve.groupeNom}) ➔
          </Link>
        </div>
      </main>
    </div>
  );
}
export default function EspaceElevePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold">
          Chargement...
        </div>
      }
    >
      <EspaceEleveContent />
    </Suspense>
  );
}