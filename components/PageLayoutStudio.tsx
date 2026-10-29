"use client";

import { useState } from "react";

const presets = [
  { name: "MAYA Letterhead", width: 8.5, height: 11, unit: "in" },
  { name: "Business Card", width: 3.5, height: 2, unit: "in" },
  { name: "A4", width: 210, height: 297, unit: "mm" },
  { name: "Presentation", width: 13.333, height: 7.5, unit: "in" },
  { name: "Square", width: 10, height: 10, unit: "in" },
  { name: "Poster", width: 18, height: 24, unit: "in" },
  { name: "Magazine", width: 8.375, height: 10.875, unit: "in" },
] as const;

export default function PageLayoutStudio() {
  const [preset, setPreset] = useState<(typeof presets)[number]>(presets[0]);
  const [landscape, setLandscape] = useState(false);
  const [facingPages, setFacingPages] = useState(true);
  const [columns, setColumns] = useState(2);
  const [margin, setMargin] = useState(0.5);
  const [activePage, setActivePage] = useState(1);
  const [pages, setPages] = useState([1, 2]);

  const width = landscape ? preset.height : preset.width;
  const height = landscape ? preset.width : preset.height;
  const ratio = Number(width) / Number(height);
  const canvasWidth = ratio >= 1 ? 340 : 250;
  const canvasHeight = canvasWidth / ratio;

  const addPage = () => {
    const next = pages.length + 1;
    setPages((current) => [...current, next]);
    setActivePage(next);
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Native production tool</p>
          <h2 className="mt-1 text-xl font-semibold">Page Layout Studio</h2>
          <p className="mt-1 max-w-2xl text-sm text-black/55">
            Compose pages and spreads in MAYA, then export for review or continue advanced production in InDesign.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold">Preview PDF</button>
          <a href="https://www.adobe.com/products/indesign.html" target="_blank" rel="noreferrer" className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
            Continue in InDesign ↗
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[18rem_1fr_12rem]">
        <aside>
          <p className="text-xs font-semibold uppercase tracking-wider text-black/40">Document setup</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {presets.map((item) => (
              <button
                key={item.name}
                onClick={() => setPreset(item)}
                className={[
                  "rounded-xl border px-3 py-3 text-left text-sm",
                  preset.name === item.name ? "border-black bg-black text-white" : "border-black/10 bg-[#f7f7f4]",
                ].join(" ")}
              >
                <span className="block font-semibold">{item.name}</span>
                <span className={preset.name === item.name ? "text-white/55" : "text-black/40"}>
                  {item.width} × {item.height} {item.unit}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3 rounded-xl border border-black/10 p-3 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span>Landscape</span>
              <input type="checkbox" checked={landscape} onChange={(event) => setLandscape(event.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Facing pages</span>
              <input type="checkbox" checked={facingPages} onChange={(event) => setFacingPages(event.target.checked)} />
            </label>
            <label className="block">
              <span className="flex justify-between"><span>Columns</span><strong>{columns}</strong></span>
              <input className="mt-2 w-full" type="range" min="1" max="6" value={columns} onChange={(event) => setColumns(Number(event.target.value))} />
            </label>
            <label className="block">
              <span className="flex justify-between"><span>Margins</span><strong>{margin.toFixed(2)} in</strong></span>
              <input className="mt-2 w-full" type="range" min="0.25" max="1.5" step="0.25" value={margin} onChange={(event) => setMargin(Number(event.target.value))} />
            </label>
          </div>
        </aside>

        <div className="grid min-h-[32rem] place-items-center overflow-auto rounded-2xl border border-black/10 bg-[#ecece8] p-6">
          <div className={facingPages ? "flex items-center gap-2" : ""}>
            {(facingPages ? [activePage, Math.min(activePage + 1, pages.length)] : [activePage]).map((page, index) => (
              <div
                key={`${page}-${index}`}
                className="relative bg-white shadow-xl"
                style={{ width: canvasWidth, height: Math.min(canvasHeight, 460) }}
              >
                <div className="absolute border border-cyan-400/50" style={{
                  inset: `${Math.max(12, margin * 26)}px`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: 8,
                }}>
                  {Array.from({ length: columns }).map((_, column) => (
                    <div key={column} className="border-x border-dashed border-fuchsia-400/35" />
                  ))}
                </div>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-black/35">{page}</span>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40">Pages</p>
            <button onClick={addPage} className="rounded-lg bg-black px-2.5 py-1.5 text-xs font-semibold text-white">+ Page</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={[
                  "aspect-[3/4] rounded-lg border bg-white p-2 text-left text-xs shadow-sm",
                  activePage === page ? "border-black ring-2 ring-black/10" : "border-black/10",
                ].join(" ")}
              >
                <span className="text-black/40">Page {page}</span>
                <span className="mt-2 block h-1 w-3/4 bg-black/10" />
                <span className="mt-1 block h-1 w-1/2 bg-black/10" />
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-black/10 bg-[#f7f7f4] p-3 text-xs leading-relaxed text-black/55">
            {preset.name} · {width} × {height} {preset.unit}<br />
            {columns} column{columns === 1 ? "" : "s"} · {margin.toFixed(2)} in margins
          </div>
        </aside>
      </div>
    </section>
  );
}
