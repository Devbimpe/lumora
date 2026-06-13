import { NextResponse } from 'next/server';
import { getModuleWithContent, getAllModules, getContentByModuleId, getKnowledgeChecksByContentId } from '@/app/_db/admin-db.js';
import { defineUserRoute, internalServerError } from '@/app/_lib/route';

// GET handler: Retrieves module details, associated content, and knowledge checks
// Supports optional filtering by moduleId via query parameter
export const GET = defineUserRoute(async (request) => {
  try {
    const moduleId = request.nextUrl.searchParams.get('moduleId');

    let results = [];

    if (moduleId) {
      // Get specific module with content
      const module = await getModuleWithContent(moduleId);
      
      if (!module) {
        return NextResponse.json([]);
      }
      
      // Flatten the data structure to match SQL format
      if (module.content) {
        for (const content of module.content) {
          if (content.knowledgeChecks && content.knowledgeChecks.length > 0) {
            for (const check of content.knowledgeChecks) {
              results.push({
                ModuleID: module.moduleId,
                Heading: module.heading,
                Subheading: module.subheading,
                ContentID: content.contentId,
                Overview: content.overview,
                Reading: content.reading,
                Question: check.question,
                Answer: check.answer
              });
            }
          } else {
            results.push({
              ModuleID: module.moduleId,
              Heading: module.heading,
              Subheading: module.subheading,
              ContentID: content.contentId,
              Overview: content.overview,
              Reading: content.reading,
              Question: null,
              Answer: null
            });
          }
        }
      }
    } else {
      // Get all modules with content
      const modules = await getAllModules();
      
      for (const module of modules) {
        const content = await getContentByModuleId(module.moduleId);
        
        for (const contentItem of content) {
          const checks = await getKnowledgeChecksByContentId(contentItem.contentId);
          
          if (checks && checks.length > 0) {
            for (const check of checks) {
              results.push({
                ModuleID: module.moduleId,
                Heading: module.heading,
                Subheading: module.subheading,
                ContentID: contentItem.contentId,
                Overview: contentItem.overview,
                Reading: contentItem.reading,
                Question: check.question,
                Answer: check.answer
              });
            }
          } else {
            results.push({
              ModuleID: module.moduleId,
              Heading: module.heading,
              Subheading: module.subheading,
              ContentID: contentItem.contentId,
              Overview: contentItem.overview,
              Reading: contentItem.reading,
              Question: null,
              Answer: null
            });
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('API GET error:', error);
    return internalServerError('Failed to fetch module content');
  }
});
