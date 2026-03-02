/**
 * API endpoint to upload an image via image hosting (Cloudinary).
 * Expects form data with a file field.
 * Returns the file ID and URL.
 */

import { NextResponse } from 'next/server';
import imageHosting from '@/image-hosting/imageHosting.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Missing or invalid file' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
    }
    const mimeType = file.type || 'application/octet-stream';
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpeg, png, gif, webp, bmp' }, { status: 400 });
    }
    const filename = file.name || `upload-${Date.now()}.${mimeType.split('/')[1] || 'bin'}`;

    const { id, url } = await imageHosting.autoUploadImage(buffer, filename);
    return NextResponse.json({ id, url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed', details: err.message },
      { status: 500 }
    );
  }
}
