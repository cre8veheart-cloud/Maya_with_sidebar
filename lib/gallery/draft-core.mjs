export const GALLERY_DRAFT_KEY = "maya_gallery_website_draft_v1";
export const MAX_IMAGE_BYTES = 1_000_000;
export const MAX_BACKUP_BYTES = 3_000_000;

/** @returns {import("./types").GalleryDraft} */
export function emptyGallery() {
  return {
    version: 1,
    website: { name: "Freebird Gallery", headline: "", about: "", email: "", theme: "ivory", showLogo: true },
    artworks: [],
  };
}

function text(value, max, field, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    throw new Error(`Check ${field}.`);
  }
  return value.trim();
}

/** @returns {import("./types").Artwork} */
export function normalizeArtwork(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Check the artwork.");
  const id = text(input.id, 80, "artwork ID", true);
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("Check the artwork ID.");
  const title = text(input.title, 140, "artwork title", true);
  const artist = text(input.artist, 120, "artist");
  const medium = text(input.medium, 120, "medium");
  const dimensions = text(input.dimensions, 80, "dimensions");
  const year = text(input.year, 4, "year");
  if (year && !/^(1[4-9]\d{2}|20\d{2}|2100)$/.test(year)) throw new Error("Use a year from 1400 to 2100.");
  const price = text(input.price, 100, "price");
  if (!["available", "reserved", "sold"].includes(input.status)) throw new Error("Check availability.");
  const image = text(input.image, 1_400_000, "image size");
  if (image && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image)) {
    throw new Error("Use an uploaded PNG, JPEG or WebP image, not a link or SVG.");
  }
  if (typeof input.onWebsite !== "boolean") throw new Error("Check website selection.");
  return { id, title, artist, medium, dimensions, year, price, status: input.status, image, onWebsite: input.onWebsite };
}

/** Validate and copy known fields only; never trust imported objects or stored browser data.
 * @returns {import("./types").GalleryDraft}
 */
export function normalizeGallery(input) {
  if (!input || input.version !== 1 || !input.website || !Array.isArray(input.artworks)) {
    throw new Error("This is not a supported Maya gallery backup.");
  }
  const website = {
    name: text(input.website.name, 100, "gallery name"),
    headline: text(input.website.headline, 180, "website headline"),
    about: text(input.website.about, 3000, "gallery description"),
    email: text(input.website.email, 254, "contact email"),
    theme: input.website.theme,
    showLogo: input.website.showLogo ?? true,
  };
  if (website.email && !/^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+\.[^\s@<>"\r\n]+$/.test(website.email)) {
    throw new Error("Check the contact email.");
  }
  if (!["ivory", "ink"].includes(website.theme)) throw new Error("Choose a supported website theme.");
  if (typeof website.showLogo !== "boolean") throw new Error("Check gallery logo visibility.");
  if (input.artworks.length > 100) throw new Error("This draft supports up to 100 artworks.");
  const artworks = input.artworks.map(normalizeArtwork);
  if (new Set(artworks.map((artwork) => artwork.id)).size !== artworks.length) {
    throw new Error("Artwork IDs must be unique.");
  }
  const draft = { version: 1, website, artworks };
  if (new TextEncoder().encode(JSON.stringify(draft)).byteLength > MAX_BACKUP_BYTES) throw new Error("Draft too large. Reduce image sizes before saving this change.");
  return draft;
}

export function parseGalleryBackup(raw) {
  if (typeof raw !== "string" || raw.length > MAX_BACKUP_BYTES || new TextEncoder().encode(raw).byteLength > MAX_BACKUP_BYTES) throw new Error("Gallery backup is too large.");
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error("Choose a valid JSON gallery backup."); }
  return normalizeGallery(parsed);
}

export function serializeGallery(draft) {
  return JSON.stringify(normalizeGallery(draft));
}

/** Local-only boundary: callers must not mistake this for tenant authentication or cloud storage. */
export function saveGalleryDraft(storage, draft) {
  const normalized = normalizeGallery(draft);
  try { storage.setItem(GALLERY_DRAFT_KEY, JSON.stringify(normalized)); }
  catch { throw new Error("Browser storage is unavailable or full. Your changes remain open; export a backup now."); }
  return normalized;
}
