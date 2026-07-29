/**
 * Cloudinary URLs for module card images (M1–M7).
 * Uploaded via /api/admin/upload-image.
 */
const CLOUDINARY_BASE = "https://res.cloudinary.com/du6yiw4it/image/upload";

export const FAVICON_URLS = {
  1: `${CLOUDINARY_BASE}/v1772424041/M1.png`,
  2: `${CLOUDINARY_BASE}/v1772424041/M2.png`,
  3: `${CLOUDINARY_BASE}/v1772424042/M3.png`,
  4: `${CLOUDINARY_BASE}/v1772424043/M4.png`,
  5: `${CLOUDINARY_BASE}/v1772424044/M5.png`,
  6: `${CLOUDINARY_BASE}/v1772424044/M6.png`,
  7: `${CLOUDINARY_BASE}/v1772424045/M7.png`,
};

export function getFaviconUrl(moduleId) {
  return FAVICON_URLS[moduleId] ?? `${CLOUDINARY_BASE}/v1772424045/M7.png`;
}

/** Default favicon URL for new modules when user doesn't pick a different one (first in list). */
export function getDefaultFaviconUrl() {
  const firstId = Object.keys(FAVICON_URLS)[0];
  return FAVICON_URLS[firstId];
}

/** Get favicon id (string) from a favicon URL, or null if no match */
export function getFaviconIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const entry = Object.entries(FAVICON_URLS).find(([, u]) => u === url);
  return entry ? entry[0] : null;
}
