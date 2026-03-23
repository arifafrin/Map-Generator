/**
 * Premium Advanced Color & Style Utility
 */

// Country-specific auto palettes (Cultural sets)
export const countryPalettes = {
  BGD: { name: 'Bangladesh', colors: ['#006a4e', '#004d38', '#00875f', '#f42a41', '#d4212a', '#2d8b57', '#1a5c3a', '#4caf50', '#ffffff', '#e0ffe0'] },
  USA: { name: 'United States', colors: ['#b22234', '#3c3b6e', '#ffffff', '#c41e3a', '#002868', '#bf0a30', '#7b2d26', '#1a2a6c', '#f0f0f5', '#223366'] },
  JPN: { name: 'Japan', colors: ['#bc002d', '#ffffff', '#f8d7da', '#ff6b6b', '#e63946', '#ffeef0', '#cc0033', '#fff0f3', '#ffc0cb', '#8b0000'] },
  FRA: { name: 'France', colors: ['#0055A4', '#FFFFFF', '#EF4135', '#002395', '#ED2939', '#eef3fc', '#fdecec', '#1f487e'] },
  DEU: { name: 'Germany', colors: ['#000000', '#DD0000', '#FFCE00', '#333333', '#AA0000', '#CCAA00', '#222222', '#ffeb85'] },
  BRA: { name: 'Brazil', colors: ['#009c3b', '#ffdf00', '#002776', '#ffffff', '#00b347', '#ffed4a', '#003ba3', '#cddc39'] },
  ENG: { name: 'England', colors: ['#ce1126', '#ffffff', '#e8e8e8', '#a8101a', '#f5f5f5', '#d91a2a', '#e0e0e0', '#ffffff'] },
  SCT: { name: 'Scotland', colors: ['#005eb8', '#ffffff', '#004b93', '#e8e8e8', '#0070c0', '#f0f0f0', '#003b73', '#ffffff'] },
  WLS: { name: 'Wales', colors: ['#11953b', '#ffffff', '#ce1126', '#0e7a30', '#f5f5f5', '#a8101a', '#14b046', '#e0e0e0'] },
  NIR: { name: 'Northern Ireland', colors: ['#169b62', '#ffffff', '#ff883e', '#0d7a4e', '#f5f5f5', '#cc5500', '#2cb57a', '#e8e8e8'] }
};

// Generative AI-like Palettes (Theme presets)
export const aiColorThemes = {
  vibrant: ['#FF006E', '#8338EC', '#3A86FF', '#00FF88', '#FFBE0B', '#FB5607', '#06D6A0', '#118AB2'],
  pastel: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A', '#E2ECE9', '#B5E2FA', '#C1D3FE'],
  monochrome: ['#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC'],
  retro: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#D4A373', '#FAEDCB', '#C9E4DE']
};

/**
 * Advanced Styles Dictionary
 * Configuration properties:
 * - background: canvas background color or gradient definition
 * - stroke: border color
 * - strokeWidth: border thickness
 * - defaultFill: fallback region color
 * - regionColors: default palette for the style
 * - fontColor: text color for labels
 * - fontFamily: label font
 * - glow: neon toggle
 * - isGradientFill: defines if SVG path should map to internal gradients
 * - isOutlineOnly: sets fill to transparent regardless of palette
 */
