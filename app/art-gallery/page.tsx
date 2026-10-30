import GalleryWorkspace from "@/components/GalleryWorkspace";
import { Suspense } from "react";

export default function ArtGalleryPage() {
  return <Suspense fallback={<p className="p-6 text-stone-200">Loading gallery workspace…</p>}><GalleryWorkspace /></Suspense>;
}
