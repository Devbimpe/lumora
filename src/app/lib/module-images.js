/**
 * Cloudinary URLs for module card images (M1–M7).
 * Uploaded via /api/upload-image.
 */
const CLOUDINARY_BASE = "http://res.cloudinary.com/du6yiw4it/image/upload";

export const MODULE_IMAGE_URLS = {
  1: `${CLOUDINARY_BASE}/v1772424041/M1.png`,
  2: `${CLOUDINARY_BASE}/v1772424041/M2.png`,
  3: `${CLOUDINARY_BASE}/v1772424042/M3.png`,
  4: `${CLOUDINARY_BASE}/v1772424043/M4.png`,
  5: `${CLOUDINARY_BASE}/v1772424044/M5.png`,
  6: `${CLOUDINARY_BASE}/v1772424044/M6.png`,
  7: `${CLOUDINARY_BASE}/v1772424045/M7.png`,
};

export function getModuleImageUrl(moduleId) {
  return MODULE_IMAGE_URLS[moduleId] ?? `${CLOUDINARY_BASE}/v1772424045/M7.png`;
}
