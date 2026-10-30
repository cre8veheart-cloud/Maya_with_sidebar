import Link from "next/link";

const creativeApps = [
  { name: "Photoshop", use: "Raster art, campaign images, retouching", url: "https://photoshop.adobe.com/" },
  { name: "Illustrator", use: "Vector art, logos, identity and production graphics", url: "https://www.adobe.com/products/illustrator.html" },
  { name: "InDesign", use: "Editorial, presentation and print-layout production", url: "https://www.adobe.com/products/indesign.html" },
  { name: "Acrobat Pro", use: "PDF review, proofing and delivery", url: "https://acrobat.adobe.com/" },
  { name: "Premiere Pro", use: "Campaign and presentation video", url: "https://www.adobe.com/products/premiere.html" },
  { name: "After Effects", use: "Motion graphics and experiential projection assets", url: "https://www.adobe.com/products/aftereffects.html" },
];

const productionChecks = ["CMYK document mode", "Pantone / spot-color specification", "Bleed + trim", "Linked assets", "Fonts + licensing", "PDF proof", "Final production package"];
const adobeAuthorizeLinks = [
  {
    label: "Authorize Adobe account",
    href: "https://account.adobe.com/",
  },
  {
    label: "Open Adobe Developer Console",
    href: "https://developer.adobe.com/console",
  },
  {
    label: "Manage Adobe Fonts web projects",
    href: "https://fonts.adobe.com/my_fonts",
  },
];

export default function AdobeProductionHub() {
  return (
    <main className="min-h-screen bg-[#11111b] text-[#cdd6f4] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.22em] text-[#89b4fa]">MAYA · Production</p><h1 className="mt-2 text-3xl font-semibold">Adobe Creative Studio</h1><p className="mt-2 max-w-2xl text-sm text-[#a6adc8]">Launch production tools, manage brand assets, and prepare client-ready creative work from one MAYA workspace.</p></div>
          <a href="https://creativecloud.adobe.com/" target="_blank" rel="noreferrer" className="rounded-lg bg-[#89b4fa] px-4 py-2 text-sm font-semibold text-[#11111b]">Open Creative Cloud</a>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {creativeApps.map((app) => <a key={app.name} href={app.url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-5 hover:border-[#89b4fa]"><h2 className="font-semibold text-white">{app.name}</h2><p className="mt-2 text-sm text-[#a6adc8]">{app.use}</p><p className="mt-4 text-xs text-[#89b4fa]">Launch ↗</p></a>)}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-5">
            <h2 className="font-semibold text-white">Brand + Creative Cloud Libraries</h2>
            <p className="mt-2 text-sm text-[#a6adc8]">Reserved for authenticated MAYA access to approved logos, colors, graphics and reusable brand assets.</p>
            <div className="mt-4 rounded-lg border border-dashed border-[#45475a] p-4 text-sm text-[#f9e2af]">
              <p>Connector status: requires Adobe developer authorization. No credentials are stored in this page.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {adobeAuthorizeLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#89b4fa]/40 px-4 py-2 text-sm font-semibold text-[#89b4fa] hover:border-[#89b4fa] hover:bg-[#89b4fa]/10"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#313244] bg-[#1e1e2e] p-5"><h2 className="font-semibold text-white">Print Production Gate</h2><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{productionChecks.map((item) => <div key={item} className="rounded-lg bg-[#181825] px-3 py-2 text-sm">○ {item}</div>)}</div></div>
        </section>

        <section className="mt-6 rounded-xl border border-[#313244] bg-[#1e1e2e] p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-white">Adobe Connect · White Boardroom</h2><p className="mt-1 text-sm text-[#a6adc8]">Meeting and collaboration integration lane for MAYA. Keep meeting services separate from Creative Cloud production.</p></div><a href="https://helpx.adobe.com/adobe-connect/using/use-connect-mobile-app-meeting.html" target="_blank" rel="noreferrer" className="rounded-lg border border-[#45475a] px-4 py-2 text-sm hover:border-[#89b4fa]">Connect guide ↗</a></div></section>

        <div className="mt-8"><Link href="/" className="text-sm text-[#89b4fa]">← Back to MAYA</Link></div>
      </div>
    </main>
  );
}
