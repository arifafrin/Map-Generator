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
  } else if (styleConfig.id === 'dark' || styleConfig.id === 'neon') {
    initialPool.push('dark', 'night', 'cyberpunk', 'futuristic', 'glowing', 'luminous');
  } else if (styleConfig.id === 'vintage' || styleConfig.id === 'antique') {
    initialPool.push('vintage', 'retro', 'old', 'antique', 'parchment', 'history', 'classic', 'sepia');
  } else if (styleConfig.id === 'silhouette') {
    initialPool.push('black', 'solid', 'dark', 'shadow', 'shape');
  } else if (styleConfig.id === 'monochrome') {
    initialPool.push('monochrome', 'grayscale', 'grey', 'print', 'newspaper', 'academic', 'journal', 'bw');
  } else if (styleConfig.id === 'heatmap') {
    initialPool.push('heatmap', 'data', 'visualization', 'choropleth', 'statistics', 'gradient', 'intensity', 'analytics');
  } else if (styleConfig.id === 'sketch') {
    initialPool.push('sketch', 'hand', 'drawn', 'pencil', 'doodle', 'editorial', 'artistic', 'handmade');
  } else if (styleConfig.id === 'dotted' || styleConfig.id === 'dotshape') {
    initialPool.push('dotted', 'dots', 'halftone', 'stipple', 'pattern', 'pointillism', 'infographic');
  } else if (styleConfig.id === 'network' || styleConfig.id === 'neuralmesh') {
    initialPool.push('network', 'global', 'technology', 'connection', 'internet', 'communication', 'cyber', 'nodes', 'digital', 'mesh', 'neural');
  } else if (styleConfig.id === 'colorful') {
    initialPool.push('colorful', 'vibrant', 'bright', 'vivid', 'rainbow', 'multicolor', 'trending');
  } else if (styleConfig.id === 'poster') {
    initialPool.push('poster', 'popart', 'contrast', 'bold', 'graphic', 'loud');
  } else if (styleConfig.id === 'gradient') {
    initialPool.push('gradient', 'modern', 'fade', 'smooth', 'transition', 'trendy', 'pastel');
  } else if (styleConfig.id === 'watercolor') {
    initialPool.push('watercolor', 'paint', 'wash', 'soft', 'pastel', 'artistic', 'brush');
  } else if (styleConfig.id === 'blueprint') {
    initialPool.push('blueprint', 'technical', 'draft', 'grid', 'engineering', 'architecture', 'plan');
  } else if (styleConfig.id === 'pastelflat') {
    initialPool.push('pastel', 'flat', 'gentle', 'soft', 'candy', 'minimal', 'trend');
  } else if (styleConfig.id === 'earth') {
    initialPool.push('earth', 'tones', 'natural', 'nature', 'organic', 'green', 'brown', 'eco');
  }
  
  // Add core keywords at the end as fallbacks
  initialPool.push(...coreMarketingKeywords);

  // Hard limit to 25 keywords max per user request
  const finalKeywords = cleanAndFormatKeywords(initialPool, 25);
  return finalKeywords.join(', ');
}

export function generateStockTitle(countryName, styleConfig) {
  // Always start with the Country Name so it stays capitalized during sentence casing
  switch (styleConfig.id) {
    case 'outline': return `${countryName} vector administrative map with detailed outline borders on blank background`;
    case 'exterior': return `${countryName} exterior outline shape with clean silhouette vector border`;
    case 'dark':
    case 'neon': return `${countryName} premium dark ui vector map featuring modern glowing tech design`;
    case 'vintage': return `${countryName} classic vintage style vector map with historical atlas design`;
    case 'antique': return `${countryName} antique sepia vector map with historical travel illustration`;
    case 'silhouette': return `${countryName} solid black silhouette map as an isolated vector shape`;
    case 'monochrome': return `${countryName} monochrome grayscale vector map for print ready administrative layout`;
    case 'heatmap': return `${countryName} heat map vector showing data visualization color gradient template`;
    case 'sketch': return `${countryName} hand drawn sketch vector map with artistic editorial illustration`;
    case 'dotted': return `${countryName} dotted pattern vector map for halftone infographic data template`;
    case 'dotshape': return `${countryName} dot shape silhouette map showing pure halftone pointillism vector`;
    case 'network': return `${countryName} abstract global tech network map showing digital connection vector`;
    case 'neuralmesh': return `${countryName} neural point mesh vector map with futuristic artificial intelligence network design`;
    case 'colorful': return `${countryName} colorful vector administrative map featuring vibrant and trending graphic design`;
    case 'poster': return `${countryName} pop art high contrast vector map with bold and loud graphic poster design`;
    case 'gradient': return `${countryName} modern gradient vector map with smooth color transitions and trendy layout`;
    case 'watercolor': return `${countryName} watercolor map vector featuring soft pastel paint wash and artistic brush strokes`;
    case 'blueprint': return `${countryName} technical blueprint vector map showing architectural grid plan and engineering draft`;
    case 'pastelflat': return `${countryName} pastel flat design vector map featuring soft candy colors and minimal trendy layout`;
    case 'earth': return `${countryName} natural earth tones vector map featuring organic eco friendly colors`;
    default: return `${countryName} vector administrative map featuring high quality colorful graphic design`;
  }
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
