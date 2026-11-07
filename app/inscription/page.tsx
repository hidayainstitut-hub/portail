import Image from "next/image";
import Link from "next/link";

export default function InscriptionPage() {
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
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-emerald-950/90 max-w-md mx-auto font-light">
            Bienvenue à Hidaya Institut. Ouvrez votre espace personnel afin de commencer votre parcours d&apos;apprentissage de la langue arabe, du Qour&apos;an et de la culture islamique.
          </p>

          {/* Question */}
          <h2 className="mt-8 text-base font-bold text-emerald-950">
            Vous êtes :
          </h2>

          {/* Choix des profils */}
          <div className="mt-4 w-full flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription/parent"
              className="flex-1 items-center justify-center rounded-2xl border-2 border-emerald-900 bg-white py-3.5 px-6 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 shadow-sm text-center"
            >
              👥 Parent
            </Link>

            <Link
              href="/inscription/eleve"
              className="flex-1 items-center justify-center rounded-2xl border-2 border-emerald-900 bg-white py-3.5 px-6 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 shadow-sm text-center"
            >
              📚 Élève
            </Link>
          </div>

          {/* Retour */}
          <div className="mt-8 pt-4 border-t border-emerald-900/20">
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