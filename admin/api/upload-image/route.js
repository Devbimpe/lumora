/**
 * Admin API: upload and delete images via Cloudinary.
 * Used by src/app/api/admin/upload-image (HTTP bridge).
 */

import imageHosting from '@/image-hosting/imageHosting.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadImage(formData) {
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    throw new Error('Missing or invalid file');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_SIZE) {
    throw new Error('File too large (max 5 MB)');
  }
  const mimeType = file.type || 'application/octet-stream';
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Allowed: jpeg, png, gif, webp, bmp');
  }
  const filename = file.name || `upload-${Date.now()}.${mimeType.split('/')[1] || 'bin'}`;
  return await imageHosting.autoUploadImage(buffer, filename);
}

export async function deleteImage(formData) {
  const imageUrl = formData.get('imageUrl');
  if (!imageUrl) {
    throw new Error('Missing imageUrl');
  }
  await imageHosting.deleteImage(imageUrl);
  return { success: true };
}
