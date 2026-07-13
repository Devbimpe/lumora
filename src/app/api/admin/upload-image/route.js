/**
 * Admin API: upload and delete images via Cloudinary.
 */

import { NextResponse } from 'next/server';
import imageHosting from '@/image-hosting/imageHosting.js';
import {
  badRequestError,
  defineAdminRoute,
  internalServerError,
} from '@/app/_lib/route';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const URL_FETCH_TIMEOUT_MS = 15000;

/**
 * Check that a URL is reachable and returns an image (2xx + image content-type).
 * @param {string} url - The URL to validate.
 * @returns {Promise<{ reachable: boolean, message?: string }>} - A promise resolving to the validation result.
 */
async function validateImageURL(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);
  try {
    // Prefer HEAD to avoid downloading the body; some servers don't support HEAD
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Lumora-ImageUpload/1.0' },
    });

    // If HEAD is not allowed, try GET
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Lumora-ImageUpload/1.0' },
      });
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { reachable: false, message: res.status === 404 ? 'Resource not found' : `URL returned ${res.status}` };
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const isImage = /^image\//.test(contentType);
    const isOctetStream = contentType.includes('octet-stream');
    if (contentType && !isImage && !isOctetStream) {
      return { reachable: false, message: 'URL does not point to an image' };
    }

    return { reachable: true };

  } catch (e) {
    clearTimeout(timeoutId);

    if (e.name === 'AbortError') {
      return { reachable: false, message: 'Request timed out' };
    }

    const msg = e.cause?.code === 'ENOTFOUND' ? 'Host not found' : (e.message || 'URL not reachable');
    return { reachable: false, message: msg };
  }
}



/**
 * Handles POST requests to upload an image. It supports both file uploads (as multipart/form-data) and URL uploads (as a string in the 'file' field).
 * @param {Request} request 
 * @returns {NextResponse} URL of the uploaded image or an error message if the upload fails.
 */
export const POST = defineAdminRoute(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('Missing file');
    }


    if (typeof file === 'string') {

      if (!file.match("^https?:\/\/")) {
        throw new Error('Invalid URL format');
      }
      
      // Validate URL is reachable before sending to Cloudinary (avoids opaque errors)
      const urlOk = await validateImageURL(file);

      if (!urlOk.reachable) {
        throw new Error(urlOk.message || 'Resource not found');
      }

      return NextResponse.json(await imageHosting.autoUploadImage(file, null));
    }


    if(!(file instanceof Buffer)) {

      const buffer = Buffer.from(await file.arrayBuffer());

      if (buffer.length > MAX_SIZE) {
        throw new Error('File too large (max 5 MB)');
      }
      const mimeType = file.type || 'application/octet-stream';
      if (!ALLOWED_TYPES.includes(mimeType)) {
        throw new Error('Invalid file type. Allowed: jpeg, png, gif, webp, bmp');
      }

      const filename = file.name || `upload-${Date.now()}.${mimeType.split('/')[1] || 'bin'}`;
      return NextResponse.json(await imageHosting.autoUploadImage(buffer, filename));
    }

  } catch (err) {
    console.error('Upload error:', err);
    const isBadRequest =
      /Missing|Invalid|Resource not found|URL (returned|not reachable|does not point)|timed out|Host not found/.test(err.message);
    return NextResponse.json(
      { error: `Upload failed: ${err.message}` },
      { status: isBadRequest ? 400 : 500 }
    );
  }
});



/**
 * Deletes an image from Cloudinary given its URL. It supports receiving the image URL either as a query parameter (e.g., ?imageUrl=...) or in the form body (as multipart/form-data). 
 * This will permanently delete the image from Cloudinary, so use with caution.
 * @param {Request} request 
 * @returns {NextResponse} success message or error details if deletion fails.
 */
export const DELETE = defineAdminRoute(async (request) => {
  try {
    // Support imageUrl in query string (simple curl) or in form body
    let imageUrl = request.nextUrl.searchParams.get('imageUrl');
    if (!imageUrl) {
      try {
        const formData = await request.formData();
        imageUrl = formData.get('imageUrl');
      } catch {
        // formData() throws if Content-Type isn't form-related; ignore
      }
    }
    if (!imageUrl) {
      throw new Error('Missing imageUrl');
    }
    await imageHosting.deleteImage(imageUrl);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json(
      { error: `Delete failed: ${err.message}` },
      { status: err.message?.includes('Missing') ? 400 : 500 }
    );
  }
});
