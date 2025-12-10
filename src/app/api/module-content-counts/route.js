import { NextResponse } from 'next/server';
import { getAllModules, getKnowledgeChecksByModuleId } from '@db/db.js';
import fs from 'fs';
import path from 'path';

// GET: Get content counts for all modules or specific modules
// Now counts pages + knowledge checks
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleIds = url.searchParams.get('moduleIds'); // Comma-separated list

    let modulesToProcess = [];
    
    if (moduleIds) {
      // Get counts for specific modules
      const ids = moduleIds.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      modulesToProcess = ids;
    } else {
      // Get counts for all modules
      const allModules = await getAllModules();
      modulesToProcess = allModules.map(m => m.moduleId);
    }

    const counts = {};
    const imgDir = path.join(process.cwd(), 'public', 'img');

    // Process all modules in parallel
    await Promise.all(
      modulesToProcess.map(async (moduleId) => {
        try {
          // Count pages by scanning public/img directory
          let pageCount = 0;
          try {
            if (fs.existsSync(imgDir)) {
              const files = fs.readdirSync(imgDir);
              const moduleNum = String(moduleId);
              const pattern = new RegExp(`^mod${moduleNum}p(\\d+)\\.(jpg|jpeg|png)$`, 'i');
              const pageNumbers = new Set();
              
              files.forEach(file => {
                const match = file.match(pattern);
                if (match) {
                  pageNumbers.add(parseInt(match[1]));
                }
              });
              
              pageCount = pageNumbers.size;
            }
          } catch (fsError) {
            console.warn(`Could not read pages for module ${moduleId}, using fallback:`, fsError);
            // Fallback: estimate based on module
            const pageConfig = { 1: 1, 2: 1, 3: 9 };
            pageCount = pageConfig[moduleId] || 0;
          }

          // Count knowledge checks
          const knowledgeChecks = await getKnowledgeChecksByModuleId(moduleId);
          const knowledgeCheckCount = knowledgeChecks?.length || 0;

          // Total items = pages + knowledge checks
          counts[moduleId] = pageCount + knowledgeCheckCount;
        } catch (error) {
          console.error(`Error counting content for module ${moduleId}:`, error);
          counts[moduleId] = 0;
        }
      })
    );

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error counting module content:', error);
    return NextResponse.json(
      { error: 'Failed to count module content', details: error.message },
      { status: 500 }
    );
  }
}

