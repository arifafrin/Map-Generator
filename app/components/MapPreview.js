'use client';

import { useRef, useEffect, useMemo, useState, memo } from 'react';
import { processGeoData } from '../utils/geoUtils';
import { mapStyles } from '../utils/colorUtils';

export default memo(function MapPreview({ 
  geoData, 
  style, 
  colors, 
  selectedRegion, 
  onRegionSelect, 
  onSvgRef,
  bgMode = 'style-default',
  customBgColor = '#ffffff',
  layout = 'landscape',
  showLabels = false,
  showTitle = true,
  borderWidth = null,
  debugMode = false,
  countryName = 'Country',
  stockMode = false,
  includeIslands = true,
  dotSize = 3,
  atomX = 50,
  atomY = 50,
  atomSize = 32,
  electronCount = 12,
  pinEnabled = false,
  pinSize = 36,
  pinColor = '#ef4444',
  countryIso2 = null
}) {
  const svgRef = useRef(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [vectorFlagInfo, setVectorFlagInfo] = useState(null);

  const dimensions = useMemo(() => {
    switch(layout) {
      case 'square': return { width: 1200, height: 1200 };
      case 'portrait': return { width: 900, height: 1200 };
      case 'landscape': 
      default: return { width: 1200, height: 900 };
    }
  }, [layout]);

  // PAN & ZOOM STATE
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // PENCIL DRAWING STATE
  const [drawnPaths, setDrawnPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);

  // Clear pencil drawings when leaving pencil style
  useEffect(() => {
    if (!mapStyles[style]?.isPencil) {
      setDrawnPaths([]);
      setCurrentPath(null);
    }
  }, [style]);

  // GEO WORKER STATE
  const [processedData, setProcessedData] = useState({ groups: [], debugBounds: null });
  const [isProcessingGeo, setIsProcessingGeo] = useState(false);
  const workerRef = useRef(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/geoWorker.js', import.meta.url));
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Reset transform when dimensions or geoData changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, [geoData, dimensions]);

  // Native wheel event hook to prevent scrolling while zooming
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform(prev => {
        const svgRect = svgEl.getBoundingClientRect();
        const pointerX = e.clientX - svgRect.left;
        const pointerY = e.clientY - svgRect.top;
        
        const viewBoxW = dimensions.width;
        const viewBoxH = dimensions.height;
        const logicalX = (pointerX / svgRect.width) * viewBoxW;
        const logicalY = (pointerY / svgRect.height) * viewBoxH;

        const newK = Math.max(0.1, Math.min(prev.k * scaleFactor, 30));
        const ratio = newK / prev.k;
        
        const newX = logicalX - (logicalX - prev.x) * ratio;
        const newY = logicalY - (logicalY - prev.y) * ratio;

        return { x: newX, y: newY, k: newK };
      });
    };
    svgEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => svgEl.removeEventListener('wheel', handleWheel);
  }, [dimensions]);

  const handlePointerDown = (e) => {
    if (mapStyles[style]?.isPencil) {
       setIsDrawingShape(true);
       const svgRect = svgRef.current.getBoundingClientRect();
       const logicalX = ((e.clientX - svgRect.left) / svgRect.width) * dimensions.width;
       const logicalY = ((e.clientY - svgRect.top) / svgRect.height) * dimensions.height;
       const canvasX = (logicalX - transform.x) / transform.k;
       const canvasY = (logicalY - transform.y) / transform.k;
       setCurrentPath([{ x: canvasX, y: canvasY }]);
       e.target.setPointerCapture(e.pointerId);
       return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (mapStyles[style]?.isPencil && isDrawingShape && currentPath) {
       const svgRect = svgRef.current.getBoundingClientRect();
       const logicalX = ((e.clientX - svgRect.left) / svgRect.width) * dimensions.width;
       const logicalY = ((e.clientY - svgRect.top) / svgRect.height) * dimensions.height;
       const canvasX = (logicalX - transform.x) / transform.k;
       const canvasY = (logicalY - transform.y) / transform.k;
       
       setCurrentPath(prev => {
          if (!prev || prev.length === 0) return [{x: canvasX, y: canvasY}];
          const last = prev[prev.length - 1];
          const dx = canvasX - last.x;
          const dy = canvasY - last.y;
          if (dx*dx + dy*dy > 16) { // 4px distance limit
             return [...prev, {x: canvasX, y: canvasY}];
          }
          return prev;
       });
       return;
    }
    if (!isDragging) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const logicalDx = ((e.clientX - dragStart.x) / svgRect.width) * dimensions.width;
    const logicalDy = ((e.clientY - dragStart.y) / svgRect.height) * dimensions.height;
    
    setTransform(prev => ({ ...prev, x: prev.x + logicalDx, y: prev.y + logicalDy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (mapStyles[style]?.isPencil && isDrawingShape) {
       setIsDrawingShape(false);
       if (currentPath && currentPath.length > 2) {
          let isClosed = false;
          const start = currentPath[0];
          const end = currentPath[currentPath.length - 1];
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          if (dx*dx + dy*dy < 400) { // closing radius of 20px
             isClosed = true;
          }
          setDrawnPaths(prev => [...prev, { points: currentPath, isClosed }]);
       }
       setCurrentPath(null);
       e.target.releasePointerCapture(e.pointerId);
       return;
    }
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Download pure SVG geometry for the flag natively
  useEffect(() => {
    if (countryIso2 && !['bd', 'pw', 'jp'].includes(countryIso2)) {
       fetch(`https://flagcdn.com/${countryIso2}.svg`)
         .then(res => res.text())
         .then(text => {
             let replacedText = text;
             
             // --- STOCK VECTOR CORE OPTIMIZER: FLATTEN INTERSECTING STARS ---
             // FlagCDN (from Wikipedia sources) heavily optimizes stars mathematically by crossing their paths!
             // This results in self-intersecting un-mergeable paths in Adobe Illustrator Pathfinder. 
             // We strategically map these exact internet strings to pristine pre-calculated 10-point un-intersected hulls!
             
             // USA 5-point star path (Intersecting) -> 10-point polygon (Unite/Merge safe)
             replacedText = replacedText.replace(
                /d="m247 90 70\.534 217\.082-184\.66-134\.164h228\.253L176\.466 307\.082z"/g, 
                'd="M 247,90 L 271.365,165.023 L 350.292,165.023 L 286.463,211.396 L 310.828,286.419 L 247,240.046 L 183.172,286.419 L 207.537,211.396 L 143.708,165.023 L 222.635,165.023 Z"'
             );
             // China 5-point star path
             replacedText = replacedText.replace(
                /d="m0-30 17\.634 54\.27-46\.166-33\.54h57\.064l-46\.166 33\.54Z"/g, 
                'd="M 0,-30 L 6.733,-9.27 L 28.531,-9.27 L 10.899,3.541 L 17.633,24.27 L 0,11.459 L -17.633,24.27 L -10.899,3.541 L -28.531,-9.27 L -6.733,-9.27 Z"'
             );
             // Vietnam 5-point star path
             replacedText = replacedText.replace(
                /d="m15 4-3\.53 10\.85 9\.24-6\.7H9\.29l9\.24 6\.7z"/g, 
                'd="M 15,4 L 16.795,9.528 L 22.608,9.528 L 17.906,12.944 L 19.702,18.472 L 15,15.056 L 10.298,18.472 L 12.094,12.944 L 7.392,9.528 L 13.205,9.528 Z"'
             );

             const parser = new DOMParser();
             const doc = parser.parseFromString(replacedText, 'image/svg+xml');

             const svgEl = doc.documentElement;
             const viewBoxAttr = svgEl.getAttribute('viewBox') || '0 0 640 480';
             const [vx, vy, vw, vh] = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
             
             // Mathematically compute robust exact "xMidYMid slice" transform geometry to eliminate Nested SVG Viewports
             const targetW = 12;
             const targetH = 12;
             const scale = Math.max(targetW / vw, targetH / vh);
             const scaledW = vw * scale;
             const scaledH = vh * scale;
             
             // Offset to absolute center of the -6, -6 boundary box
             const tx = -6 - ((scaledW - targetW) / 2) - (vx * scale);
             const ty = -6 - ((scaledH - targetH) / 2) - (vy * scale);
             const transformStr = `translate(${tx.toFixed(4)}, ${ty.toFixed(4)}) scale(${scale.toFixed(6)})`;

             let html = '';
             Array.from(svgEl.childNodes).forEach(node => {
                if (node.nodeType === 1) html += node.outerHTML;
             });
             setVectorFlagInfo({ viewBox: viewBoxAttr, html, transformStr });
         })
         .catch(e => {
            // Silently swallow fetch errors so Next.js dev server doesn't throw a red ErrorBoundary overlay
            setVectorFlagInfo(null);
         });
    } else {
       setVectorFlagInfo(null);
    }
  }, [countryIso2]);

  // dimensions moved to the top

  useEffect(() => {
    if (svgRef.current && onSvgRef) {
      onSvgRef(svgRef.current);
    }
  }, [geoData, onSvgRef, dimensions, style, colors, bgMode, showLabels, borderWidth, dotSize, pinEnabled, pinSize, pinColor, countryIso2]);

  const styleConfig = mapStyles[style] || mapStyles.colorful;
  const backgroundColor = bgMode === 'transparent' 
    ? 'transparent' 
    : (bgMode === 'custom' ? customBgColor : styleConfig.background);

  // Core d3-geo rendering pipeline
  // Handle Worker Execution
  useEffect(() => {
    if (!geoData || !workerRef.current) {
      setProcessedData({ groups: [], debugBounds: null });
      return;
    }
    
    setIsProcessingGeo(true);
    const msgId = Date.now().toString() + Math.random().toString();
    
    const handleMessage = (e) => {
      if (e.data.msgId === msgId) {
        if (e.data.error) {
          console.error("GeoWorker Error:", e.data.error);
        } else {
          setProcessedData(e.data.result || { groups: [], debugBounds: null });
        }
        setIsProcessingGeo(false);
        workerRef.current.removeEventListener('message', handleMessage);
      }
    };
    
    workerRef.current.addEventListener('message', handleMessage);
    workerRef.current.postMessage({
      msgId,
      geoData,
      width: dimensions.width,
      height: dimensions.height,
      padding: stockMode ? 100 : 40, // Re-added stockMode logic for padding
      colors,
      styleConfig,
      includeIslands
    });
    
    return () => {
      workerRef.current?.removeEventListener('message', handleMessage);
    };
  }, [geoData, dimensions, colors, styleConfig, includeIslands, stockMode]); // Added stockMode to dependencies

  const { groups, debugBounds } = processedData;

  // Flatten all paths for tooltip lookup and synthesis for Pencil styles
  const allPaths = useMemo(() => {
     let _paths = [];
     if (groups) _paths = _paths.concat(groups.flatMap(g => g.paths));
     
     if (styleConfig.isPencil) {
         drawnPaths.forEach((pathObj, i) => {
             const d = 'M ' + pathObj.points.map(pt => `${parseFloat(pt.x.toFixed(2))},${parseFloat(pt.y.toFixed(2))}`).join(' L ') + (pathObj.isClosed ? ' Z' : '');
             _paths.push({
                 id: `drawn-${i}`, index: 1000 + i, name: 'Drawn Layer',
                 d, centroid: null, fillColor: 'transparent'
             });
         });
         if (currentPath && currentPath.length > 0) {
             const d = 'M ' + currentPath.map(pt => `${parseFloat(pt.x.toFixed(2))},${parseFloat(pt.y.toFixed(2))}`).join(' L ');
             _paths.push({
                 id: `drawn-curr`, index: 9999, name: 'Drawing...',
                 d, centroid: null, fillColor: 'transparent'
             });
         }
     }
     return _paths;
  }, [groups, drawnPaths, currentPath, styleConfig.isPencil]);

  // AUTO-STROKE: Adapt border width based on region density
  const autoStrokeWidth = useMemo(() => {
    const regionCount = allPaths.length;
    if (regionCount > 150) return 0.2;
    if (regionCount > 100) return 0.3;
    if (regionCount > 50) return 0.4;
    return null;
  }, [allPaths.length]);

  const userStroke = borderWidth !== null ? borderWidth : styleConfig.strokeWidth;
  const finalStrokeWidth = styleConfig.strokeWidth === 0 
    ? 0 
    : (autoStrokeWidth !== null ? Math.min(userStroke, autoStrokeWidth) : userStroke);

  const defs = (
    <defs>
      {styleConfig.glow && (
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      {styleConfig.isNetwork && (
        <filter id="atomGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      {styleConfig.isBlueprint && (
        <pattern id="blueprintGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          {/* Major grid lines */}
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3a7bd5" strokeWidth="0.5" opacity="0.4"/>
          {/* Minor grid lines */}
          <path d="M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40 M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30" 
                fill="none" stroke="#3a7bd5" strokeWidth="0.2" opacity="0.2"/>
        </pattern>
      )}
      {styleConfig.isSketch && (
        <filter id="sketchEffect" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="2" result="noiseOut" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="noiseOut" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      )}
      {styleConfig.isGradientFill && allPaths.map((p, i) => (
        <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.fillColor} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
      ))}
      {styleConfig.isDotted && allPaths.map((p, i) => {
        const spacing = dotSize * 3;
        return (
          <pattern key={`dot-${i}`} id={`dot-${i}`} x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            {/* Removed the opaque white rect to prevent raster artifact effect and allow underlying background to show */}
            <circle cx={spacing/2} cy={spacing/2} r={dotSize * 0.45} fill={p.fillColor} />
          </pattern>
        );
      })}
      
      {/* Universal ClipPath for all flag instances inside pins */}
      <clipPath id="global-flag-clip">
        <circle cx="0" cy="0" r="4.8" />
      </clipPath>
    </defs>
  );

  const renderPath = (path, globalIdx) => {
    if (!path.d) return null;
    
    const isSelected = selectedRegion === path.index;
    const isHovered = hoveredRegion === path.index;
    
    let displayFill = path.fillColor;
    if (styleConfig.isGradientFill) displayFill = `url(#grad-${globalIdx})`;
    if (styleConfig.isDotted) displayFill = `url(#dot-${globalIdx})`;
    if (isSelected && !styleConfig.isOutlineOnly) displayFill = '#ffd700';
    
    const displayStroke = isHovered ? '#ffffff' : styleConfig.stroke;
    const filterUrl = styleConfig.glow && (isHovered || isSelected) 
      ? 'url(#neonGlow)' 
      : styleConfig.isSketch ? 'url(#sketchEffect)' : 'none';

    return (
      <path
        key={`path-${path.index}`}
        id={path.id}
        d={path.d}
        fill={displayFill}
        stroke={displayStroke}
        strokeWidth={finalStrokeWidth}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="transition-all duration-300 cursor-pointer"
        style={{
          opacity: isHovered && !styleConfig.glow ? 0.85 : 1,
          filter: filterUrl,
        }}
        onMouseEnter={() => setHoveredRegion(path.index)}
        onMouseLeave={() => setHoveredRegion(null)}
        onClick={() => onRegionSelect && onRegionSelect(path.index)}
      >
        <title>{path.name}</title>
      </path>
    );
  };

  const renderLabel = (path) => {
    if (!path.centroid) return null;
    const totalPaths = allPaths.length;
    const fontSize = totalPaths > 30 ? "6px" : totalPaths > 15 ? "9px" : "12px";
    
    // In outline mode or transparent mode, we need to ensure the label is visible 
    // against the user's actual web page background, which we default to assuming is light/dark depending on the system
    // We'll enforce a highly visible label color for "outline" style.
    const isOutline = styleConfig.isOutlineOnly;
    const labelColor = isOutline ? '#666666' : styleConfig.fontColor;
    const shadowColor = isOutline 
      ? 'rgba(255,255,255,0.8)' // White halo for dark text on outline maps
      : (styleConfig.background !== 'transparent' ? styleConfig.background : 'rgba(0,0,0,0.5)');

    return (
      <text
        key={`label-${path.index}`}
        x={path.centroid.x}
        y={path.centroid.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontFamily={styleConfig.fontFamily}
        fontSize={fontSize}
        fontWeight="bold"
        style={{
          pointerEvents: 'none',
          textShadow: `0px 0px 4px ${shadowColor}, 0px 0px 2px ${shadowColor}`,
        }}
      >
        {path.name}
      </text>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-transparent">
      {(!geoData && !styleConfig.isPencil) ? (
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
              <path d="M4 14l20 10 20-10M24 24v20" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Select a country to generate</p>
            <p className="text-xs text-gray-600 mt-1">Choose from the panel on the left</p>
          </div>
        </div>
      ) : isProcessingGeo && groups.length === 0 ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505]/40 backdrop-blur-sm">
           <div className="w-12 h-12 border-[3px] border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]"></div>
           <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-400 mt-4 animate-pulse">Processing Topology...</p>
        </div>
      ) : (
        <svg
          id="map-canvas"
          ref={(el) => {
            svgRef.current = el;
            if (onSvgRef) onSvgRef(el);
          }}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          xmlns="http://www.w3.org/2000/svg"
          className={`max-w-full max-h-full transition-all duration-300 origin-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ background: backgroundColor, touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {defs}
          
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Blueprint grid background — renders engineering paper texture */}
          {styleConfig.isBlueprint && (
            <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#blueprintGrid)" />
          )}

          {/* Render each group (mainland, alaska, hawaii for USA — or single group for others) */}
          <g id="map-regions">
            {groups.map((group) => {
              let globalIdx = 0;
              return (
                <g key={group.id} id={group.id} transform={group.transform || ''}>
                  {group.paths.map((path) => {
                    const el = renderPath(path, globalIdx);
                    globalIdx++;
                    return el;
                  })}
                </g>
              );
            })}
            
            {/* Direct pencil geometry render bypass */}
            {styleConfig.isPencil && allPaths.filter(p => `${p.id}`.startsWith('drawn')).map((path, idx) => {
               return renderPath(path, 1000 + idx);
            })}
          </g>


          {/* Abstract Global Network Overlay — Single Large Atom */}
          {styleConfig.isNetwork && (
            <g id="network-overlay">
              
              {/* ONE Large Atom positioned by user controls */}
              {(() => {
                const cx = dimensions.width * (atomX / 100);
                const cy = dimensions.height * (atomY / 100);
                const color = colors[0] || '#ff4500';
                const color2 = colors[1] || colors[0] || '#ff6a00';
                const color3 = colors[2] || colors[0] || '#ff8c00';
                const orbitColors = [color, color2, color3];
                const atomR = Math.min(dimensions.width, dimensions.height) * (atomSize / 100);
                const orbits = 3;
                const seed = countryName.length || 5;
                return (
                  <g filter="url(#atomGlow)">
                    {/* 3 Orbital ellipses at different angles */}
                    {Array.from({ length: orbits }).map((_, o) => (
                      <ellipse
                        key={`orbit-${o}`}
                        cx={cx} cy={cy}
                        rx={atomR} ry={atomR * 0.38}
                        fill="none" stroke={orbitColors[o % orbitColors.length]}
                        strokeWidth="1.5"
                        opacity="0.55"
                        transform={`rotate(${o * 60}, ${cx}, ${cy})`}
                      />
                    ))}
                    {/* Nucleus — solid circle in center */}
                    <circle cx={cx} cy={cy} r={atomR * 0.07} fill={color} opacity="0.95" />
                    <circle cx={cx} cy={cy} r={atomR * 0.12} fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
                    {/* Electron dots — distributed along the orbits to match joints */}
                    {Array.from({ length: electronCount }).map((_, i) => {
                      // Distribute electrons evenly among the orbits
                      const orbitIndex = i % orbits;
                      // Determine the parametric angle for this electron on its specific orbit
                      // If we have 12 electrons and 3 orbits, that's 4 per orbit -> 0, 90, 180, 270 deg.
                      // The 90 and 270 degree positions naturally align with the orbit intersections near the center.
                      const electronsPerOrbit = electronCount / orbits;
                      const baseAngle = (Math.floor(i / orbits) * (360 / electronsPerOrbit));
                      const angle = ((baseAngle + (orbitIndex * 30) + (seed * 10)) % 360) * (Math.PI / 180);
                      
                      const localX = Math.cos(angle) * atomR;
                      const localY = Math.sin(angle) * atomR * 0.38;
                      const rad = orbitIndex * 60 * (Math.PI / 180);
                      const rx = localX * Math.cos(rad) - localY * Math.sin(rad);
                      const ry = localX * Math.sin(rad) + localY * Math.cos(rad);
                      
                      return (
                        <circle
                          key={`elec-${i}`}
                          cx={cx + rx} cy={cy + ry}
                          r={atomR * 0.025} 
                          fill={orbitColors[orbitIndex % orbitColors.length]} 
                          opacity="0.95"
                        />
                      );
                    })}
                  </g>
                );
              })()}
            </g>
          )}

          {/* Abstract Global Network Overlay — Neural Point Mesh */}
          {styleConfig.isNeuralMesh && (
            <g id="neural-mesh-overlay">
              {(() => {
                 // 1. Gather all state/region centroids as indestructible primary anchor nodes
                 const nodes = [];
                 allPaths.forEach((p) => {
                     // Always prioritize the native D3 mathematical spherical center
                     if (p && p.centroid && p.centroid.x && p.centroid.y) {
                         nodes.push({ x: p.centroid.x, y: p.centroid.y, regionIdx: p.index, isCentroid: true });
                     } else if (p && p.d) {
                         // FAILSAFE: Unconditionally compute absolute center via raw SVG geographic boundaries
                         const coords = p.d.match(/-?[\d.]+/g);
                         if (coords && coords.length >= 2) {
                             let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                             for (let i = 0; i < coords.length; i += 2) {
                                 const nx = parseFloat(coords[i]);
                                 const ny = parseFloat(coords[i + 1]);
                                 if (nx < minX) minX = nx;
                                 if (ny < minY) minY = ny;
                                 if (nx > maxX) maxX = nx;
                                 if (ny > maxY) maxY = ny;
                             }
                             if (minX !== Infinity) {
                                 const absoluteX = (minX + maxX) / 2;
                                 const absoluteY = (minY + maxY) / 2;
                                 nodes.push({ x: absoluteX, y: absoluteY, regionIdx: p.index, isCentroid: true });
                             }
                         }
                     }
                 });
                 
                 // 2. Extract perimeter vertices to perfectly outline the active geographic territory
                 const perimeters = [];
                 const polygons = [];
                 let globalMinX = Infinity, globalMinY = Infinity, globalMaxX = -Infinity, globalMaxY = -Infinity;

                 allPaths.forEach(p => {
                     if (!p.d) return;
                     // Extract discrete Line and Move coordinate pairs from the raw SVG string
                     const matches = p.d.match(/[ML]\s*(-?[\d.]+)[,\s]+(-?[\d.]+)/g);
                     if (matches && matches.length > 0) {
                         const vertices = [];
                         let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                         
                         // Radically increase boundary extraction resolution so the strict map silhouette is perfectly preserved
                         const step = Math.max(1, Math.floor(matches.length / 500));
                         
                         for (let i = 0; i < matches.length; i++) {
                             const coords = matches[i].match(/-?[\d.]+/g);
                             if (coords && coords.length >= 2) {
                                 const x = parseFloat(coords[0]), y = parseFloat(coords[1]);
                                 vertices.push({x, y});
                                 if (x < minX) minX = x; if (y < minY) minY = y;
                                 if (x > maxX) maxX = x; if (y > maxY) maxY = y;
                                 if (x < globalMinX) globalMinX = x; if (y < globalMinY) globalMinY = y;
                                 if (x > globalMaxX) globalMaxX = x; if (y > globalMaxY) globalMaxY = y;
                                 
                                 // Forcefully push highly dense perimeter dots (culling will organically space them)
                                 if (i % step === 0) perimeters.push({ x, y, regionIdx: p.index });
                             }
                         }
                         polygons.push({ vertices, minX, minY, maxX, maxY, regionIdx: p.index });
                     }
                 });

                 // 3. Internally matrix-fill massive continuous regions utilizing Ray-Casting Polygon math
                 const internalMatrix = [];
                 if (globalMinX !== Infinity && globalMaxX !== -Infinity) {
                     const gridStep = Math.max(12, atomSize * 0.6); // Drives visual node gap tightly 
                     for (let gx = globalMinX; gx <= globalMaxX; gx += gridStep) {
                         for (let gy = globalMinY; gy <= globalMaxY; gy += gridStep) {
                             
                             // Introduce microscopic grid jitter for a truly organic matrix alignment
                             const pseudoRandX = Math.abs(Math.sin(gx * 12.9 + gy * 78.2)) * 437.5;
                             const pseudoRandY = Math.abs(Math.cos(gx * 4.1 + gy * 43.1)) * 437.5;
                             const jX = gx + (pseudoRandX % 1 - 0.5) * (gridStep * 0.8);
                             const jY = gy + (pseudoRandY % 1 - 0.5) * (gridStep * 0.8);

                             // Hyper-fast raycast math matching
                             let matchedRegion = null;
                             for (let poly of polygons) {
                                 // Instantly reject points violating crude structural bounding box
                                 if (jX < poly.minX || jX > poly.maxX || jY < poly.minY || jY > poly.maxY) continue;
                                 let inside = false;
                                 for (let i = 0, j = poly.vertices.length - 1; i < poly.vertices.length; j = i++) {
                                     const xi = poly.vertices[i].x, yi = poly.vertices[i].y;
                                     const xj = poly.vertices[j].x, yj = poly.vertices[j].y;
                                     const intersect = ((yi > jY) !== (yj > jY)) && (jX < (xj - xi) * (jY - yi) / (yj - yi) + xi);
                                     if (intersect) inside = !inside;
                                 }
                                 if (inside) {
                                     matchedRegion = poly.regionIdx;
                                     break;
                                 }
                             }
                             if (matchedRegion !== null) {
                                 internalMatrix.push({ x: jX, y: jY, regionIdx: matchedRegion, isCentroid: false });
                             }
                         }
                     }
                 }
                 
                 // Aggregate and apply strict spatial distance culling (Pythagorean Overlap Prevention)
                 // Critically preserve Coastlines by culling internal dots if they breach perimeter space!
                 const rawNodes = [...nodes, ...perimeters, ...internalMatrix];
                 const finalNodes = [];
                 // Cull distance derived seamlessly from user UI Density slider (atomSize)
                 const cullDist = atomSize * 0.5;
                 
                 for (let pt of rawNodes) {
                     let tooClose = false;
                     for (let f of finalNodes) {
                         const dx = pt.x - f.x;
                         const dy = pt.y - f.y;
                         if (Math.sqrt(dx*dx + dy*dy) < cullDist) { 
                            // Centroids are geometrically critical, always preserve them
                            if (!pt.isCentroid) tooClose = true; 
                            break; 
                         }
                     }
                     if (!tooClose) finalNodes.push(pt);
                 }

                 // 3. Draw Constrained Interaction Beams (Triangular connections)
                 // Beam reach derived from UI Connectivity slider (electronCount)
                 const connectDist = cullDist * (1.2 + (electronCount / 8));
                 const lines = [];
                 
                 for (let i = 0; i < finalNodes.length; i++) {
                     for (let j = i + 1; j < finalNodes.length; j++) {
                         const n1 = finalNodes[i];
                         const n2 = finalNodes[j];
                         const dx = n1.x - n2.x;
                         const dy = n1.y - n2.y;
                         const dist = Math.sqrt(dx*dx + dy*dy);
                         
                         if (dist < connectDist) {
                             const distSq = dist * dist;
                             // Gabriel Graph Core condition:
                             // Imagine a geometric circle whose diameter is exactly the line connecting n1 and n2.
                             // If ANY other node (n3) exists inside that circle, this connection is blocked!
                             // This mathematically guarantees a 100% clean, non-intersecting triangular planar graph!
                             const midX = n1.x - (dx / 2.0);
                             const midY = n1.y - (dy / 2.0);
                             const radSq = distSq / 4.0;
                             
                             let isPlanar = true;
                             for (let k = 0; k < finalNodes.length; k++) {
                                 if (k === i || k === j) continue;
                                 const n3 = finalNodes[k];
                                 
                                 // Blazing fast generic bounding-box reject to save intense CPU floating-point calculations
                                 if (Math.abs(n3.x - midX) > dist || Math.abs(n3.y - midY) > dist) continue;
                                 
                                 if (((n3.x - midX)**2 + (n3.y - midY)**2) <= radSq) {
                                     isPlanar = false;
                                     break;
                                 }
                             }
                             
                             if (isPlanar) {
                                 // Subtle alpha decay for aesthetic depth, but keep lines uniformly thick
                                 const opacity = Math.max(0.15, 1 - (dist / connectDist));
                                 
                                 const baseBorder = borderWidth > 0 ? borderWidth : 0.8;
    
                                 // Inherit explicit state/country palette color
                                 const regionColor = colors[(n1.regionIdx || 0) % (colors.length || 1)] || '#888';
                                 
                                 lines.push(
                                    <line 
                                       key={`mesh-ln-${i}-${j}`} 
                                       x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
                                       stroke={regionColor} 
                                       strokeWidth={baseBorder}
                                       opacity={opacity}
                                    />
                                 );
                             }
                         }
                     }
                 }

                 return (
                    <g className="pointer-events-none transition-all duration-500">
                      <g id="mesh-lines">{lines}</g>
                      <g id="mesh-nodes">
                        {finalNodes.map((n, i) => {
                           const regionColor = colors[(n.regionIdx || 0) % (colors.length || 1)] || '#888';
                           const baseRadius = dotSize > 0 ? dotSize : 2.5;

                           return (
                               <circle 
                                  key={`mesh-nd-${i}`} 
                                  cx={n.x} cy={n.y} 
                                  r={baseRadius} 
                                  fill={regionColor} 
                                  stroke="#ffffff"
                                  strokeWidth={borderWidth > 0 ? borderWidth * 0.5 : 0.5}
                               />
                           );
                        })}
                      </g>
                    </g>
                 );
              })()}
            </g>
          )}

          {/* Map Title Overlay */}
          {showTitle && countryName && (
            <g id="map-title" className="pointer-events-none">
              <text 
                x={dimensions.width / 2} 
                y={dimensions.height - 30} 
                textAnchor="middle" 
                fill={styleConfig.fontColor} 
                fontFamily={styleConfig.fontFamily} 
                fontSize="18px" 
                fontWeight="900"
                letterSpacing="2px"
                style={{ 
                  textShadow: styleConfig.background !== 'transparent' 
                    ? `0px 2px 8px ${styleConfig.background}`
                    : '0px 2px 8px rgba(0,0,0,0.8)'
                }}
              >
                {countryName.toUpperCase()}
              </text>
              <text 
                x={dimensions.width / 2} 
                y={dimensions.height - 12} 
                textAnchor="middle" 
                fill={styleConfig.fontColor} 
                fontFamily={styleConfig.fontFamily} 
                fontSize="10px" 
                fontWeight="500"
                letterSpacing="4px"
                opacity="0.8"
                className="uppercase"
                style={{ 
                  textShadow: styleConfig.background !== 'transparent' 
                    ? `0px 2px 8px ${styleConfig.background}`
                    : '0px 2px 8px rgba(0,0,0,0.8)'
                }}
              >
                Administrative Vector Map
              </text>
            </g>
          )}

          {/* Labels */}
          {showLabels && (
            <g id="map-labels">
              {allPaths.map((path) => renderLabel(path))}
            </g>
          )}

          {/* Location Pin Overlay - Auto Centroid Multiple Pins */}
          {pinEnabled && (
            <g id="map-region-pins">
              {(() => {
                const drawnPins = [];
                // Calculate physical bounds based on pin scale to prevent messy UI overlapping
                const minDistance = pinSize * 0.85;

                return allPaths.map((path, idx) => {
                  if (!path.centroid) return null;
                  const cx = path.centroid.x;
                  const cy = path.centroid.y;

                  // Spatial Collision Culling (Prevents "hijibiji" messy swarms in dense countries/cities like England)
                  for (let i = 0; i < drawnPins.length; i++) {
                      const dx = cx - drawnPins[i].x;
                      const dy = cy - drawnPins[i].y;
                      if (Math.sqrt(dx*dx + dy*dy) < minDistance) return null;
                  }
                  
                  drawnPins.push({x: cx, y: cy});

                  const s = pinSize / 24; // Base scale calculation

                return (
                  <g key={`pin-${idx}`} id={`location-pin-${idx}`} transform={`translate(${cx}, ${cy})`} style={{ pointerEvents: 'none' }}>
                    {/* Shadow for depth */}
                    <ellipse cx="0" cy={s * 2} rx={s * 5} ry={s * 2.5} fill="#000000" opacity="0.3" />
                    
                    {/* Floating folded pin head */}
                    <g transform={`scale(${s}) translate(0, -16)`}>
                      {/* Entire symmetric Pin Base using bezier curves and true arcs */}
                      <path d="M0,16 C-8,8 -8,0 -8,0 A8,8 0 0,1 0,-8 A8,8 0 0,1 8,0 C8,0 8,8 0,16 Z" fill={pinColor} />
                      
                      {/* Right Half (darker fold effect using exact same arc path subset) */}
                      <path d="M0,-8 A8,8 0 0,1 8,0 C8,0 8,8 0,16 Z" fill="#000000" opacity="0.15" />
                      
                      {/* Dynamic inner circle so it contrasts perfectly if the outer shape is white */}
                      <circle cx="0" cy="0" r="6" fill={pinColor?.toLowerCase() === '#ffffff' || pinColor?.toLowerCase() === '#fff' ? '#111827' : '#ffffff'} />
                      
                      {/* Inner border to separate flag from white frame */}
                      <circle cx="0" cy="0" r="5" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />

                      {/* Flag Image specifically clipped to circular area */}
                      {countryIso2 === 'bd' ? (
                        <>
                          {/* Custom centered SVG for Bangladesh to fix official offset */}
                          <circle cx="0" cy="0" r="4.8" fill="#006a4e" />
                          <circle cx="0" cy="0" r="2.6" fill="#f42a41" />
                        </>
                      ) : countryIso2 === 'pw' ? (
                        <>
                          {/* Custom centered SVG for Palau to fix official offset */}
                          <circle cx="0" cy="0" r="4.8" fill="#4aadd6" />
                          <circle cx="0" cy="0" r="2.2" fill="#ffde00" />
                        </>
                      ) : countryIso2 === 'jp' ? (
                        <>
                          {/* Custom centered SVG for Japan for ultra crisp rendering */}
                          <circle cx="0" cy="0" r="4.8" fill="#ffffff" />
                          <circle cx="0" cy="0" r="2.5" fill="#bc002d" />
                        </>
                      ) : (vectorFlagInfo && countryIso2) ? (
                        <g clipPath="url(#global-flag-clip)">
                          <g transform={vectorFlagInfo.transformStr} dangerouslySetInnerHTML={{ __html: vectorFlagInfo.html }} />
                        </g>
                      ) : null}
                    </g>
                  </g>
                );
              });
             })()}
            </g>
          )}

          {/* Debug Overlays */}
          {debugMode && debugBounds && (
            <g id="debug-overlays" style={{ pointerEvents: 'none' }}>
              <rect
                x={debugBounds.minX} y={debugBounds.minY}
                width={debugBounds.maxX - debugBounds.minX}
                height={debugBounds.maxY - debugBounds.minY}
                fill="none" stroke="#ff0000" strokeWidth="2"
                strokeDasharray="8 4" opacity="0.7"
              />
              <circle cx={debugBounds.centerX} cy={debugBounds.centerY} r="6" fill="#ff0000" opacity="0.8" />
              <text x={debugBounds.centerX + 10} y={debugBounds.centerY - 10}
                fill="#ff0000" fontSize="11px" fontFamily="monospace" fontWeight="bold"
              >
                CENTER ({Math.round(debugBounds.centerX)}, {Math.round(debugBounds.centerY)})
              </text>
              <rect x="40" y="40" width={dimensions.width - 80} height={dimensions.height - 80}
                fill="none" stroke="#00ff00" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"
              />
              <text x="45" y="35" fill="#00ff00" fontSize="9px" fontFamily="monospace" opacity="0.6">
                PADDING (40px)
              </text>
              {/* Group labels for USA */}
              {groups.length > 1 && groups.map((group) => (
                <text key={`debug-${group.id}`} x="10" y={group.id === 'alaska' ? dimensions.height - 10 : (group.id === 'hawaii' ? dimensions.height - 30 : 15)}
                  fill="#ffff00" fontSize="10px" fontFamily="monospace" fontWeight="bold" opacity="0.7"
                >
                  [{group.id.toUpperCase()}] {group.paths.length} features
                </text>
              ))}
            </g>
          )}
          </g>
        </svg>
      )}

      {/* Hover Tooltip */}
      {hoveredRegion !== null && !showLabels && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-sm text-gray-100 font-bold shadow-2xl pointer-events-none z-10 animate-fade-in">
          {allPaths.find(p => p.index === hoveredRegion)?.name || ''}
        </div>
      )}
    </div>
  );
});
