import Link from "next/link";
import AdobeFontLibrary from "@/components/AdobeFontLibrary";
import PageLayoutStudio from "@/components/PageLayoutStudio";

const adobeTools = ["Photoshop", "Illustrator", "InDesign", "Acrobat Pro", "Premiere Pro", "After Effects"];
const roomTools = [
  { name: "Adobe Creative Cloud", href: "/adobe", note: "Creative production, assets, PDF and Adobe workflows" },
  { name: "PowerPoint", href: "https://www.microsoft365.com/launch/powerpoint", note: "Open, build and present client decks" },
  { name: "Microsoft Teams", href: "https://teams.microsoft.com/", note: "Meetings, calls and collaboration" },
  { name: "OneDrive", href: "https://onedrive.live.com/", note: "Microsoft 365 presentation and meeting files" },
];

export default function WhiteBoardroom() {
  const adobeFontsProjectId = (process.env.NEXT_PUBLIC_ADOBE_FONTS_PROJECT_ID || "")
    .replace(/[^a-z0-9]/gi, "");

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#171717]">
      {adobeFontsProjectId && (
        <link
          rel="stylesheet"
          href={`https://use.typekit.net/${adobeFontsProjectId}.css`}
        />
      )}
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50">MAYA · Collaboration</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">White Boardroom</h1>
            <p className="mt-2 max-w-3xl text-sm text-black/60">One production room for client meetings, presentations, campaign work, creative production and MAYA executive collaboration.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/adobe" className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium">Adobe Studio</Link>
            <a href="https://teams.microsoft.com/" target="_blank" rel="noreferrer" className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Start meeting ↗</a>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-2xl border border-black/10 bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs uppercase tracking-[0.18em] text-black/40">Live work surface</p><h2 className="mt-1 text-xl font-semibold">Campaign + Presentation Board</h2></div>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/60">MAYA workspace</span>
            </div>
            <div className="mt-5 grid min-h-72 place-items-center rounded-xl border border-dashed border-black/20 bg-[#fbfbf9] p-6 text-center">
              <div><p className="text-lg font-medium">Whiteboard workspace</p><p className="mx-auto mt-2 max-w-lg text-sm text-black/50">Stage campaign concepts, meeting notes, presentation material and client decisions here. Persistent collaborative canvas and live session transport are the next service wiring gates.</p></div>
            </div>
          </div>

          <aside className="rounded-2xl border border-black/10 bg-[#171717] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Room controls</p>
            <div className="mt-4 grid gap-2">
              <a href="https://teams.microsoft.com/" target="_blank" rel="noreferrer" className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black">Microsoft Teams · Meet ↗</a>
              <a href="https://www.microsoft365.com/launch/powerpoint" target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-4 py-3 text-sm">PowerPoint · Present ↗</a>
              <Link href="/adobe" className="rounded-lg border border-white/15 px-4 py-3 text-sm">Adobe Creative Cloud · Create →</Link>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">MAYA session</p>
              <p className="mt-2 text-sm text-white/70">Client context, executive participation, recommendations and session memory are reserved for authenticated MAYA persistence wiring.</p>
            </div>
          </aside>
        </section>

        <section className="mt-4">
          <PageLayoutStudio />
        </section>

        <section className="mt-4">
          <AdobeFontLibrary connected={Boolean(adobeFontsProjectId)} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roomTools.map((tool) => tool.href.startsWith("/") ? (
            <Link key={tool.name} href={tool.href} className="rounded-xl border border-black/10 bg-white p-5"><h3 className="font-semibold">{tool.name}</h3><p className="mt-2 text-sm text-black/55">{tool.note}</p><p className="mt-4 text-xs font-semibold">Open →</p></Link>
          ) : (
            <a key={tool.name} href={tool.href} target="_blank" rel="noreferrer" className="rounded-xl border border-black/10 bg-white p-5"><h3 className="font-semibold">{tool.name}</h3><p className="mt-2 text-sm text-black/55">{tool.note}</p><p className="mt-4 text-xs font-semibold">Open ↗</p></a>
          ))}
        </section>

        <section className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-black/40">Adobe production lane</p><h2 className="mt-1 text-lg font-semibold">Creative Cloud tools</h2></div><Link href="/adobe" className="text-sm font-semibold">Open Adobe Studio →</Link></div>
          <div className="mt-4 flex flex-wrap gap-2">{adobeTools.map((tool) => <span key={tool} className="rounded-full border border-black/10 bg-[#f7f7f4] px-3 py-2 text-sm">{tool}</span>)}</div>
          <p className="mt-4 text-xs text-black/50">Adobe Express embedded editing and authenticated Adobe APIs require Adobe developer credentials/approval. The room is structured for that integration without storing credentials in the client page.</p>
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"><Link href="/" className="font-medium">← Back to MAYA</Link><span className="text-black/40">White Boardroom · production workspace</span></footer>
      </div>
    </main>
  );
}