export const mapStyles = {
  minimal: {
    id: 'minimal', name: 'Best Seller Minimal', icon: '◻️',
    background: '#ffffff',
    stroke: '#e0e0e0', strokeWidth: 1,
    fontColor: '#333333', fontFamily: 'Arial, sans-serif',
    regionColors: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#fdfdfd'],
  },
  dark: {
    id: 'dark', name: 'Premium Dark UI', icon: '🌑',
    background: '#0d1117',
    stroke: '#30363d', strokeWidth: 1,
    fontColor: '#c9d1d9', fontFamily: 'Courier New, monospace',
    regionColors: ['#161b22', '#1c2128', '#22272e', '#2d333b', '#373e47', '#444c56'],
  },
  neon: {
    id: 'neon', name: 'Cyberpunk Neon', icon: '✨',
    background: '#050510',
    stroke: '#00ffcc', strokeWidth: 1,
    fontColor: '#ff00ff', fontFamily: 'Impact, sans-serif',
    regionColors: ['#040a18', '#0b162c', '#060a22', '#140c2e', '#1a0b1c', '#0c1a1f'],
    glow: true
  },
  vintage: {
    id: 'vintage', name: 'Classic Vintage (Editorial)', icon: '📜',
    background: '#f4ecd8',
    stroke: '#8c6b5d', strokeWidth: 1,
    fontColor: '#5c4033', fontFamily: 'Georgia, serif',
    regionColors: ['#e4d5b7', '#dfceaa', '#c9b794', '#d8c29d', '#e8d8b9', '#ccb68f'],
  },
  colorful: {
    id: 'colorful', name: 'Trending Colorful', icon: '🎨',
    background: '#fefefe',
    stroke: '#ffffff', strokeWidth: 1,
    fontColor: '#1a1a1a', fontFamily: 'Verdana, sans-serif',
    regionColors: aiColorThemes.vibrant,
  },
  outline: {
    id: 'outline', name: 'Clean Outline (Editable)', icon: '✒️',
    background: '#ffffff',
    stroke: '#000000', strokeWidth: 1,
    fontColor: '#000000', fontFamily: 'Helvetica, sans-serif',
    regionColors: ['transparent'],
    isOutlineOnly: true,
  },
  exterior: {
    id: 'exterior', name: 'Stock Exterior Outline', icon: '🌍',
    background: '#ffffff',
    stroke: '#000000', strokeWidth: 1,
    fontColor: '#000000', fontFamily: 'Helvetica, sans-serif',
    regionColors: ['transparent'],
    isExteriorOnly: true,
  },
  poster: {
    id: 'poster', name: 'Pop Art High Contrast', icon: '🖼️',
    background: '#ff2a2a',
    stroke: '#000000', strokeWidth: 1,
    fontColor: '#ffffff', fontFamily: 'Futura, sans-serif',
    regionColors: ['#ff0055', '#9900ff', '#ffcc00', '#0033cc', '#ff99cc', '#00ffcc'],
  },
  silhouette: {
    id: 'silhouette', name: 'Solid Black Silhouette', icon: '⬛',
    background: '#ffffff',
    stroke: 'none', strokeWidth: 0,
    fontColor: '#000000', fontFamily: 'Helvetica, sans-serif',
    regionColors: ['#000000'],
  },
  gradient: {
    id: 'gradient', name: 'Modern Gradient (High Demand)', icon: '🌈',
    background: '#1a1a24',
    stroke: 'rgba(255,255,255,0.4)', strokeWidth: 1,
    fontColor: '#ffffff', fontFamily: 'Trebuchet MS, sans-serif',
    regionColors: ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb', '#fbc2eb', '#a6c1ee', '#fdcbf1', '#e6dee9'],
    isGradientFill: true
  },
  watercolor: {
    id: 'watercolor', name: 'Soft Pastel Wash', icon: '🎨',
    background: '#faf8f5',
    stroke: '#c8b89a', strokeWidth: 0.5,
    fontColor: '#6b5b4f', fontFamily: 'Georgia, serif',
    regionColors: ['#a8dadc', '#e8c8b8', '#f4e4c1', '#b5c7a3', '#d4a5a5', '#c2b0d6', '#f0d9b5', '#a1c9c9', '#e6cba8', '#b8c9a3'],
  },
  blueprint: {
    id: 'blueprint', name: 'Blueprint Technical', icon: '📐',
    background: '#0a1628',
    stroke: '#4a90d9', strokeWidth: 0.8,
    fontColor: '#6cb4ee', fontFamily: 'Courier New, monospace',
    isBlueprint: true,
    regionColors: ['#0d2137', '#0f2844', '#112f51', '#13365e', '#153d6b', '#173278', '#0e253e', '#102c4b'],
  },
  pastelflat: {
    id: 'pastelflat', name: 'Pastel Flat (Trendy)', icon: '🍬',
    background: '#ffffff',
    stroke: '#e8e4df', strokeWidth: 0.6,
    fontColor: '#555555', fontFamily: 'Arial, sans-serif',
    regionColors: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A', '#D8E2DC', '#B5E2FA', '#C1D3FE', '#E2CFC4', '#F0EFEB'],
  },
  earth: {
    id: 'earth', name: 'Natural Earth Tones', icon: '🌿',
    background: '#f5f0e8',
    stroke: '#8b7355', strokeWidth: 0.6,
    fontColor: '#4a3728', fontFamily: 'Palatino, serif',
    regionColors: ['#a3b18a', '#588157', '#3a5a40', '#dad7cd', '#344e41', '#84a98c', '#52796f', '#354f52', '#2f3e46', '#b6ad90'],
  },
  monochrome: {
    id: 'monochrome', name: 'Monochrome Gray (Print)', icon: '🗞️',
    background: '#ffffff',
    stroke: '#333333', strokeWidth: 0.8,
    fontColor: '#111111', fontFamily: 'Arial, sans-serif',
    regionColors: ['#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#e8e8e8', '#c8c8c8', '#a8a8a8', '#888888'],
  },
  heatmap: {
    id: 'heatmap', name: 'Heat Map (Data Viz)', icon: '🌡️',
    background: '#ffffff',
    stroke: '#ffffff', strokeWidth: 0.5,
    fontColor: '#1a1a1a', fontFamily: 'Arial, sans-serif',
    regionColors: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026', '#ffff99'],
  },
  sketch: {
    id: 'sketch', name: 'Hand-drawn Sketch', icon: '✏️',
    background: '#fdfaf4',
    stroke: '#2c2c2c', strokeWidth: 1.2,
    fontColor: '#2c2c2c', fontFamily: 'Georgia, serif',
    isSketch: true,
    regionColors: ['#fdfaf4', '#f9f4e8', '#f5f0e0', '#f0ead6', '#ede6d0', '#e9e2cc', '#f7f2e8', '#f3eedd', '#efead3', '#ebe5c9'],
  },
  antique: {
    id: 'antique', name: 'Antique Sepia (Travel)', icon: '🗺️',
    background: '#d4b483',
    stroke: '#5c3d1a', strokeWidth: 0.8,
    fontColor: '#3d1f00', fontFamily: 'Palatino Linotype, serif',
    regionColors: ['#c9a96e', '#c4a164', '#bf9a5a', '#d4b483', '#cca978', '#ba9052', '#d9bc8c', '#b88a48', '#c7a060', '#cc9e70'],
  },
  dotted: {
    id: 'dotted', name: 'Dotted Map (Infographic)', icon: '⚬',
    background: '#ffffff',
    stroke: '#333333', strokeWidth: 0.8,
    fontColor: '#111111', fontFamily: 'Arial, sans-serif',
    isDotted: true,
    regionColors: ['#1a1a1a', '#2d2d2d', '#404040', '#555555', '#6a6a6a', '#7f7f7f', '#949494', '#aaaaaa', '#bfbfbf', '#d4d4d4'],
  },
  dotshape: {
    id: 'dotshape', name: 'Pure Dot Shape', icon: '⬤',
    background: '#ffffff',
    stroke: 'none', strokeWidth: 0,
    fontColor: '#111111', fontFamily: 'Arial, sans-serif',
    isDotted: true,
    regionColors: ['#000000'],
  },
  network: {
    id: 'network', name: 'Abstract Global Network', icon: '🌐',
    background: '#040b16',
    stroke: 'none', strokeWidth: 0,
    fontColor: '#ffffff', fontFamily: 'Courier New, monospace',
    isDotted: true,
    isNetwork: true,
    regionColors: ['#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ff7f50', '#ffb380'],
  },
  neuralmesh: {
    id: 'neuralmesh', name: 'Neural Point Mesh', icon: '🕸️',
    background: '#ffffff',
    stroke: '#e5e7eb', strokeWidth: 1, // Clean visible light-gray borders
    fontColor: '#111111', fontFamily: 'Courier New, monospace',
    isNeuralMesh: true,
    isOutlineOnly: true, // Forces the actual region shapes to be completely transparent
    regionColors: aiColorThemes.vibrant, // The mesh dots and lines exclusively use this palette!
  },
  pencilbasic: {
    id: 'pencilbasic', name: 'Pencil Outline', icon: '📝',
    background: '#0a0a0f',
    stroke: '#ffffff', strokeWidth: 2,
    fontColor: '#ffffff', fontFamily: 'Courier New, monospace',
    isPencil: true,
    regionColors: ['transparent'],
  },
  pencilmesh: {
    id: 'pencilmesh', name: 'Pencil Mesh', icon: '✏️',
    background: '#ffffff',
    stroke: '#e5e7eb', strokeWidth: 1.5,
    fontColor: '#111111', fontFamily: 'Courier New, monospace',
    isNeuralMesh: true,
    isOutlineOnly: true,
    isPencil: true,
    regionColors: aiColorThemes.vibrant,
  },
  pencilnetwork: {
    id: 'pencilnetwork', name: 'Pencil Network', icon: '✍️',
    background: '#040b16',
    stroke: 'none', strokeWidth: 0,
    fontColor: '#ffffff', fontFamily: 'Courier New, monospace',
    isDotted: true,
    isNetwork: true,
    isPencil: true,
    regionColors: ['#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ff7f50', '#ffb380'],
  },
};

