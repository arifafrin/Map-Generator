'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { processGeoData } from '../utils/geoUtils';
import { mapStyles } from '../utils/colorUtils';

export default function MapPreview({ 
  geoData, 
  style, 
  colors, 
  selectedRegion, 
  onRegionSelect, 
  onSvgRef,
  bgMode = 'style-default',
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

  const dimensions = useMemo(() => {
    switch(layout) {
      case 'square': return { width: 1200, height: 1200 };
      case 'portrait': return { width: 900, height: 1200 };
      case 'landscape': 
      default: return { width: 1200, height: 900 };
    }
  }, [layout]);

  useEffect(() => {
    if (svgRef.current && onSvgRef) {
      onSvgRef(svgRef.current);
    }
  }, [geoData, onSvgRef, dimensions, style, colors, bgMode, showLabels, borderWidth, dotSize, pinEnabled, pinSize, pinColor, countryIso2]);

  const styleConfig = mapStyles[style] || mapStyles.colorful;
  const backgroundColor = stockMode ? '#ffffff' : (bgMode === 'transparent' ? 'transparent' : styleConfig.background);

  // Core d3-geo rendering pipeline
  const { groups, debugBounds } = useMemo(() => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return { groups: [], debugBounds: null };
    }
    const safePadding = stockMode ? 100 : 40;
    return processGeoData(geoData, dimensions.width, dimensions.height, safePadding, colors, styleConfig, includeIslands);
  }, [geoData, dimensions, colors, styleConfig, includeIslands, stockMode]);

  // Flatten all paths for tooltip lookup
  const allPaths = useMemo(() => groups.flatMap(g => g.paths), [groups]);

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
      {!geoData || groups.length === 0 ? (
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
      ) : (
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-full max-h-full transition-all duration-500 origin-center"
          style={{ background: backgroundColor }}
        >
          {defs}
          
          {/* Blueprint grid background — renders engineering paper texture */}
          {styleConfig.isBlueprint && (
            <rect width={dimensions.width} height={dimensions.height} fill="url(#blueprintGrid)" />
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
                      
                      {/* White inner circle framing the flag centered precisely in the top arc */}
                      <circle cx="0" cy="0" r="6" fill="#ffffff" />
                      
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
}
