import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyGallery, GALLERY_DRAFT_KEY, MAX_BACKUP_BYTES, normalizeArtwork,
  normalizeGallery, parseGalleryBackup, saveGalleryDraft, serializeGallery,
} from "../lib/gallery/draft-core.mjs";

const artwork = (overrides = {}) => ({
  id: "art-test-1", title: "Study", artist: "Test artist", medium: "Oil",
  dimensions: "20 × 30 cm", year: "2026", price: "USD 250",
  status: "available", image: "", onWebsite: false, ...overrides,
});
const gallery = () => ({ ...emptyGallery(), artworks: [artwork()] });

test("new work is empty and collection-only, with no fabricated art or public selection", () => {
  assert.deepEqual(emptyGallery().artworks, []);
  assert.equal(normalizeArtwork(artwork()).onWebsite, false);
});

test("gallery settings and artwork survive a backup roundtrip", () => {
  const draft = gallery();
  draft.website = { name: "Test gallery", headline: "New works", about: "A private collection", email: "hello@example.com", theme: "ink", showLogo: true };
  assert.deepEqual(parseGalleryBackup(serializeGallery(draft)), draft);
});

test("unknown imported properties and prototype keys are not retained", () => {
  const draft = gallery();
  draft.website.html = "<script>untrusted</script>";
  const result = parseGalleryBackup(JSON.stringify({ ...draft, credentials: "not retained", __proto__: { polluted: true } }));
  assert.equal("html" in result.website, false);
  assert.equal("credentials" in result, false);
  assert.equal(Object.prototype.polluted, undefined);
});

test("remote image URLs, SVG and HTML data are rejected", () => {
  for (const image of ["https://example.com/a.png", "javascript:alert(1)", "data:image/svg+xml;base64,PHN2Zz4=", "data:text/html;base64,WA=="]) {
    assert.throws(() => normalizeArtwork(artwork({ image })), /uploaded PNG/);
  }
  assert.equal(normalizeArtwork(artwork({ image: "data:image/png;base64,aGVsbG8=" })).image, "data:image/png;base64,aGVsbG8=");
});

test("duplicate IDs, invalid fields and oversized backups fail closed", () => {
  const draft = gallery();
  draft.artworks.push(artwork());
  assert.throws(() => normalizeGallery(draft), /unique/);
  assert.throws(() => normalizeArtwork(artwork({ title: " " })), /title/);
  assert.throws(() => normalizeArtwork(artwork({ year: "20266" })), /year/);
  assert.throws(() => normalizeArtwork(artwork({ onWebsite: "yes" })), /website selection/);
  assert.throws(() => parseGalleryBackup("x".repeat(MAX_BACKUP_BYTES + 1)), /too large/);
  assert.throws(() => parseGalleryBackup("é".repeat(MAX_BACKUP_BYTES / 2 + 1)), /too large/);
  assert.throws(() => parseGalleryBackup("{broken"), /valid JSON/);
});

test("untrusted email, theme and availability values are rejected", () => {
  for (const email of ["not an email", "a@example.com\nBcc:x@example.com"]) {
    const draft = gallery();
    draft.website.email = email;
    assert.throws(() => normalizeGallery(draft), /email/);
  }
  const draft = gallery();
  draft.website.theme = "untrusted";
  assert.throws(() => normalizeGallery(draft), /theme/);
  assert.throws(() => normalizeArtwork(artwork({ status: "public" })), /availability/);
});

test("the supplied logo is visible by default and its saved setting is validated", () => {
  assert.equal(emptyGallery().website.name, "Freebird Gallery");
  assert.equal(emptyGallery().website.showLogo, true);
  const legacy = gallery();
  delete legacy.website.showLogo;
  assert.equal(normalizeGallery(legacy).website.showLogo, true);
  legacy.website.showLogo = false;
  assert.equal(parseGalleryBackup(serializeGallery(legacy)).website.showLogo, false);
  legacy.website.showLogo = "hide";
  assert.throws(() => normalizeGallery(legacy), /logo visibility/);
});

test("a successful local save writes only the validated gallery key", () => {
  const writes = [];
  saveGalleryDraft({ setItem: (...args) => writes.push(args) }, gallery());
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], GALLERY_DRAFT_KEY);
  assert.deepEqual(parseGalleryBackup(writes[0][1]), gallery());
});

test("invalid data never reaches storage and storage failure never reports success", () => {
  let calls = 0;
  assert.throws(() => saveGalleryDraft({ setItem: () => { calls++; } }, { version: 99 }), /supported/);
  assert.equal(calls, 0);
  assert.throws(() => saveGalleryDraft({ setItem: () => { throw new Error("quota"); } }, gallery()), /export a backup/);
});
