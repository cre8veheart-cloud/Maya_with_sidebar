"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { listSavedFiles } from "@/lib/maya/libraryData";

const CATEGORIES = ["All", "Briefs", "Contracts", "Reports", "Decks", "SOPs", "Other"];

function UploadZone() {
  return (
    <div className="border-2 border-dashed border-[#313244] rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#89b4fa]/50 transition-colors cursor-pointer">
      <span className="text-3xl">📄</span>
      <p className="text-[13px] text-[#585b70] text-center">
        Drop documents here or click to upload
      </p>
      <p className="text-[11px] text-[#585b70] text-center max-w-xs">
        PDFs, docs, and briefs you upload become part of your org knowledge base — queryable by Maya
      </p>
      <button className="mt-1 text-[12px] text-[#89b4fa] border border-[#89b4fa]/30 px-4 py-1.5 rounded-lg hover:bg-[#89b4fa]/10 transition-colors">
        Browse files
      </button>
    </div>
  );
}

export default function DocumentsPage() {
  const documents = useMemo(() => listSavedFiles(), []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? "");
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [doc.name, doc.summary, doc.category].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const selectedDocument =
    filteredDocuments.find((doc) => doc.id === selectedId) ?? filteredDocuments[0] ?? null;

  return (
    <PageShell
      title="Saved Files"
      subtitle="Org documents, briefs, and reference materials — queryable by Maya"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-[#585b70]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="flex-1 bg-transparent text-[13px] text-[#cdd6f4] placeholder-[#585b70] focus:outline-none"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  "text-[11px] font-semibold px-3 py-1 rounded-full transition-colors",
                  activeCategory === cat
                    ? "bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/40"
                    : "bg-[#1e1e2e] border border-[#313244] text-[#585b70] hover:text-[#cdd6f4]",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Upload zone */}
          <UploadZone />

          {/* Document list placeholder */}
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              All Saved Files
            </h2>
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className={[
                    "w-full text-left rounded-lg border p-4 transition-colors",
                    selectedDocument?.id === doc.id
                      ? "border-[#89b4fa]/40 bg-[#181825]"
                      : "border-[#313244] bg-[#181825] hover:border-[#585b70]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] text-[#cdd6f4] font-medium">{doc.name}</p>
                      <p className="text-[12px] text-[#a6adc8] mt-1">{doc.summary}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-[#585b70]">{doc.updatedAt}</p>
                      <p className="text-[10px] text-[#585b70] mt-1">{doc.sizeLabel}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              By Category
            </h2>
            <div className="space-y-1.5">
              {["Briefs", "Contracts", "Reports", "Decks", "SOPs", "Other"].map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#313244] cursor-pointer"
                >
                  <span className="text-[13px] text-[#cdd6f4]">{cat}</span>
                  <span className="text-[11px] text-[#585b70]">
                    {documents.filter((doc) => doc.category === cat).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-3">
              File Preview
            </h2>
            {selectedDocument ? (
              <div className="space-y-2">
                <p className="text-[13px] text-[#cdd6f4] font-medium">{selectedDocument.name}</p>
                <p className="text-[12px] text-[#a6adc8]">{selectedDocument.summary}</p>
                <p className="text-[11px] text-[#585b70]">
                  {selectedDocument.category} · {selectedDocument.updatedAt} · {selectedDocument.sizeLabel}
                </p>
              </div>
            ) : (
              <p className="text-[12px] text-[#585b70]">Select a saved file to preview it.</p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
