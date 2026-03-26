import { NextResponse } from 'next/server';
import { getAllModules, getContentByModuleId, getKnowledgeChecksByModuleId } from '@db/db.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleIds = url.searchParams.get('moduleIds');

    let modulesToProcess = [];
    
    if (moduleIds) {
      const ids = moduleIds.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      modulesToProcess = ids;
    } else {
      const allModules = await getAllModules();
      modulesToProcess = allModules.map(m => m.moduleId);
    }

    const counts = {};

    await Promise.all(
      modulesToProcess.map(async (moduleId) => {
        try {
          const [contentPages, knowledgeChecks] = await Promise.all([
            getContentByModuleId(moduleId),
            getKnowledgeChecksByModuleId(moduleId)
          ]);

          counts[moduleId] = (contentPages?.length || 0) + (knowledgeChecks?.length || 0);
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

