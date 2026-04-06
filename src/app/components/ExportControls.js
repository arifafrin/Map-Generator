'use client';

import { useState, useRef, useEffect } from 'react';
import { downloadSVGFile, generatePNGBlob, buildStockReadySVG, downloadZIPPackage } from '../utils/svgExport';
import { renderMapAnimationOptions } from '../utils/videoExport';
import { generateMetadataSet } from '../utils/seoUtils';
import { mapStyles, aiColorThemes } from '../utils/colorUtils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function ExportControls({ 
  svgRef, geoData, countryName, selectedStyle, hasLabels, bgMode, customBgColor,
  animationEnabled, animationStyle, animationSpeed
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(null);
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

  const getExportableSvg = () => {
    // Direct ref first (fastest path)
    if (svgRef) return svgRef;
    // Fallback: query the map canvas SVG from DOM directly
    const domSvg = document.querySelector('#map-canvas svg');
    return domSvg || null;
  };

  const isValidToExport = geoData || selectedStyle?.includes('pencil');

  const validateMapStatus = () => {
    const svgEl = getExportableSvg();
    if (!svgEl || !isValidToExport) {
      alert("Please select a country or draw a shape first before exporting.");
      return null;
    }
    return svgEl;
  };

  // 1. Handle stock-ready ZIP export (The primary CTA)
  const handleStockZipExport = async () => {
    const svgEl = validateMapStatus();
    if (!svgEl) return;
    
    // Check Duplicate Engine
    const signature = `${countryName}-${selectedStyle}-${hasLabels ? 'labeled' : 'unlabeled'}`;
    if (exportedSignatures.has(signature)) {
        const proceed = window.confirm("You have already exported this exact map design. Do you want to export it again?");
       if (!proceed) return;
    }
    
    setIsExporting(true);
    
    try {
      // Use locally edited metadata or generate fresh
      const meta = currentMetadata || generateMetadataSet(countryName, selectedStyle, hasLabels);
      await downloadZIPPackage(svgEl, meta, getSaneFileName(), { bgMode, customBgColor, style: selectedStyle });
      setExportedSignatures(prev => new Set(prev).add(signature));
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Handle simple standalone SVG download
  const handleSvgExport = async () => {
    const svgEl = validateMapStatus();
    if (!svgEl) return;
    setIsExporting(true);
    
    // Generate metadata and pass into SVG so XMP is embedded in File > File Info
    const meta = currentMetadata || generateMetadataSet(countryName, selectedStyle, hasLabels);
    const svgString = await buildStockReadySVG(svgEl, countryName, { 
      stripLabels: false, bgMode, customBgColor, style: selectedStyle, metadata: meta
    });
    downloadSVGFile(svgString, `${getSaneFileName()}.svg`);
    
    setIsExporting(false);
  };
  
  // 3. Handle standalone PNG
  const handlePngExport = async () => {
     const svgEl = validateMapStatus();
     if (!svgEl) return;
     setIsExporting(true);
     try {
       const blob = await generatePNGBlob(svgEl);
       saveAs(blob, `${getSaneFileName()}-preview.png`);
     } catch(e) {
       console.error("PNG render failed", e);
     }
     setIsExporting(false);
  };
  
  // 3.5 Handle 4K Video Animation Export
  const handleVideoExport = async (durationSec = 5) => {
     const svgEl = validateMapStatus();
     if (!svgEl) return;
     
     setIsExporting(true);
     setVideoProgress({ frame: 0, total: durationSec * 60, percent: 0 });
     
     try {
       const blob = await renderMapAnimationOptions(svgEl, {
          durationSec,
          animationStyle,
          animationSpeed,
          bgColor: bgMode === 'transparent' ? '#ffffff' : (customBgColor || mapStyles[selectedStyle]?.background || '#0a1628'),
          onProgress: (prog) => setVideoProgress(prog)
       });
       
       saveAs(blob, `${getSaneFileName()}-animation-${animationStyle}.mp4`);
     } catch(e) {
       console.error("Video render failed", e);
       alert("Video rendering failed. Please check the console.");
     } finally {
       setIsExporting(false);
       setVideoProgress(null);
     }
  };

  // 4. Handle Bulk Generation (10 Variations MEGA ZIP)
  const handleBulkExport = async () => {
     const svgEl = validateMapStatus();
     if (!svgEl) return;
     
     const bulkSignature = `bulk-10-${countryName}`;
     if (exportedSignatures.has(bulkSignature)) {
         const proceed = window.confirm("You've already exported all styles for this country. Export again?");
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
           
           const clone = svgEl.cloneNode(true);
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
        alert("Bulk export failed. Please try again.");
     } finally {
       setIsExporting(false);
     }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col gap-2 relative z-50">
        
        {isOpen && isValidToExport && (
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
            {animationEnabled && (
                <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-1">
                  <span className="text-[9px] uppercase px-2 mb-1 text-violet-400 font-bold tracking-widest">Video Outputs</span>
                  <button onClick={() => { setIsOpen(false); handleVideoExport(5); }} className="py-3 px-4 rounded-lg bg-violet-500/10 hover:bg-violet-500/30 text-left text-[11px] font-bold uppercase tracking-wider text-violet-200 transition-colors flex items-center justify-between border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] group">
                    <div className="flex items-center gap-3">
                      <span className="text-violet-400 text-lg group-hover:scale-110 transition-transform">🎥</span> 4K Animation (MP4)
                    </div>
                    <span className="text-[9px] font-mono text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded">5s</span>
                  </button>
                  <button onClick={() => { setIsOpen(false); handleVideoExport(10); }} className="py-2 px-4 rounded-lg bg-violet-500/5 hover:bg-violet-500/20 text-left text-[10px] font-bold uppercase tracking-wider text-violet-300 transition-colors flex items-center justify-between border border-violet-500/10">
                    <div className="flex items-center gap-3">
                      <span className="text-violet-500/50 text-base">⏱️</span> 4K Animation (Extended)
                    </div>
                    <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">10s</span>
                  </button>
                </div>
            )}
          </div>
        )}

        <button
          onClick={() => {
             initializeMetadata();
             setIsOpen(!isOpen);
          }}
          disabled={!isValidToExport || isExporting}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            (!isValidToExport || isExporting)
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-white/10 hover:bg-[#1877F2] text-white hover:-translate-y-1'
          }`}
        >
          {isExporting ? (
            <>
              {videoProgress && !videoProgress.finishing ? (
                 <div className="flex flex-col items-center gap-1 w-full px-4">
                    <div className="flex justify-between w-full text-[9px] font-mono text-violet-300">
                      <span>Rendering 4K MP4</span>
                      <span>{videoProgress.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                       <div className="h-full bg-violet-500 transition-all duration-75" style={{ width: `${videoProgress.percent}%` }}></div>
                    </div>
                 </div>
              ) : videoProgress && videoProgress.finishing ? (
                 <>
                    <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                    Finishing MP4...
                 </>
              ) : (
                 <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exporting...
                 </>
              )}
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
          disabled={!isValidToExport || isExporting}
          className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2 shadow-lg ${
            (!isValidToExport || isExporting)
              ? 'bg-transparent border-gray-800 text-gray-700 cursor-not-allowed hidden'
              : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 hover:-translate-y-0.5'
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
