"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import alphabetData from "@/data/arabe/alphabet.json";
import shortVowelsData from "@/data/arabe/voyelles-courtes.json";
import longVowelsData from "@/data/arabe/voyelles-longues.json";

interface ExerciseItem {
  id: string;
  arabic: string;
  phonetic: string;
  audio: string | null;
}

interface ShortVowelEntry {
  id: string;
  lettre: string;
  voyelles: Record<string, { texte: string; audio?: string }>;
}

interface LongVowelEntry {
  id: string;
  lettre: string;
  voyelles: Record<string, { texte: string; audio?: string }>;
}

interface AlphabetEntry {
  id: string;
  lettre: string;
  translitteration: string;
  audio?: string;
  niveau: number;
}

const vowelNames: Record<string, string> = {
  a: "Fatha (a)",
  i: "Kasra (i)",
  ou: "Damma (ou)",
  a_long: "Fatha longue (aa)",
  i_long: "Kasra longue (ii)",
  ou_long: "Damma longue (ouu)",
};

function buildLevelItems(level: number): ExerciseItem[] {
  if (level === 1) {
    return (alphabetData as AlphabetEntry[]).map((entry) => ({
      id: entry.id,
      arabic: entry.lettre,
      phonetic: entry.translitteration,
      audio: entry.audio ?? null,
    }));
  }

  const source = level === 2 ? shortVowelsData : longVowelsData;
  return (source as Array<ShortVowelEntry | LongVowelEntry>).flatMap((entry) =>
    Object.entries(entry.voyelles).map(([key, value]) => ({
      id: `${entry.id}-${key}`,
      arabic: value.texte,
      phonetic: vowelNames[key] ?? key,
      audio: value.audio ?? null,
    }))
  );
}

function ExerciseContent() {
  const searchParams = useSearchParams();
  const exerciseType = searchParams.get("type") || "revision";
  const [level, setLevel] = useState(1);
  const [itemIndex, setItemIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  const items = useMemo(() => buildLevelItems(level), [level]);
  const currentItem = items[itemIndex] ?? items[0];

  const options = useMemo(() => {
    if (!currentItem || items.length === 0) return [];

    const alternatives = items
      .filter((item) => item.id !== currentItem.id)
      .map((item) => item.phonetic)
      .filter((value, index, values) => values.indexOf(value) === index);

    const shuffled = [...alternatives]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [...shuffled, currentItem.phonetic]
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort(() => Math.random() - 0.5);
  }, [currentItem, items]);

  useEffect(() => {
    setItemIndex(0);
    setSelected(null);
    setScore(0);
    setAudioUnavailable(false);
  }, [level]);

  if (!currentItem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
        Aucun exercice disponible.
      </main>
    );
  }

  const playAudio = async () => {
    if (!currentItem.audio) {
      setAudioUnavailable(true);
      return;
    }

    const audio = new Audio(currentItem.audio);
    audio.onerror = () => setAudioUnavailable(true);
    try {
      await audio.play();
      setAudioUnavailable(false);
    } catch {
      setAudioUnavailable(true);
    }
  };

  const answer = (value: string) => {
    if (selected) return;
    setSelected(value);
    if (value === currentItem.phonetic) {
      setScore((current) => current + 1);
    }
  };

  const nextItem = () => {
    setSelected(null);
    setAudioUnavailable(false);
    setItemIndex((current) => (current + 1) % items.length);
  };

  const previousItem = () => {
    setSelected(null);
    setAudioUnavailable(false);
    setItemIndex((current) => (current - 1 + items.length) % items.length);
  };

  const levelNames = [
    "Niveau 1 - Lettres",
    "Niveau 2 - Voyelles courtes",
    "Niveau 3 - Voyelles longues",
  ];

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-500/20 bg-slate-800 p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-emerald-400 sm:text-2xl">
            🎮 {exerciseType === "recitation" ? "Récitation interactive" : "Exercices arabes"}
          </h1>
          <Link href="/eleve" className="text-sm font-semibold text-slate-300 hover:text-white">
            Retour à l&apos;espace élève
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((availableLevel) => (
            <button
              key={availableLevel}
              type="button"
              onClick={() => setLevel(availableLevel)}
              className={`rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm ${
                level === availableLevel
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              {levelNames[availableLevel - 1]}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Élément {itemIndex + 1} / {items.length} • Score {score}
          </p>
          <p dir="rtl" className="mt-5 text-7xl font-bold leading-none text-emerald-300">
            {currentItem.arabic}
          </p>
          <p className="mt-3 text-xl font-bold text-amber-300">{currentItem.phonetic}</p>

          <button
            type="button"
            onClick={playAudio}
            className="mt-5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 font-bold text-emerald-300 hover:bg-emerald-500/20"
          >
            🔊 Écouter
          </button>
          {audioUnavailable && (
            <p className="mt-2 text-xs text-slate-400" role="status">
              Audio indisponible pour cet élément. L&apos;entraînement reste utilisable avec le texte.
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const correct = option === currentItem.phonetic;
            const wrongSelection = selected === option && !correct;
            const className = selected
              ? correct
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                : wrongSelection
                  ? "border-red-400 bg-red-500/20 text-red-200"
                  : "border-slate-700 bg-slate-800 text-slate-400"
              : "border-slate-600 bg-slate-700 text-slate-100 hover:border-emerald-400";

            return (
              <button
                key={option}
                type="button"
                onClick={() => answer(option)}
                className={`rounded-xl border px-4 py-3 font-bold transition ${className}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-between gap-3">
          <button
            type="button"
            onClick={previousItem}
            className="rounded-xl bg-slate-700 px-4 py-2.5 font-bold text-slate-200 hover:bg-slate-600"
          >
            ← Précédent
          </button>
          <button
            type="button"
            onClick={nextItem}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white hover:bg-emerald-500"
          >
            Suivant →
          </button>
        </div>
      </section>
    </main>
  );
}

export default function EleveExercisePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ExerciseContent />
    </Suspense>
  );
}
