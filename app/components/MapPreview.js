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
  dotSize = 3
}) {
  const svgRef = useRef(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  
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
  }, [geoData, onSvgRef, dimensions, style, colors, bgMode, showLabels, borderWidth, dotSize]);

  const styleConfig = mapStyles[style] || mapStyles.colorful;
  const backgroundColor = stockMode ? '#ffffff' : (bgMode === 'transparent' ? 'transparent' : styleConfig.background);

  // Core d3-geo rendering pipeline — now returns grouped paths
  const { groups, debugBounds } = useMemo(() => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return { groups: [], debugBounds: null };
    }
    const safePadding = stockMode ? 100 : 40;
    return processGeoData(geoData, dimensions.width, dimensions.height, safePadding, colors, styleConfig, includeIslands);
  }, [geoData, dimensions, colors, styleConfig, layout, includeIslands, stockMode]);

  // Flatten all paths for tooltip lookup
  const allPaths = useMemo(() => groups.flatMap(g => g.paths), [groups]);

  // AUTO-STROKE: Adapt border width based on region density
  // Dense maps (100+ regions) get thinner strokes so features stay distinguishable
  const autoStrokeWidth = useMemo(() => {
    const regionCount = allPaths.length;
    if (regionCount > 150) return 0.2;
    if (regionCount > 100) return 0.3;
    if (regionCount > 50) return 0.4;
    return null; // No override, use user setting
  }, [allPaths.length]);

  // Use user's border width, unless the style forces a specific stroke width (like 0 for silhouette)
  // Auto-stroke kicks in for dense maps to prevent border congestion
  const userStroke = borderWidth !== null ? borderWidth : styleConfig.strokeWidth;
  const finalStrokeWidth = styleConfig.strokeWidth === 0 
    ? 0 
    : (autoStrokeWidth !== null ? Math.min(userStroke, autoStrokeWidth) : userStroke);

  // SVG Defs
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
            <rect width={spacing} height={spacing} fill="#ffffff" />
            <circle cx={spacing/2} cy={spacing/2} r={dotSize * 0.45} fill={p.fillColor} />
          </pattern>
        );
      })}
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
