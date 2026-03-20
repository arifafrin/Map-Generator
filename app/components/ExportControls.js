'use client';

import { useState } from 'react';
import { downloadSVGFile, generatePNGBlob, buildStockReadySVG, downloadZIPPackage } from '../utils/svgExport';
import MetadataPanel from './MetadataPanel';
import { generateMetadataSet } from '../utils/seoUtils';
import { mapStyles, aiColorThemes } from '../utils/colorUtils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function ExportControls({ svgRef, geoData, countryName, selectedStyle, hasLabels }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportedSignatures, setExportedSignatures] = useState(new Set());
  
  // Custom overriding metadata state locally before ZIP
  const [currentMetadata, setCurrentMetadata] = useState(null);

  // Initialize metadata state
  const initializeMetadata = () => {
     if (!currentMetadata && countryName) {
        setCurrentMetadata(generateMetadataSet(countryName, selectedStyle, hasLabels));
     }
  };

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
      await downloadZIPPackage(svgRef, meta, getSaneFileName());
      setExportedSignatures(prev => new Set(prev).add(signature));
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export Zip package. Check console for details.");
    } finally {
      setIsExporting(false);
      setShowPreview(false);
    }
  };

  // 2. Handle simple standalone SVG download
  const handleSvgExport = async () => {
    if (!validateMapStatus()) return;
    setIsExporting(true);
    
    // Process SVG identically for stock readiness
    const svgString = await buildStockReadySVG(svgRef, countryName, { stripLabels: false });
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
     setShowPreview(false); // Hide standard preview
     
     try {
       const zip = new JSZip();
       const baseName = countryName ? countryName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'map';
       const stockFolder = zip.folder(`${baseName}-premium-10-pack`);
       
       // Cycle through 10 distinct, highly marketable aesthetic combinations
       const variations = [
          { name: '01-BestSeller-Minimal', styleId: 'minimal', colors: mapStyles.minimal.regionColors, bg: '#ffffff', strokeWidth: 1 },
          { name: '02-Monochrome-Print', styleId: 'monochrome', colors: mapStyles.monochrome.regionColors, bg: '#ffffff', strokeWidth: 1 },
          { name: '03-Trending-Vibrant', styleId: 'colorful', colors: aiColorThemes.vibrant, bg: '#ffffff', strokeWidth: 1 },
          { name: '04-Soft-Pastel-Wash', styleId: 'watercolor', colors: mapStyles.watercolor.regionColors, bg: '#ffffff', strokeWidth: 1 },
          { name: '05-Vintage-Editorial', styleId: 'vintage', colors: mapStyles.vintage.regionColors, bg: '#f4ecd8', strokeWidth: 1 },
          { name: '06-Clean-Outline', styleId: 'outline', colors: ['transparent'], bg: '#ffffff', strokeWidth: 1 },
          { name: '07-Antique-Travel', styleId: 'antique', colors: mapStyles.antique.regionColors, bg: '#d4b483', strokeWidth: 0.8 },
          { name: '08-Heat-Map-Dataviz', styleId: 'heatmap', colors: mapStyles.heatmap.regionColors, bg: '#ffffff', strokeWidth: 0.5 },
          { name: '09-Solid-Silhouette', styleId: 'silhouette', colors: mapStyles.silhouette.regionColors, bg: '#ffffff', strokeWidth: 0 },
          { name: '10-Pastel-Flat-Trendy', styleId: 'pastelflat', colors: mapStyles.pastelflat.regionColors, bg: '#ffffff', strokeWidth: 0.6 },
       ];
       
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
       saveAs(content, `${baseName}-premium-10-collection.zip`);
       setExportedSignatures(prev => new Set(prev).add(bulkSignature));
       
     } catch (err) {
       console.error("Bulk Generation Failed", err);
       alert("Failed to build Bulk Collection.");
     } finally {
       setIsExporting(false);
     }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
             initializeMetadata();
             setShowPreview(true);
          }}
          disabled={!geoData || isExporting}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            !geoData || isExporting
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5'
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Packaging...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Stock Package
            </>
          )}
        </button>
        
        <button
          onClick={handleBulkExport}
          disabled={!geoData || isExporting}
          className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2 shadow-lg ${
            !geoData || isExporting
              ? 'bg-transparent border-gray-800 text-gray-700 cursor-not-allowed hidden'
              : 'bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/30 text-orange-400 hover:from-orange-500/20 hover:to-pink-500/20 hover:border-orange-500/60 shadow-orange-500/10 hover:shadow-orange-500/20'
          }`}
          title="Generates 10 distinct top-selling aesthetic variations in one MEGA ZIP."
        >
          <span className="text-xl -mt-1">🚀</span>
          Generate 10 Variations
        </button>
      </div>

      {/* Export Review Modal */}
      {showPreview && geoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">📦</span> Stock Export Review
              </h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex">
              
              {/* Left Column: Metadata Panel */}
              <div className="w-1/2 p-6 border-r border-white/5 bg-black/20 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Stock Ready Vector
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex gap-2"><span className="text-purple-400">✓</span> No inline CSS React styles</li>
                    <li className="flex gap-2"><span className="text-purple-400">✓</span> Organized layer {'<g>'} groups</li>
                    <li className="flex gap-2"><span className="text-purple-400">✓</span> High-res 300dpi Preview PNG</li>
                    <li className="flex gap-2"><span className="text-purple-400">✓</span> Zero copyright data / logos</li>
                  </ul>
                </div>

                <div className="flex-1">
                  <MetadataPanel 
                    countryName={countryName}
                    styleId={selectedStyle}
                    hasLabels={hasLabels}
                    onMetadataChange={(meta) => setCurrentMetadata(meta)}
                  />
                </div>
              </div>

              {/* Right Column: Mini Preview & Downloads */}
              <div className="w-1/2 p-6 flex flex-col gap-6">
                
                <div className="bg-black/40 rounded-xl aspect-video border border-white/5 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[9px] uppercase font-mono tracking-widest text-gray-400">
                    Aspect Render
                  </div>
                  {/* Miniature clone of current svg simply scaled down visually */}
                  <div className="w-3/4 h-3/4 flex items-center justify-center opacity-80" dangerouslySetInnerHTML={{ __html: svgRef ? new XMLSerializer().serializeToString(svgRef) : '' }} style={{ pointerEvents: 'none' }} />
                </div>
                
                <div className="flex flex-col gap-3 mt-auto">
                    <button
                      onClick={handleStockZipExport}
                      className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20"
                    >
                      ↓ Download Complete Stock ZIP
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleSvgExport}
                        className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20"
                      >
                        SVG Only
                      </button>
                      <button
                        onClick={handlePngExport}
                        className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20"
                      >
                        PNG Only
                      </button>
                    </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
