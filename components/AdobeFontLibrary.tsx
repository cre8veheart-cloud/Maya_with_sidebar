"use client";

import { useMemo, useState } from "react";

type FontCategory = "Modern" | "Editorial" | "Presentation" | "Handwritten" | "Mono";

type FontChoice = {
  name: string;
  family: string;
  category: FontCategory;
  fallback: string;
};

const fonts: FontChoice[] = [
  { name: "Helvetica · Device", family: "Helvetica Neue", category: "Modern", fallback: "Helvetica, Arial, sans-serif" },
  { name: "Acumin Pro", family: "acumin-pro", category: "Modern", fallback: "Arial, sans-serif" },
  { name: "Source Sans 3", family: "source-sans-3", category: "Modern", fallback: "Arial, sans-serif" },
  { name: "Proxima Nova", family: "proxima-nova", category: "Modern", fallback: "Arial, sans-serif" },
  { name: "Museo Sans", family: "museo-sans", category: "Modern", fallback: "Arial, sans-serif" },
  { name: "Source Serif 4", family: "source-serif-4", category: "Editorial", fallback: "Georgia, serif" },
  { name: "Freight Text Pro", family: "freight-text-pro", category: "Editorial", fallback: "Georgia, serif" },
  { name: "Bely Display", family: "bely-display", category: "Editorial", fallback: "Georgia, serif" },
  { name: "Futura PT", family: "futura-pt", category: "Presentation", fallback: "Arial, sans-serif" },
  { name: "Brandon Grotesque", family: "brandon-grotesque", category: "Presentation", fallback: "Arial, sans-serif" },
  { name: "Bebas Neue Pro", family: "bebas-neue-pro", category: "Presentation", fallback: "Impact, sans-serif" },
  { name: "Adobe Handwriting", family: "adobe-handwriting-ernie", category: "Handwritten", fallback: "'Segoe Print', cursive" },
  { name: "Learning Curve", family: "learning-curve", category: "Handwritten", fallback: "'Segoe Print', cursive" },
  { name: "Source Code Pro", family: "source-code-pro", category: "Mono", fallback: "Menlo, monospace" },
];

const categories: Array<"All" | FontCategory> = [
  "All",
  "Modern",
  "Editorial",
  "Presentation",
  "Handwritten",
  "Mono",
];

function stack(font: FontChoice): string {
  return `"${font.family}", ${font.fallback}`;
}

export default function AdobeFontLibrary({ connected }: { connected: boolean }) {
  const [selected, setSelected] = useState(fonts[0]);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparison, setComparison] = useState<string[]>([]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return fonts.filter((font) =>
      (category === "All" || font.category === category) &&
      (!needle || font.name.toLowerCase().includes(needle)),
    );
  }, [category, query]);

  const toggleComparison = (name: string) => {
    setComparison((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current.slice(-2), name],
    );
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Type library</p>
            <h2 className="mt-1 text-lg font-semibold">Adobe Fonts</h2>
          </div>
          <span className={[
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
          ].join(" ")}>
            {connected ? "Connected" : "Project needed"}
          </span>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search fonts"
          aria-label="Search Adobe Fonts"
          className="mt-4 w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-3 py-2.5 text-sm outline-none focus:border-black/30"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={[
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
                category === item ? "bg-black text-white" : "border border-black/10 text-black/60",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {visible.map((font) => (
            <button
              key={font.name}
              onClick={() => setSelected(font)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                selected.name === font.name
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/25",
              ].join(" ")}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg" style={{ fontFamily: stack(font) }}>
                  {font.name}
                </span>
                <span className={[
                  "mt-0.5 block text-[11px]",
                  selected.name === font.name ? "text-white/55" : "text-black/40",
                ].join(" ")}>
                  {font.category}
                </span>
              </span>
              <span
                role="button"
                aria-label={favorites.includes(font.name) ? "Remove favorite" : "Add favorite"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFavorite(font.name);
                }}
                className="rounded-full p-1 text-base"
              >
                {favorites.includes(font.name) ? "★" : "☆"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-[#fbfbf9] p-5 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Board preview</p>
            <p className="mt-1 text-sm text-black/55">{selected.name} · {selected.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleComparison(selected.name)}
              className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold"
            >
              {comparison.includes(selected.name) ? "Remove comparison" : "Compare"}
            </button>
            <button className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
              Use font
            </button>
          </div>
        </div>
        <div className="grid min-h-80 place-items-center px-2 py-10 text-center">
          <div style={{ fontFamily: stack(selected) }}>
            <p className="text-4xl leading-tight md:text-6xl">The decision is clear.</p>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-black/55">
              Shape the idea, align the room, and leave with the next move.
            </p>
          </div>
        </div>
        {comparison.length > 0 && (
          <div className="mb-4 grid gap-2 border-t border-black/10 pt-4 md:grid-cols-3">
            {comparison.map((name) => {
              const font = fonts.find((item) => item.name === name);
              if (!font) return null;
              return (
                <button
                  key={font.name}
                  onClick={() => setSelected(font)}
                  className="rounded-xl border border-black/10 bg-white p-4 text-left"
                >
                  <span className="text-xs text-black/40">{font.name}</span>
                  <span className="mt-3 block text-xl" style={{ fontFamily: stack(font) }}>
                    The decision is clear.
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {!connected && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            <p>
              Add an Adobe Fonts Web Project ID to activate licensed previews. Until connected, MAYA uses a safe local fallback while preserving each font selection.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://account.adobe.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold text-amber-900"
              >
                Authorize Adobe ↗
              </a>
              <a
                href="https://fonts.adobe.com/my_fonts"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold text-amber-900"
              >
                Open Fonts Projects ↗
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
