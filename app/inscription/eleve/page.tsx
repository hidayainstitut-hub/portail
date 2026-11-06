"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EleveInscriptionPage() {
  const router = useRouter();

  const [etape, setEtape] = useState(1);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");
  const [courrielPaiement, setCourrielPaiement] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [age, setAge] = useState<number | null>(null);

  function calculerAge(date: string) {
    const aujourdHui = new Date();
    const naissance = new Date(date);

    let ageCalcule = aujourdHui.getFullYear() - naissance.getFullYear();
    const mois = aujourdHui.getMonth() - naissance.getMonth();

    if (
      mois < 0 ||
      (mois === 0 && aujourdHui.getDate() < naissance.getDate())
    ) {
      ageCalcule--;
    }

    return ageCalcule;
  }

  function changerDateNaissance(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value;
    setDateNaissance(date);
    if (date) {
      setAge(calculerAge(date));
    }
  }

  function genererIdentifiant() {
    if (!prenom || !nom) return "prenom.p@hidaya.institut";
    const prenomClean = prenom.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    const premiereLettreNom = nom.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0);
    return `${prenomClean}.${premiereLettreNom || "x"}@hidaya.institut`;
  }

  function avancer() {
    if (etape === 1) {
      if (!nom || !prenom || !dateNaissance || !telephone) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      if (age !== null && age < 12) {
        alert("Pour ouvrir ton espace élève, il faut passer par un compte parent :)");
        return;
      }
    }

    if (etape === 2 && !courrielPaiement) {
      alert("Veuillez entrer une adresse courriel pour les paiements.");
      return;
    }

    if (etape === 3 && (!motDePasse || motDePasse !== confirmation)) {
      alert("Veuillez vérifier vos mots de passe.");
      return;
    }

    if (etape < 4) {
      setEtape(etape + 1);
    }
  }

  function reculer() {
    if (etape > 1) {
      setEtape(etape - 1);
    }
  }

  function terminer() {
    // Sauvegarde optionnelle dans le localStorage pour l'administration
    const nouvelEleve = {
      id: genererIdentifiant(),
      prenom,
      nom,
      telephone,
      courrielPaiement,
    };
    const elevesExistants = JSON.parse(localStorage.getItem("hidaya_enfants_temp") || "[]");
    elevesExistants.push(nouvelEleve);
    localStorage.setItem("hidaya_enfants_temp", JSON.stringify(elevesExistants));

    router.push("/eleve");
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
            Création de votre espace élève
          </p>
        </div>

        {/* ================= ETAPE 1 ================= */}
        {etape === 1 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <p className="text-center text-xs leading-relaxed text-emerald-900/80 mb-6">
              Ouvrez votre espace personnel pour suivre votre progression en langue arabe, 
              dans la mémorisation du Qour'an et dans la découverte de la culture islamique.
            </p>

            <h2 className="text-xl font-bold text-emerald-950 text-center">
              🎓 Vos informations
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Prénom
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  📅 Date de naissance
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={changerDateNaissance}
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

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
            </div>

            {age !== null && age < 12 && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <p className="text-xs font-bold text-amber-900">
                  😊 Pour ouvrir ton espace élève, il faut passer par un compte parent :)
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= ETAPE 2 ================= */}
        {etape === 2 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-950 text-center">
              📧 Informations de paiement
            </h2>
            <p className="mt-1 text-center text-xs text-emerald-900/80">
              Indiquez l'adresse courriel qui sera rattachée aux règlements.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Adresse courriel de paiement
                </label>
                <input
                  type="email"
                  value={courrielPaiement}
                  onChange={(e) => setCourrielPaiement(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPE 3 ================= */}
        {etape === 3 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-950 text-center">
              🔐 Sécurisez votre compte
            </h2>
            <p className="mt-1 text-center text-xs text-emerald-900/80">
              Choisissez un mot de passe robuste pour protéger votre espace.
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
                  placeholder="Créer un mot de passe"
                  className="w-full rounded-2xl border border-emerald-800/40 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-800/50 outline-none focus:ring-2 focus:ring-emerald-900 shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-emerald-950">
                  Confirmer le mot de passe
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

        {/* ================= ETAPE 4 ================= */}
        {etape === 4 && (
          <div className="mt-6 animate-in fade-in duration-300 text-center">
            <h2 className="text-2xl font-bold text-emerald-950">
              🎉 FINI !
            </h2>
            <p className="mt-2 text-xs text-emerald-900/90 leading-relaxed">
              Ton identifiant te permettra d'accéder à ton espace d'apprentissage Hidaya 
              et de poursuivre ton parcours.
            </p>

            <div className="mt-6 rounded-2xl bg-white/90 border border-emerald-800/20 p-5 shadow-sm">
              <p className="text-xs font-bold text-emerald-900">
                Ton identifiant élève :
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-800 break-all select-all">
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
                width: `${(etape / 4) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-emerald-900">
            Étape {etape} sur 4
          </p>
        </div>

        {/* ================= BOUTONS ================= */}
        <div className="mt-6 flex gap-3">
          {etape > 1 && etape < 4 && (
            <button
              onClick={reculer}
              className="flex-1 rounded-2xl border-2 border-emerald-900 py-3 text-xs font-bold text-emerald-950 hover:bg-emerald-50 transition shadow-sm"
            >
              Retour
            </button>
          )}

          {etape < 4 && (
            <button
              onClick={avancer}
              disabled={etape === 1 && age !== null && age < 12}
              className={`flex-1 rounded-2xl bg-emerald-900 py-3 text-xs font-bold text-white transition shadow-lg shadow-emerald-950/20 ${
                etape === 1 && age !== null && age < 12
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-emerald-950"
              }`}
            >
              Continuer
            </button>
          )}

          {etape === 4 && (
            <button
              onClick={terminer}
              className="w-full rounded-2xl bg-emerald-900 py-3 text-xs font-bold text-white hover:bg-emerald-950 transition shadow-lg shadow-emerald-950/20"
            >
              Terminer
            </button>
          )}
        </div>

      </div>
    </main>
  );
}