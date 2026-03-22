'use client';

import { useState, useRef, useEffect } from 'react';
import { downloadSVGFile, generatePNGBlob, buildStockReadySVG, downloadZIPPackage } from '../utils/svgExport';
import { generateMetadataSet } from '../utils/seoUtils';
import { mapStyles, aiColorThemes } from '../utils/colorUtils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function ExportControls({ svgRef, geoData, countryName, selectedStyle, hasLabels, bgMode, customBgColor }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [exportedSignatures, setExportedSignatures] = useState(new Set());
  
  // Custom overriding metadata state locally before ZIP
  const [currentMetadata, setCurrentMetadata] = useState(null);

  // Initialize metadata state
  const initializeMetadata = () => {
     if (!currentMetadata && countryName) {
        setCurrentMetadata(generateMetadataSet(countryName, selectedStyle, hasLabels));
     }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
         setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const getSaneFileName = () => {
    const cName = countryName ? countryName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'map';
    return `${cName}-${selectedStyle}-vector-map`;
  };

  const validateMapStatus = () => {
    if (!svgRef || !geoData || geoData.features.length === 0) {
      alert("Map data is missing or incomplete. Cannot export.");
      return false;
    }
    return true;
  };

  // 1. Handle stock-ready ZIP export (The primary CTA)
  const handleStockZipExport = async () => {
    if (!validateMapStatus()) return;
    
    // Check Duplicate Engine
    const signature = `${countryName}-${selectedStyle}-${hasLabels ? 'labeled' : 'unlabeled'}`;
    if (exportedSignatures.has(signature)) {
       const proceed = window.confirm("⚠️ Stock Duplicate Engine Warning:\nYou have already exported this exact mapping configuration. Are you sure you want to export it again? Uploading duplicates to Adobe Stock can result in account suspension.");
       if (!proceed) return;
    }
    
    setIsExporting(true);
    
    try {
      // Use locally edited metadata or generate fresh
      const meta = currentMetadata || generateMetadataSet(countryName, selectedStyle, hasLabels);
      await downloadZIPPackage(svgRef, meta, getSaneFileName(), { bgMode, customBgColor, style: selectedStyle });
      setExportedSignatures(prev => new Set(prev).add(signature));
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export Zip package. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Handle simple standalone SVG download
  const handleSvgExport = async () => {
    if (!validateMapStatus()) return;
    setIsExporting(true);
    
    // Process SVG identically for stock readiness
    const svgString = await buildStockReadySVG(svgRef, countryName, { 
      stripLabels: false, bgMode, customBgColor, style: selectedStyle 
    });
    downloadSVGFile(svgString, `${getSaneFileName()}.svg`);
    
    setIsExporting(false);
  };
  
  // 3. Handle standalone PNG
  const handlePngExport = async () => {
     if (!validateMapStatus()) return;
     setIsExporting(true);
     try {
       const blob = await generatePNGBlob(svgRef);
       saveAs(blob, `${getSaneFileName()}-preview.png`);
     } catch(e) {
       console.error("PNG render failed", e);
     }
     setIsExporting(false);
  };
  
  // 4. Handle Bulk Generation (10 Variations MEGA ZIP)
  const handleBulkExport = async () => {
     if (!validateMapStatus()) return;
     
     const bulkSignature = `bulk-10-${countryName}`;
     if (exportedSignatures.has(bulkSignature)) {
        const proceed = window.confirm("⚠️ Stock Duplicate Warning:\nYou've already exported the 10-variation bulk pack for this country. Proceed anyway?");
        if (!proceed) return;
     }

     setIsExporting(true);
     
     try {
       const zip = new JSZip();
       const baseName = countryName ? countryName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'map';
       const stockFolder = zip.folder(`${baseName}-premium-all-styles-pack`);
       
       // Cycle through all defined styles dynamically
       const variations = Object.entries(mapStyles).map(([styleId, styleDef], idx) => {
           const prefix = String(idx + 1).padStart(2, '0');
           const cleanName = styleDef.name.replace(/[^a-zA-Z0-9]/g, '');
           return {
               name: `${prefix}-${cleanName}`,
               styleId: styleId,
               colors: styleDef.regionColors,
               bg: styleDef.background === 'transparent' ? '#ffffff' : styleDef.background,
               strokeWidth: styleDef.strokeWidth !== undefined ? styleDef.strokeWidth : 1
           };
       });
       
       for(let v of variations) {
           const subFolder = stockFolder.folder(v.name);
           const md = generateMetadataSet(countryName, v.styleId, false); // Generate baseline SEO for this specific style
           
           const clone = svgRef.cloneNode(true);
           clone.style.background = v.bg;
           
           // Recoloring the clone directly
           const paths = Array.from(clone.querySelectorAll('path'));
           paths.forEach((p, idx) => {
               p.setAttribute('fill', v.colors[idx % v.colors.length]);
               if (v.strokeWidth !== undefined) {
                  p.setAttribute('stroke-width', v.strokeWidth);
               }
           });
           
           // Export Clean Geometry
           const svgString = await buildStockReadySVG(clone, countryName, { stripLabels: true });
           subFolder.file(`${baseName}-${v.name.toLowerCase()}.svg`, svgString);
           
           // Inject SEO Metadata
           const txtContent = `=== STOCK MARKETPLACE METADATA ===\n\nTitle:\n${md.title}\n\nKeywords (up to 50):\n${md.keywords}\n\nDescription:\n${md.description}\n\n=== GENERATED BY VECTOR MAP GENERATOR ===`;
           subFolder.file(`${baseName}-${v.name.toLowerCase()}-metadata.txt`, txtContent);
           
           // Generate PNG Preview Thumbnail
           document.body.appendChild(clone);
           clone.style.position = 'absolute'; clone.style.visibility = 'hidden';
           try {
             const pngBlob = await generatePNGBlob(clone);
             subFolder.file(`${baseName}-${v.name.toLowerCase()}-preview.png`, pngBlob);
           } catch(e) { console.warn("PNG generation skip", e); }
           document.body.removeChild(clone);
       }
       
       const content = await zip.generateAsync({ type: 'blob' });
       saveAs(content, `${baseName}-premium-all-styles-pack.zip`);
       setExportedSignatures(prev => new Set(prev).add(bulkSignature));
       
     } catch (err) {
       console.error("Bulk Generation Failed", err);
       alert("Failed to build Bulk Collection.");
     } finally {
       setIsExporting(false);
     }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col gap-2 relative z-50">
        
        {isOpen && geoData && (
          <div className="absolute bottom-full mb-3 left-0 w-full p-2 bg-[#0d0d14] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-xl flex flex-col gap-1 z-50 animate-fade-in origin-bottom">
            <button onClick={() => { setIsOpen(false); handleSvgExport(); }} className="py-3 px-4 rounded-lg bg-white/5 hover:bg-purple-500/20 text-left text-[11px] font-bold uppercase tracking-wider text-gray-200 transition-colors flex items-center gap-3">
              <span className="text-purple-400 text-lg">✒️</span> Vector Format (SVG)
            </button>
            <button onClick={() => { setIsOpen(false); handlePngExport(); }} className="py-3 px-4 rounded-lg bg-white/5 hover:bg-blue-500/20 text-left text-[11px] font-bold uppercase tracking-wider text-gray-200 transition-colors flex items-center gap-3">
              <span className="text-blue-400 text-lg">🖼️</span> Image Format (PNG)
            </button>
            <button onClick={() => { setIsOpen(false); handleStockZipExport(); }} className="py-3 px-4 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-left text-[11px] font-bold uppercase tracking-wider text-gray-200 transition-colors flex items-center gap-3 border border-emerald-500/10">
              <span className="text-emerald-400 text-lg">📦</span> Download Both (ZIP)
            </button>
          </div>
        )}

        <button
          onClick={() => {
             initializeMetadata();
             setIsOpen(!isOpen);
          }}
          disabled={!geoData || isExporting}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            !geoData || isExporting
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1'
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Packaging...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </>
          )}
        </button>
        
        <button
          onClick={handleBulkExport}
          disabled={!geoData || isExporting}
          className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2 shadow-lg ${
            !geoData || isExporting
              ? 'bg-transparent border-gray-800 text-gray-700 cursor-not-allowed hidden'
              : 'bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/30 text-orange-400 hover:from-orange-500/20 hover:to-pink-500/20 hover:border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:-translate-y-0.5'
          }`}
          title={`Generates all ${Object.keys(mapStyles).length} distinct aesthetic variations in one MEGA ZIP.`}
        >
          <span className="text-xl -mt-1">🚀</span>
          Generate {Object.keys(mapStyles).length} Styles
        </button>
      </div>
    </div>
  );
}
