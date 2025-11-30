/**
 * Configuration for module pages based on available images
 * Images are named: mod{moduleId}p{pageNumber}.{ext}
 */

// Helper function to get image path for a module page
// Tries different extensions based on common patterns
export function getModulePageImage(moduleId, pageNumber) {
  const moduleNum = moduleId.replace('module', '');
  
  // Based on actual files:
  // Module 1: mod1p1.jpg
  // Module 2: mod2p2.jpg
  // Module 3: mod3p1.jpg, mod3p2.jpg, mod3p3.png, mod3p4.jpg, mod3p5.png, mod3p6.jpg, mod3p7.png, mod3p8.jpg, mod3p9.png
  
  // Determine extension based on module and page patterns
  let extension = 'jpg'; // default
  
  if (moduleNum === '3') {
    // Module 3 has mixed extensions: png for pages 3, 5, 7, 9
    if ([3, 5, 7, 9].includes(pageNumber)) {
      extension = 'png';
    }
  }
  
  return `/img/mod${moduleNum}p${pageNumber}.${extension}`;
}

/**
 * Get available pages for a module
 * First tries to fetch from API, falls back to static configuration
 */
export async function getModulePages(moduleId) {
  try {
    // Try to fetch from API first
    const response = await fetch(`/api/module-pages?moduleId=${moduleId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.pages && data.pages.length > 0) {
        return data.pages.map(page => ({
          pageNumber: page.pageNumber,
          imagePath: page.imagePath,
          title: `Page ${page.pageNumber}`
        }));
      }
    }
  } catch (error) {
    console.warn('Failed to fetch pages from API, using fallback:', error);
  }
  
  // Fallback to static configuration
  const moduleNum = parseInt(moduleId.replace('module', ''));
  
  // Based on available images in public/img:
  // Module 1: mod1p1.jpg (1 page)
  // Module 2: mod2p2.jpg (1 page, page 2)
  // Module 3: mod3p1.jpg through mod3p9.png (9 pages)
  
  const pageConfig = {
    1: [1], // Module 1 has page 1
    2: [2], // Module 2 has page 2 (page 1 might be missing)
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Module 3 has pages 1-9
  };
  
  const pages = pageConfig[moduleNum] || [];
  
  return pages.map(pageNum => ({
    pageNumber: pageNum,
    imagePath: getModulePageImage(moduleId, pageNum),
    title: `Page ${pageNum}`
  }));
}

/**
 * Get the total number of pages for a module
 */
export function getModulePageCount(moduleId) {
  return getModulePages(moduleId).length;
}

