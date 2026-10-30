"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AgentWorkspace from "./AgentWorkspace";
import type { Artwork, GalleryDraft } from "@/lib/gallery/types";
import {
  emptyGallery, GALLERY_DRAFT_KEY, MAX_BACKUP_BYTES, MAX_IMAGE_BYTES,
  normalizeArtwork, normalizeGallery, parseGalleryBackup, saveGalleryDraft, serializeGallery,
} from "@/lib/gallery/draft-core.mjs";

type Section = "collection" | "website" | "preview" | "assistant";
const sections: { id: Section; label: string }[] = [
  { id: "collection", label: "Collection" }, { id: "website", label: "Website" },
  { id: "preview", label: "Website preview" }, { id: "assistant", label: "Mimi · Gallery assistant" },
];
const inputStyle = "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800";
const buttonStyle = "rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-100 disabled:opacity-40";
const newArtwork = (): Artwork => ({
  id: crypto.randomUUID(), title: "", artist: "", medium: "", dimensions: "",
  year: "", price: "", status: "available", image: "", onWebsite: false,
});

function ArtworkImage({ artwork }: { artwork: Artwork }) {
  return artwork.image
    ? <div className="aspect-[4/3] overflow-hidden bg-stone-100" role="img" aria-label={artwork.title}
        style={{ backgroundImage: `url("${artwork.image}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
    : <div className="grid aspect-[4/3] place-items-center bg-stone-100 text-sm text-stone-500">No image added</div>;
}

export default function GalleryWorkspace() {
  const [draft, setDraft] = useState<GalleryDraft>(emptyGallery);
  const [loaded, setLoaded] = useState(false);
  const [preserveStoredDraft, setPreserveStoredDraft] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedView = searchParams.get("view");
  const section: Section = sections.some((item) => item.id === selectedView) ? selectedView as Section : "collection";
  const setSection = (next: Section) => router.push(`/art-gallery?view=${next}`, { scroll: false });
  const [editing, setEditing] = useState<Artwork | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [websiteForm, setWebsiteForm] = useState(draft.website);
  const backupInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GALLERY_DRAFT_KEY);
      if (raw) {
        const restored = parseGalleryBackup(raw);
        setDraft(restored);
        setWebsiteForm(restored.website);
      }
    } catch {
      setPreserveStoredDraft(true);
      setError("The existing browser draft could not be loaded. It has not been overwritten. Restore a backup or export any open work before saving.");
    }
    setLoaded(true);
  }, []);

  function commit(next: GalleryDraft, message: string, replaceUnreadable = false) {
    try {
      const checked = normalizeGallery(next);
      // Retain the user's work in memory even if browser storage is unavailable.
      setDraft(checked);
      setError("");
      if (preserveStoredDraft && !replaceUnreadable) {
        setNotice("");
        setError("Changes are open but not saved over the unreadable browser draft. Export this new work; restore a backup explicitly to replace the stored draft.");
        return true;
      }
      try {
        saveGalleryDraft(localStorage, checked);
        setPreserveStoredDraft(false);
        setNotice(message);
      } catch {
        setNotice("");
        setError("Your changes are open but not saved. Browser storage is unavailable or full. Export a backup before leaving.");
      }
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the gallery details.");
      return false;
    }
  }

  function saveArtwork(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    try {
      const artwork = normalizeArtwork(editing);
      const exists = draft.artworks.some((item) => item.id === artwork.id);
      const artworks = exists
        ? draft.artworks.map((item) => item.id === artwork.id ? artwork : item)
        : [...draft.artworks, artwork];
      if (commit({ ...draft, artworks }, "Artwork saved in this browser. Not published.")) setEditing(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the artwork details.");
    }
  }

  async function uploadImage(file?: File) {
    if (!file || !editing) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setError("Choose a PNG, JPEG or WebP image smaller than 1 MB. SVG and remote image links are not accepted.");
      return;
    }
    const artworkId = editing.id;
    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : "";
      setEditing((current) => current?.id === artworkId ? { ...current, image } : current);
      setError("");
    };
    reader.onerror = () => setError("The image could not be read. Your artwork details are still open.");
    reader.readAsDataURL(file);
  }

  function exportBackup() {
    try {
      const blob = new Blob([serializeGallery(draft)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `maya-gallery-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Backup download requested. Check your browser downloads; it includes saved artwork images.");
    } catch { setError("Backup could not be created. Keep this page open and try again."); }
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a gallery JSON backup smaller than 3 MB.");
      const restored = parseGalleryBackup(await file.text());
      if (!window.confirm("Replace this browser's gallery draft with the selected backup? Export your current work first if you need it.")) return;
      if (commit(restored, "Backup restored in this browser. Not published.", true)) {
        setWebsiteForm(restored.website);
        setEditing(null);
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Backup could not be restored."); }
    finally { if (backupInput.current) backupInput.current.value = ""; }
  }

  const artworks = draft.artworks.filter((item) => `${item.title} ${item.artist}`.toLowerCase().includes(search.toLowerCase()));
  const publicSelection = draft.artworks.filter((item) => item.onWebsite);
  const previewDark = draft.website.theme === "ink";

  return (
    <section className="min-h-full overflow-hidden rounded-2xl border border-stone-300 bg-[#faf9f6] text-stone-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-5 py-5 md:px-8">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">Maya / Gallery workspace</p>
          <h1 className="mt-1 font-serif text-3xl">{draft.website.name || "Your gallery"}</h1></div>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">Private draft · Not published</span>
      </header>
      <div className="border-b border-amber-200 bg-amber-50/70 px-5 py-3 text-xs leading-relaxed text-amber-950 md:px-8">
        Saved only in this browser, not synced or account-isolated. Use artwork drafts only—no client-confidential data.
        Cloud files/blob memory, client-vault controls and publishing must be verified before beta release.
      </div>
      <div className="grid min-h-[65vh] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-stone-200 bg-[#f1eee7] p-4 lg:border-b-0 lg:border-r">
          <nav aria-label="Gallery controls" className="flex flex-wrap gap-1 lg:flex-col">
            {sections.map((item) => <button key={item.id} type="button" onClick={() => { setSection(item.id); setNotice(""); }}
              aria-current={section === item.id ? "page" : undefined}
              className={`rounded-lg px-3 py-3 text-left text-sm ${section === item.id ? "bg-white font-semibold shadow-sm" : "text-stone-600 hover:bg-white/60"}`}>{item.label}</button>)}
          </nav>
          <div className="mt-5 space-y-2 border-t border-stone-300 pt-4">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-stone-500">Keep your work</p>
            <button type="button" className={`${buttonStyle} w-full`} disabled={!loaded} onClick={exportBackup}>Export backup</button>
            <button type="button" className={`${buttonStyle} w-full`} disabled={!loaded} onClick={() => backupInput.current?.click()}>Restore backup</button>
            <input ref={backupInput} className="hidden" type="file" accept=".json,application/json" aria-label="Gallery backup file" onChange={(event) => void importBackup(event.target.files?.[0])} />
            <p className="pt-2 text-xs leading-relaxed text-stone-500">One workspace for your collection and website. Publishing stays separate from editing.</p>
          </div>
        </aside>
        <div className="min-w-0 p-5 md:p-8">
          {error && <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          {notice && <p role="status" className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
          {!loaded ? <p>Loading your browser draft…</p> : <>
            {section === "collection" && <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-serif text-2xl">Collection</h2><p className="mt-1 text-sm text-stone-500">{draft.artworks.length} artworks · {publicSelection.length} selected for website preview</p></div>
                <button type="button" className="rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-700" onClick={() => { setEditing(newArtwork()); setError(""); }}>Add artwork</button>
              </div>
              {editing && <form onSubmit={saveArtwork} className="mb-8 rounded-xl border border-stone-300 bg-white p-5">
                <h3 className="mb-4 font-serif text-xl">{draft.artworks.some((item) => item.id === editing.id) ? "Edit artwork" : "New artwork"}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    ["title", "Artwork title", 140], ["artist", "Artist", 120], ["medium", "Medium", 120],
                    ["dimensions", "Dimensions", 80], ["year", "Year", 4], ["price", "Price display", 100],
                  ] as const).map(([field, label, limit]) => <label key={field} className="text-sm font-medium">{label}
                    <input className={inputStyle} value={editing[field]} maxLength={limit} required={field === "title"}
                      placeholder={field === "price" ? "e.g. USD 1,200 or Price on request" : undefined}
                      onChange={(event) => setEditing({ ...editing, [field]: event.target.value })} /></label>)}
                  <label className="text-sm font-medium">Availability<select className={inputStyle} value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as Artwork["status"] })}>
                    <option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option>
                  </select></label>
                  <label className="text-sm font-medium">Artwork image<input className={`${inputStyle} text-xs`} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadImage(event.target.files?.[0])} />
                    <span className="mt-1 block text-xs font-normal text-stone-500">PNG, JPEG or WebP · under 1 MB</span></label>
                </div>
                {editing.image && <div className="mt-4 max-w-xs"><ArtworkImage artwork={editing} /></div>}
                <label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.onWebsite} onChange={(event) => setEditing({ ...editing, onWebsite: event.target.checked })} />Show in website preview (does not publish)</label>
                <div className="mt-5 flex gap-2"><button className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm text-white" type="submit">Save artwork</button>
                  <button className={buttonStyle} type="button" onClick={() => { setEditing(null); setError(""); }}>Cancel</button></div>
              </form>}
              {draft.artworks.length > 0 && <label className="mb-5 block max-w-sm text-sm">Search collection<input type="search" className={inputStyle} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title or artist" /></label>}
              {!draft.artworks.length ? <div className="rounded-xl border border-dashed border-stone-300 px-5 py-16 text-center">
                <h3 className="font-serif text-xl">Start with your first artwork</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">Add its image, details and availability. You choose which works appear in the website preview.</p>
              </div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{artworks.map((artwork) => <article key={artwork.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <ArtworkImage artwork={artwork} /><div className="p-4"><p className="text-[10px] uppercase tracking-wider text-stone-500">{artwork.status} · {artwork.onWebsite ? "In website preview" : "Collection only"}</p>
                  <h3 className="mt-1 font-serif text-xl">{artwork.title}</h3><p className="mt-1 text-sm text-stone-600">{artwork.artist}</p>
                  <p className="mt-2 text-xs text-stone-500">{[artwork.medium, artwork.dimensions, artwork.year].filter(Boolean).join(" · ")}</p>
                  <p className="mt-3 text-sm">{artwork.price || "Price on request"}</p>
                  <button type="button" className={`${buttonStyle} mt-4 w-full`} aria-label={`Edit ${artwork.title}`} onClick={() => { setEditing({ ...artwork }); setError(""); }}>Edit artwork</button></div>
              </article>)}</div>}
              {draft.artworks.length > 0 && !artworks.length && <p className="text-sm text-stone-500">No artworks match this search.</p>}
            </>}
            {section === "website" && <>
              <h2 className="font-serif text-2xl">Your website, managed here</h2><p className="mt-2 text-sm text-stone-500">Customize the gallery identity and preview your changes. Saving never publishes.</p>
              <form className="mt-6 max-w-xl space-y-5" onSubmit={(event) => { event.preventDefault(); if (commit({ ...draft, website: websiteForm }, "Website draft saved in this browser. Not published.")) setWebsiteForm(normalizeGallery({ ...draft, website: websiteForm }).website); }}>
                <label className="block text-sm font-medium">Gallery name<input className={inputStyle} maxLength={100} value={websiteForm.name} onChange={(event) => setWebsiteForm({ ...websiteForm, name: event.target.value })} /></label>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={websiteForm.showLogo} onChange={(event) => setWebsiteForm({ ...websiteForm, showLogo: event.target.checked })} />Show Freebird Gallery logo</label>
                <label className="block text-sm font-medium">Website headline<input className={inputStyle} maxLength={180} value={websiteForm.headline} onChange={(event) => setWebsiteForm({ ...websiteForm, headline: event.target.value })} /></label>
                <label className="block text-sm font-medium">About your gallery<textarea className={inputStyle} rows={5} maxLength={3000} value={websiteForm.about} onChange={(event) => setWebsiteForm({ ...websiteForm, about: event.target.value })} /></label>
                <label className="block text-sm font-medium">Public contact email<input className={inputStyle} type="email" maxLength={254} value={websiteForm.email} onChange={(event) => setWebsiteForm({ ...websiteForm, email: event.target.value })} /></label>
                <label className="block text-sm font-medium">Website theme<select className={inputStyle} value={websiteForm.theme} onChange={(event) => setWebsiteForm({ ...websiteForm, theme: event.target.value as "ivory" | "ink" })}><option value="ivory">Ivory · light</option><option value="ink">Ink · dark</option></select></label>
                <div className="flex flex-wrap gap-2"><button type="submit" className="rounded-lg bg-stone-900 px-4 py-3 text-sm text-white">Save website draft</button>
                  <button type="button" className={buttonStyle} onClick={() => setSection("preview")}>Preview saved website</button></div>
              </form>
            </>}
            {section === "preview" && <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-2xl">Website preview</h2><span className="text-xs text-stone-500">Private preview · no public URL created</span></div>
              <div className={`min-h-[420px] rounded-xl border p-5 md:p-8 ${previewDark ? "border-stone-700 bg-stone-900 text-stone-100" : "border-stone-200 bg-white text-stone-900"}`}>
                <p className="text-xs uppercase tracking-[0.22em] opacity-60">{draft.website.name || "Your gallery"}</p>
                {draft.website.showLogo && <div role="img" aria-label="Freebird Gallery logo" className="mt-8 h-64 w-48 rounded bg-white bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url(/brand/freebird-gallery.png)" }} />}
                <h3 className="mt-8 max-w-2xl font-serif text-3xl leading-tight md:text-4xl">{draft.website.headline || "A collection, thoughtfully presented."}</h3>
                {draft.website.about && <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed opacity-75">{draft.website.about}</p>}
                <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{publicSelection.map((artwork) => <article key={artwork.id}><ArtworkImage artwork={artwork} /><h4 className="mt-3 font-serif text-xl">{artwork.title}</h4><p className="mt-1 text-sm opacity-70">{[artwork.artist, artwork.year].filter(Boolean).join(" · ")}</p><p className="mt-2 text-xs uppercase tracking-wider opacity-70">{artwork.status}</p>{artwork.status !== "sold" && <p className="mt-2 text-sm">{artwork.price || "Price on request"}</p>}</article>)}</div>
                {!publicSelection.length && <p className="mt-10 text-sm opacity-60">Select artworks in Collection to include them in this preview.</p>}
                {draft.website.email && <a className="mt-10 inline-block border-b border-current pb-1 text-sm" href={`mailto:${encodeURIComponent(draft.website.email)}`}>Contact the gallery</a>}
              </div>
            </>}
            {section === "assistant" && <AgentWorkspace name="Mimi" title="Art Gallery Sales Manager" mission="Manage collector inquiries, artwork availability, sales follow-up, exhibitions, and gallery relationships while leaving artistic decisions with the artist." placeholder="Ask Mimi about collectors, availability, follow-up, exhibitions, or gallery sales..." />}
          </>}
        </div>
      </div>
    </section>
  );
}
