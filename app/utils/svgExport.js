/**
 * Professional SVG export utility for stock marketplaces.
 * Generates clean, editable, layered SVG files with support for Premium Edition features (gradients, labels).
 * Added ZIP packaging system for Adobe Stock bulk exports.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import opentype from 'opentype.js';

let cachedFont = null;
async function loadFont() {
  if (cachedFont) return cachedFont;
  try {
    cachedFont = await opentype.load('/fonts/Roboto-Regular.ttf');
  } catch (err) {
    try {
      cachedFont = await opentype.load('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf');
    } catch(e) { console.error("Font load failed.", e); }
  }
  return cachedFont;
}

const sanitizeId = (str) => {
  if (!str) return 'region';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export async function buildStockReadySVG(svgElement, countryName, options = { stripLabels: false }) {
  if (!svgElement) return null;

  const clone = svgElement.cloneNode(true);
  
  // 1. Remove unwanted interactive effects
  // Find all paths and remove hover/click specific classes and dynamic filters
  const paths = Array.from(clone.querySelectorAll('path'));
  paths.forEach(p => {
    p.removeAttribute('class');
    // Remove inline style transforms/filters used for UI feedback
    p.style.transform = '';
    p.style.filter = '';
    p.style.opacity = ''; // reset opacity if changed by hover
    if (p.getAttribute('style') === '') p.removeAttribute('style');
  });

  // 1.5 Handle Text Conversion or Stripping
  const mapLabelsGroupNode = clone.querySelector('#map-labels');
  const mapTitleGroupNode = clone.querySelector('#map-title');

  if (options.stripLabels) {
      if (mapLabelsGroupNode) mapLabelsGroupNode.innerHTML = '';
  } else {
      // Load font for converting text to paths
      const font = await loadFont();
      if (font) {
          const texts = Array.from(clone.querySelectorAll('text'));
          texts.forEach(t => {
              const textContent = t.textContent;
              if (!textContent) return;
              
              const x = parseFloat(t.getAttribute('x') || t.getAttribute('dx')) || 0;
              const y = parseFloat(t.getAttribute('y') || t.getAttribute('dy')) || 0;
              // MapPreview scales font sizes differently. Retrieve true computed scale or static size
              const fontSize = parseFloat(t.getAttribute('font-size')) || 10;
              const fill = t.getAttribute('fill') || '#000000';
              const textAnchor = t.getAttribute('text-anchor') || 'middle';
              
              let startX = x;
              const advanceWidth = font.getAdvanceWidth(textContent, fontSize);
              if (textAnchor === 'middle') {
                  startX = x - (advanceWidth / 2);
              } else if (textAnchor === 'end') {
                  startX = x - advanceWidth;
              }

              const fontPath = font.getPath(textContent, startX, y, fontSize);
              const pathData = fontPath.toPathData(2);
              
              const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              newPath.setAttribute('d', pathData);
              newPath.setAttribute('fill', fill);
              newPath.setAttribute('class', 'converted-text');
              
              if (t.id) newPath.setAttribute('id', sanitizeId(t.id + '-path'));
              if (t.parentNode) t.parentNode.replaceChild(newPath, t);
          });
      }
  }

  // 2. Preserve Defs if they contain structural elements (like Gradients)
  // We remove glow filters as they are not standard stock vector formats, but keep linearGradients.
  const defs = clone.querySelector('defs');
  if (defs) {
    const filters = Array.from(defs.querySelectorAll('filter'));
    filters.forEach(f => f.remove());
    // If defs is now empty, remove it
    if (defs.children.length === 0) defs.remove();
  }
  
  // 3. Clean root styles and React specific attributes
  clone.removeAttribute('class');
  const attributesToRemove = ['data-reactroot', 'data-reactid', 'data-react-checksum'];
  attributesToRemove.forEach(attr => clone.removeAttribute(attr));
  
  // Explicitly handle background. If it's transparent, ensure no style prop sets it.
  if (clone.style.background === 'transparent' || clone.style.background === '') {
     clone.style.background = '';
  }
  if (clone.getAttribute('style') === '') clone.removeAttribute('style');

  // 4. Set explicit XML namespaces
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  // 5. Structure Layers cleanly (Stock Requirement)
  const countryGroupId = sanitizeId(countryName || 'country-map');
  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  mainGroup.setAttribute('id', countryGroupId);

  // Extract regions group
  const mapRegionsGroup = clone.querySelector('#map-regions');
  if (mapRegionsGroup) {
      const regionGroupOut = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      regionGroupOut.setAttribute('id', 'regions');
      
      const regionPaths = Array.from(mapRegionsGroup.querySelectorAll('path'));
      regionPaths.forEach((path, index) => {
        const titleEl = path.querySelector('title');
        const regionName = titleEl ? titleEl.textContent : `region-${index + 1}`;
        if (titleEl) titleEl.remove(); // remove title to clean up path definition
        
        // Strip data-* attributes from path
        Array.from(path.attributes).forEach(attr => {
           if(attr.name.startsWith('data-')) path.removeAttribute(attr.name);
        });

        // Ensure path id is set for stock organization
        if (!path.getAttribute('id')) path.setAttribute('id', sanitizeId(regionName));
        
        // Group the individual path
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `layer-${sanitizeId(regionName)}`);
        g.appendChild(path);
        regionGroupOut.appendChild(g);
      });
      mainGroup.appendChild(regionGroupOut);
  }

  // Extract labels and overlay elements
  const mapLabelsGroup = clone.querySelector('#map-labels');
  const mapTitleGroup = clone.querySelector('#map-title');
  const overlayGroupOut = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  overlayGroupOut.setAttribute('id', 'overlays');
  let hasOverlays = false;

  if (mapLabelsGroup && mapLabelsGroup.children.length > 0) {
      const labelGroupIn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelGroupIn.setAttribute('id', 'labels');
      
      // Because text was converted to paths
      const labelEls = Array.from(mapLabelsGroup.querySelectorAll('text, path'));
      labelEls.forEach((el, i) => {
          if (!el.getAttribute('id')) el.setAttribute('id', `label-${i}`);
          labelGroupIn.appendChild(el);
      });
      overlayGroupOut.appendChild(labelGroupIn);
      hasOverlays = true;
  }
  
  if (mapTitleGroup && mapTitleGroup.children.length > 0) {
      const titleGroupIn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      titleGroupIn.setAttribute('id', 'title');
      const titleEls = Array.from(mapTitleGroup.querySelectorAll('text, path'));
      titleEls.forEach((el, i) => {
          if (!el.getAttribute('id')) el.setAttribute('id', `title-element-${i}`);
          titleGroupIn.appendChild(el);
      });
      overlayGroupOut.appendChild(titleGroupIn);
      hasOverlays = true;
  }
  
  if(hasOverlays) {
      mainGroup.appendChild(overlayGroupOut);
  }

  // Clear original body and rebuild with structured groups
  const existingDefs = clone.querySelector('defs');
  
  while (clone.firstChild) {
    clone.removeChild(clone.firstChild);
  }
  
  if (existingDefs) clone.appendChild(existingDefs); // Must come before use
  clone.appendChild(mainGroup);
  
  // 6. Serialize & Format
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);
  
  svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    '<!-- Generator: Vector Map Generator Premium Edition -->\n' +
    svgString;
    
  return svgString;
}

export function downloadSVGFile(svgString, filename) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Fixed 300 DPI equivalent PNG export
export function generatePNGBlob(svgElement) {
return new Promise((resolve, reject) => {
  if (!svgElement) return reject(new Error("No SVG Element"));

  const scale = 4; // ~300 DPI target based on screen resolution

  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const clone = svgElement.cloneNode(true);
  
  // We must inline any computed styles required for canvas rendering that were stripped or are external
  // For canvas drawing we need actual background if it's not transparent
  if (clone.style.background === 'transparent' || clone.style.background === '') {
     clone.style.background = 'transparent';
  }
  
  const svgData = new XMLSerializer().serializeToString(clone);
  const img = new Image();

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 1.0);
  };

  img.onerror = (err) => reject(err);
  img.src = url;
});
}

// Generates a complete ZIP package including SVG, PNG, and metadata.txt
export async function downloadZIPPackage(svgElement, metadata, baseFilename) {
  if (!svgElement) return;

  const zip = new JSZip();

  // 1. Generate clean SVG strings
  if (metadata.hasLabels === false || metadata.hasLabels === undefined) {
      // If UI explicitly has labels turned off, just export normal
      const svgString = await buildStockReadySVG(svgElement, baseFilename.split('-')[0]);
      zip.file(`${baseFilename}.svg`, svgString);
  } else {
      // If UI has labels turned ON, export dual versions
      const svgWithLabels = await buildStockReadySVG(svgElement, baseFilename.split('-')[0], { stripLabels: false });
      zip.file(`${baseFilename}-with-labels.svg`, svgWithLabels);
      
      const svgWithoutLabels = await buildStockReadySVG(svgElement, baseFilename.split('-')[0], { stripLabels: true });
      zip.file(`${baseFilename}-no-labels.svg`, svgWithoutLabels);
  }

  // 2. Generate Metadata TXT
  const txtContent = `=== STOCK MARKETPLACE METADATA ===

Title:
${metadata.title}

Keywords (up to 50):
${metadata.keywords}

Description:
${metadata.description}

=== GENERATED BY VECTOR MAP GENERATOR ===`;
  
  zip.file(`${baseFilename}-metadata.txt`, txtContent);

  // 3. Generate PNG Blob
  try {
    const pngBlob = await generatePNGBlob(svgElement);
    zip.file(`${baseFilename}-preview.png`, pngBlob);
  } catch (err) {
    console.error("Failed to generate PNG preview for ZIP:", err);
  }

  // 4. Download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseFilename}-stock-package.zip`);
}
