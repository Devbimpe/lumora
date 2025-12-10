import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint to get available pages for a module
 * Scans the public/img folder for images matching mod{moduleId}p{pageNumber}.{ext}
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId');
    
    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }
    
    const moduleNum = moduleId.replace('module', '');
    const imgDir = path.join(process.cwd(), 'public', 'img');
    
    // Check if directory exists
    if (!fs.existsSync(imgDir)) {
      return NextResponse.json({ pages: [] });
    }
    
    // Read all files in the img directory
    const files = fs.readdirSync(imgDir);
    
    // Filter files matching the pattern mod{moduleNum}p{pageNumber}.{ext}
    const pattern = new RegExp(`^mod${moduleNum}p(\\d+)\\.(jpg|jpeg|png)$`, 'i');
    const pages = [];
    
    files.forEach(file => {
      const match = file.match(pattern);
      if (match) {
        const pageNumber = parseInt(match[1]);
        const extension = match[2].toLowerCase();
        pages.push({
          pageNumber,
          imagePath: `/img/${file}`,
          extension
        });
      }
    });
    
    // Sort by page number
    pages.sort((a, b) => a.pageNumber - b.pageNumber);
    
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error scanning module pages:', error);
    return NextResponse.json({ error: 'Failed to scan module pages' }, { status: 500 });
  }
}

