/**
 * Admin-only HTTP bridge for image upload/delete.
 * Logic lives in admin/api/upload-image/route.js
 */

import { NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@admin-root/api/upload-image/route';

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
