/**
 * Admin API: upload and delete images via Cloudinary.
 */

import { NextResponse } from 'next/server';
import imageHosting from '@/image-hosting/imageHosting.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

async function uploadImage(formData) {
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

async function deleteImage(formData) {
  const imageUrl = formData.get('imageUrl');
  if (!imageUrl) {
    throw new Error('Missing imageUrl');
  }
  await imageHosting.deleteImage(imageUrl);
  return { success: true };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const result = await uploadImage(formData);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed', details: err.message },
      { status: err.message?.includes('Missing') || err.message?.includes('Invalid') ? 400 : 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const formData = await request.formData();
    const result = await deleteImage(formData);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json(
      { error: 'Delete failed', details: err.message },
      { status: err.message?.includes('Missing') ? 400 : 500 }
    );
  }
}