// Generates a 6-step color palette blending from a base hex towards a bright glow
export function generateMonochromaticPalette(baseHex, count = 6) {
  if (!baseHex || !baseHex.startsWith('#')) return Array(count).fill('#ffffff');
  const hex = baseHex.replace('#', '');
  if (hex.length !== 6) return Array(count).fill(baseHex);
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const colors = [];
  for (let i = 0; i < count; i++) {
    // Interpolate from base color (factor 0) to bright glow (factor 0.8)
    const factor = (i / (count - 1)) * 0.8;
    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);
    const toHex = (n) => {
        const h = Math.max(0, Math.min(255, n)).toString(16);
        return h.length === 1 ? '0' + h : h;
    };
    colors.push(`#${toHex(newR)}${toHex(newG)}${toHex(newB)}`);
  }
  return colors;
}

// Advanced Random Palette Generator natively returning HSL values as robust HEX
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateRandomPalette(count = 9) {
  const baseHue = Math.random() * 360;
  // Use analogous/triadic split across the array
  const colors = [];
  for (let i = 0; i < count; i++) {
    const h = (baseHue + (i * (360 / count))) % 360;
    const s = 60 + Math.random() * 40;  // 60-100% saturation
    const l = 40 + Math.random() * 30;  // 40-70% lightness
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}

export function getBeautifulRandomMapCombo() {
  const styleKeys = Object.keys(mapStyles).filter(k => k !== 'outline' && k !== 'minimal');
  const randomStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)];
  const randomPaletteType = ['auto', 'theme-vibrant', 'theme-pastel', 'random'][Math.floor(Math.random() * 4)];
  return { style: randomStyle, colorMode: randomPaletteType };
}
