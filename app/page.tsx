import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      

      <main 
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8"
        style={{ 
          backgroundColor: "#7D9D70", // Vert sauge vif et lumineux
          fontFamily: "'Plus Jakarta Sans', sans-serif" 
        }}
      >
        
        {/* =========================================================
          ÉLÉMENTS DÉCORATIFS ESPACÉS ET ORGANISÉS (Sans superposition)
          ========================================================= */}
        <div className="absolute inset-0 opacity-45 pointer-events-none overflow-hidden select-none font-serif text-emerald-950 font-bold">
          
          {/* --- ZONE HAUT GAUCHE --- */}
          <div className="absolute top-12 left-16 text-8xl -rotate-12">أ</div>
          <div className="absolute top-36 left-32 text-6xl rotate-12">١</div>

          {/* --- ZONE HAUT DROITE --- */}
          <div className="absolute top-14 right-20 text-9xl rotate-12">ه</div>
          <div className="absolute top-40 right-40 text-7xl -rotate-12">٢</div>

          {/* --- ZONE MILIEU GAUCHE (Extrémité) --- */}
          <div className="absolute top-1/2 -translate-y-1/2 left-12 text-9xl -rotate-6">ب</div>
          <div className="absolute top-1/3 left-24 text-7xl rotate-45">ج</div>

          {/* --- ZONE MILIEU DROITE (Extrémité) --- */}
          <div className="absolute top-1/2 -translate-y-1/2 right-16 text-9xl -rotate-12">و</div>
          <div className="absolute top-1/3 right-32 text-8xl rotate-12">ز</div>

          {/* --- ZONE BAS GAUCHE --- */}
          <div className="absolute bottom-16 left-20 text-9xl rotate-12">د</div>
          <div className="absolute bottom-36 left-44 text-7xl -rotate-12">٣</div>

          {/* --- ZONE BAS DROITE --- */}
          <div className="absolute bottom-16 right-24 text-9xl -rotate-45">ح</div>
          <div className="absolute bottom-36 right-48 text-8xl rotate-6">٤</div>

        </div>

        {/* =========================================================
          GRAND CADRE CENTRAL SPACIEUX ET CHALEUREUX
          ========================================================= */}
        <div className="relative z-10 w-full max-w-2xl bg-[#F4F7F5]/95 backdrop-blur-md border border-[#5C7D50] shadow-2xl shadow-emerald-950/30 rounded-[2.5rem] p-10 sm:p-14 text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/90 rounded-3xl border border-[#D0DFD4] shadow-sm">
              <Image
                src="/logo sans fond.png"
                alt="Hidaya Institut"
                width={180}
                height={105}
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Nom avec la police Merriweather */}
          <h1 
            className="text-4xl sm:text-5xl font-bold text-emerald-950 tracking-tight"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Hidaya Institut
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-emerald-950/90 max-w-lg mx-auto font-light">
            Votre institut virtuel dédié à l'apprentissage 
            de la langue arabe, du Qour'an et de la science islamique, où chaque élève avance à son rythme.
          </p>

          {/* Boutons d'action */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/connexion"
              className="rounded-2xl bg-emerald-900 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-950 hover:shadow-xl hover:-translate-y-0.5 text-center"
            >
              Se connecter
            </Link>

            <Link
              href="/inscription"
              className="rounded-2xl border-2 border-emerald-950/40 bg-white/80 px-8 py-4 text-base font-bold text-emerald-950 transition-all hover:bg-white hover:border-emerald-950 text-center shadow-sm"
            >
              Ouvrir un compte
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}