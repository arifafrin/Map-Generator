/**
 * SEO Engine for Stock Marketplaces
 * Generates highly optimized, 50-keyword arrays and optimized titles
 * tailored for Adobe Stock, Shutterstock, and Vecteezy.
 */

// Core taxonomy verbs and nouns that drive marketplace sales
const coreMarketingKeywords = [
  'map', 'vector', 'geography', 'design', 'graphic', 'illustration', 'atlas',
  'cartography', 'isolated', 'white', 'background', 'administrative', 'region',
  'boundary', 'country', 'nation', 'world', 'global', 'business', 'travel',
  'template', 'silhouette', 'outline', 'blank', 'clean', 'modern', 'infographic',
  'flat', 'shape', 'icon', 'symbol', 'earth', 'territory', 'political', 'border',
  'state', 'province', 'district', 'area', 'location', 'destination', 'tourism',
  'journey', 'navigation', 'gps', 'printable', 'educational', 'accurate', 'detailed'
];

/**
 * Ensures keywords are stock-compliant:
 * 1. Strictly single words
 * 2. Lowercase
 * 3. No duplicates
 * 4. Alphabetized
 * 5. Capped at exactly max length (e.g. 50 Adobe limit)
 */
function cleanAndFormatKeywords(rawKeywords, maxLength = 50) {
  const processed = new Set();
  
  rawKeywords.forEach(kw => {
    if (!kw) return;
    // Split compound words like "united states" into "united", "states"
    // Adobe specifically recommends breaking phrases into single high-volume words
    const words = kw.toString().toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    words.forEach(word => {
      if (word.length >= 2 && !['and', 'the', 'map', 'of', 'in', 'on', 'at'].includes(word)) { // Filter stop words
        processed.add(word);
      }
    });
  });

  // Always ensure 'map' and 'vector' are at the top, then alphabetize the rest
  const finalArray = Array.from(processed);
  const core = ['map', 'vector'];
  const others = finalArray.filter(v => !core.includes(v)).sort();
  
  return [...core, ...others].slice(0, maxLength);
}

export function generateStockKeywords(countryName, countryIso, styleConfig, layout) {
  let initialPool = [
    countryName,
    countryIso,
    styleConfig.name,
    layout
  ];

  // Inject style-specific psychology keywords FIRST to give them priority
  if (styleConfig.id === 'outline' || styleConfig.id === 'exterior') {
    initialPool.push('line', 'stroke', 'thin', 'minimalist', 'empty', 'wireframe', 'clean');
  }
  if (styleConfig.id === 'dark' || styleConfig.id === 'neon') {
    initialPool.push('dark', 'night', 'cyberpunk', 'futuristic', 'glowing', 'luminous');
  }
  if (styleConfig.id === 'vintage' || styleConfig.id === 'antique') {
    initialPool.push('vintage', 'retro', 'old', 'antique', 'parchment', 'history', 'classic', 'sepia');
  }
  if (styleConfig.id === 'silhouette') {
    initialPool.push('black', 'solid', 'dark', 'shadow', 'shape');
  }
  if (styleConfig.id === 'monochrome') {
    initialPool.push('monochrome', 'grayscale', 'grey', 'print', 'newspaper', 'academic', 'journal', 'bw');
  }
  if (styleConfig.id === 'heatmap') {
    initialPool.push('heatmap', 'data', 'visualization', 'choropleth', 'statistics', 'gradient', 'intensity', 'analytics');
  }
  if (styleConfig.id === 'sketch') {
    initialPool.push('sketch', 'hand', 'drawn', 'pencil', 'doodle', 'editorial', 'artistic', 'handmade');
  }
  if (styleConfig.id === 'dotted' || styleConfig.id === 'dotshape') {
    initialPool.push('dotted', 'dots', 'halftone', 'stipple', 'pattern', 'pointillism', 'infographic');
  }
  if (styleConfig.id === 'network') {
    initialPool.push('network', 'global', 'technology', 'connection', 'internet', 'communication', 'cyber', 'nodes', 'digital');
  }
  
  // Add core keywords at the end as fallbacks
  initialPool.push(...coreMarketingKeywords);

  // Hard limit to 25 keywords max per user request
  const finalKeywords = cleanAndFormatKeywords(initialPool, 25);
  return finalKeywords.join(', ');
}

export function generateStockTitle(countryName, styleConfig) {
  const baseTitle = `${countryName} Vector Administrative Map`;
  
  // Stock-optimized titles for each style
  if (styleConfig.id === 'outline') {
    return `${baseTitle} - Detailed Outline Borders on Blank Background`;
  }
  if (styleConfig.id === 'exterior') {
    return `${countryName} Exterior Outline Shape - Clean Silhouette Vector Border`;
  }
  if (styleConfig.id === 'dark' || styleConfig.id === 'neon') {
    return `Premium Dark UI Vector Map of ${countryName} - Modern Tech Design`;
  }
  if (styleConfig.id === 'vintage') {
    return `Classic Vintage Style Vector Map of ${countryName} - Historical Atlas Design`;
  }
  if (styleConfig.id === 'antique') {
    return `Antique Sepia Vector Map of ${countryName} - Historical Travel Illustration`;
  }
  if (styleConfig.id === 'silhouette') {
    return `${countryName} Solid Black Silhouette Map - Isolated Vector Shape`;
  }
  if (styleConfig.id === 'monochrome') {
    return `${countryName} Monochrome Grayscale Vector Map - Print Ready Administrative Map`;
  }
  if (styleConfig.id === 'heatmap') {
    return `${countryName} Heat Map Vector - Data Visualization Color Gradient Template`;
  }
  if (styleConfig.id === 'sketch') {
    return `${countryName} Hand-Drawn Sketch Vector Map - Artistic Editorial Illustration`;
  }
  if (styleConfig.id === 'dotted') {
    return `${countryName} Dotted Pattern Vector Map - Halftone Infographic Data Template`;
  }
  if (styleConfig.id === 'dotshape') {
    return `${countryName} Dot Shape Silhouette Map - Pure Halftone Pointillism Vector`;
  }
  if (styleConfig.id === 'network') {
    return `${countryName} Abstract Global Tech Network Map - Digital Connection Vector`;
  }
  
  return `${baseTitle} - High Quality Colorful Graphic Blank Template`;
}

export function generateMetadataSet(countryName, styleId, hasLabels) {
  const styleConfig = { id: styleId, name: styleId }; // Fallback minimal config
  const rawTitle = generateStockTitle(countryName, styleConfig);
  
  // Convert strictly to sentence case (First letter capitalized, rest lowercase)
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();
  
  const keywords = generateStockKeywords(countryName, countryName.substring(0,3).toUpperCase(), styleConfig, 'landscape');
  const description = `Discover our premium ${title}. This highly detailed vector map is fully editable, layered, and scalable without any loss of quality. Perfect for infographics, educational materials, presentations, and digital design projects. ${hasLabels ? 'Includes detailed administrative labels.' : 'Clean blank outline.'}`;
  
  return { title, keywords, description };
}
