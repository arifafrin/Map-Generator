'use client';

import { useState, useCallback, useEffect } from 'react';
import CountrySelector from './components/CountrySelector';
import StyleSelector from './components/StyleSelector';
import ColorControls from './components/ColorControls';
import DetailControls from './components/DetailControls';
import MapPreview from './components/MapPreview';
import ExportControls from './components/ExportControls';
import countries from './data/countries';
import { getBeautifulRandomMapCombo, mapStyles, aiColorThemes, countryPalettes } from './utils/colorUtils';
import * as isoCountries from 'i18n-iso-countries';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [colors, setColors] = useState(mapStyles.colorful.regionColors);
  const [colorMode, setColorMode] = useState('auto'); // auto, theme-*, random, custom
  const [clearDrawingsTrigger, setClearDrawingsTrigger] = useState(0);
  
  // Detail Controls State
  const [bgMode, setBgMode] = useState('style-default'); // style-default, transparent, custom
  const [customBgColor, setCustomBgColor] = useState('#ffffff');
  const [layout, setLayout] = useState('landscape'); // square, portrait, landscape
  const [showLabels, setShowLabels] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [borderWidth, setBorderWidth] = useState(0.5);
  const [debugMode, setDebugMode] = useState(false);
  const [stockMode, setStockMode] = useState(true);
  const [includeIslands, setIncludeIslands] = useState(false);
  const [dotSize, setDotSize] = useState(3);
  const [halftoneShape, setHalftoneShape] = useState('circle'); // circle, heart, square, diamond
  
  // Location Pin State
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinSize, setPinSize] = useState(36);
  const [pinColor, setPinColor] = useState('#ef4444');

  // Map Animation State
  const [animationEnabled, setAnimationEnabled] = useState(false);
  const [animationStyle, setAnimationStyle] = useState('reveal'); // reveal, pulse, wave, draw, breathe, radar, colorshift, float
  const [animationSpeed, setAnimationSpeed] = useState(1); // 0.5x to 3x multiplier

  // Atom Settings State (for Network style)
  const [showAtom, setShowAtom] = useState(false);
  const [atomPositions, setAtomPositions] = useState([]); 
  const [activeAtomId, setActiveAtomId] = useState(null);
  const [electronCount, setElectronCount] = useState(12);
  const [atomSize, setAtomSize] = useState(32); // percentage 10-100
  const [atomColor, setAtomColor] = useState('#ff8c00'); // Independent atom color

  // App State
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [svgRef, setSvgRef] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('style'); // style, colors, details

  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedCountry = localStorage.getItem('vmg_selectedCountry');
    const savedStyle = localStorage.getItem('vmg_selectedStyle');
    
    // Set to saved values or defaults
    // Use strict null check so empty string (blank canvas) doesn't fallback to 'BGD'
    setSelectedCountry(savedCountry !== null ? savedCountry : 'BGD');
    setSelectedStyle(savedStyle || 'colorful');
    
    setIsLoaded(true);
  }, []);

  // Save country selection when it changes
  useEffect(() => {
    if (isLoaded && selectedCountry !== null) {
      localStorage.setItem('vmg_selectedCountry', selectedCountry);
    }
  }, [selectedCountry, isLoaded]);

  // Save map style when it changes
  useEffect(() => {
    if (isLoaded && selectedStyle) {
      localStorage.setItem('vmg_selectedStyle', selectedStyle);
    }
  }, [selectedStyle, isLoaded]);

  const countryName = countries.find(c => c.code === selectedCountry)?.name || 'Custom Region';
  
  // Intercept specific sub-national regions that lack standard top-level ISO-3166-1 alpha-3 sovereignty
  const customIsoMap = {
     'ENG': 'gb', // User explicitly requested the UK Union Jack for England
     'SCT': 'gb-sct',
     'WLS': 'gb-wls',
     'NIR': 'gb-nir'
  };
  
  // Need Alpha-2 code for reliable FlagCDN fetching
  const rawIso2 = customIsoMap[selectedCountry] || isoCountries.alpha3ToAlpha2(selectedCountry); 
  const countryIso2 = selectedCountry === 'WLD' ? null : (rawIso2?.toLowerCase() || 'un');

  // Load Map Data
  useEffect(() => {
    if (!selectedCountry) {
       setGeoData(null);
       return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/geojson?code=${selectedCountry}`)
      .then(res => {
        if (!res.ok) throw new Error('Local map data not found.');
        return res.json();
      })
      .then(data => {
        setGeoData(data);
        if (colorMode === 'auto') {
          const palette = countryPalettes[selectedCountry];
          const fallbackColors = mapStyles[selectedStyle] ? mapStyles[selectedStyle].regionColors : mapStyles.colorful.regionColors;
          setColors(palette ? [...palette.colors] : [...fallbackColors]);
        }
      })
      .catch(err => {
        setError(err.message);
        setGeoData(null);
      })
      .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  // Handle Style Switch updates
  useEffect(() => {
    if (!selectedStyle) return;
    
    // Styles with distinctive visual identities must use their own palette
    // Generic styles (colorful, minimal) can use the country's cultural palette
    const genericStyles = ['colorful', 'minimal', 'poster'];
    const isGenericStyle = genericStyles.includes(selectedStyle);
    
    if (colorMode !== 'custom' && colorMode !== 'random' && colorMode !== 'blend' && !colorMode.startsWith('theme-')) {
      if (colorMode === 'auto' && isGenericStyle && countryPalettes[selectedCountry]) {
        setColors([...countryPalettes[selectedCountry].colors]);
      } else {
        setColors([...mapStyles[selectedStyle].regionColors]);
      }
    }
    // Update default border width when switching styles
    setBorderWidth(mapStyles[selectedStyle].strokeWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStyle]);

  const handleMagicMap = () => {
    const { style, colorMode: newMode } = getBeautifulRandomMapCombo();
    setSelectedStyle(style);
    setColorMode(newMode);
    
    if (newMode === 'auto' && countryPalettes[selectedCountry]) {
        setColors([...countryPalettes[selectedCountry].colors]);
    } else if (newMode.startsWith('theme-')) {
        const theme = newMode.replace('theme-', '');
        setColors([...aiColorThemes[theme]]);
    }
    
    setLayout(['landscape', 'square'][Math.floor(Math.random() * 2)]);
    if (Math.random() > 0.5) setShowLabels(true);
  };

  const handleSvgRef = useCallback((ref) => setSvgRef(ref), []);

  return (
    <main className="min-h-screen bg-[#050508] text-white flex overflow-hidden font-sans">
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* MACRO CONTROL CENTER - 3 COLUMN LAYOUT */}
      <div className="relative z-20 flex flex-shrink-0 h-screen bg-[#0a0a0f]/95 backdrop-blur-2xl shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        
        {/* COLUMN 1: HEADER, COUNTRY & STYLES */}
        <aside className="w-[320px] flex flex-col h-full border-r border-white/5 bg-[#0a0a0f]">
          {/* Header */}
          <div className="px-5 py-5 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-widest text-white">Map Studio Pro</h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Creator Edition</p>
                </div>
              </div>
            </div>
            
            <CountrySelector
              countries={countries}
              selectedCountry={selectedCountry}
              onSelect={setSelectedCountry}
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5">
             <div className="animate-fade-in pb-5">
               <StyleSelector
                 selectedStyle={selectedStyle}
                 onSelect={setSelectedStyle}
               />
             </div>
             
             {/* FREEHAND DRAW MODE CARD */}
            <div className="py-5 border-b border-white/5 px-4 bg-white/[0.01]">
               <div className="flex items-center justify-between mb-3 px-1">
                 <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Custom Drawing</h2>
                 <span className="text-[8px] uppercase tracking-widest bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Beta</span>
               </div>
               
               <div className="bg-black/30 border border-white/10 rounded-xl p-3 shadow-inner">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                       <span className="text-lg">✏️</span> Pencil Tool
                     </span>
                  </div>
                
                <div className="flex flex-col gap-4 mt-4">
                  
                  {/* Custom Draw Toggle */}
                  <button 
                    onClick={() => {
                       if (mapStyles[selectedStyle]?.isPencil) {
                          setSelectedStyle('colorful');
                       } else {
                          setSelectedCountry('');
                          setSelectedStyle('pencilbasic');
                       }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${mapStyles[selectedStyle]?.isPencil ? 'bg-blue-500/20 border-blue-500/50 shadow-inner' : 'bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/10'} `}
                  >
                     <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold tracking-wide ${mapStyles[selectedStyle]?.isPencil ? 'text-blue-300' : 'text-gray-300'}`}>
                           {mapStyles[selectedStyle]?.isPencil ? 'Disable Tool' : 'Enable Tool'}
                        </span>
                     </div>
                     <div className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${mapStyles[selectedStyle]?.isPencil ? 'bg-[#1877F2]' : 'bg-white/10'} `}>
                         <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${mapStyles[selectedStyle]?.isPencil ? 'translate-x-5' : ''}`} />
                     </div>
                  </button>

                  {/* Draw Style Dropdown - Uses existing StyleSelector */}
                  <div className={`transition-all duration-300 ${!mapStyles[selectedStyle]?.isPencil ? 'opacity-40 pointer-events-none grayscale max-h-0 overflow-hidden' : 'max-h-[300px]'}`}>
                     <StyleSelector
                       selectedStyle={selectedStyle}
                       onSelect={setSelectedStyle}
                       label="Drawing Style"
                       stylesList={[mapStyles.pencilbasic, mapStyles.pencilmesh, mapStyles.pencilnetwork, mapStyles.pencilradial]}
                     />
                     <button
                        onClick={() => setClearDrawingsTrigger(prev => prev + 1)}
                        className="w-full mt-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wide hover:bg-red-500/20 transition-all shadow-[0_2px_10px_rgba(239,68,68,0.1)] active:scale-95 flex items-center justify-center gap-2"
                     >
                        <span className="text-sm">🗑️</span>
                        Clear Drawing
                     </button>
                     <p className="text-[10px] text-blue-300 mt-3 text-center bg-blue-900/10 py-2 rounded-md border border-blue-500/20 animate-pulse font-medium">✨ Draw your shape on the right!</p>
                  </div>
                  
                </div>
             </div>
             </div>

             {/* Moved Atom Controls here to balance UI */}
             {(selectedStyle === 'network' || selectedStyle === 'pencilnetwork') && (() => {
               const activeAtom = atomPositions?.find(a => a.id === activeAtomId) || atomPositions?.[0] || { x: 50, y: 50 };
               const currentElectronCount = activeAtom.electrons ?? electronCount;

               const handleUpdateActiveAtom = (updates) => {
                  if (setAtomPositions) {
                      setAtomPositions(prev => prev.map(a => 
                          a.id === activeAtom.id ? { ...a, ...updates } : a
                      ));
                  }
               };
               
               return (
                 <div className="pt-2 border-t border-white/5 space-y-3 pb-2 animate-fade-in">
                   <div className="flex items-center justify-between mb-1 border-b border-indigo-500/20 pb-2">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] text-indigo-300">⚛️</span>
                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Atom Overlay</p>
                     </div>
                     <button 
                       onClick={() => {
                         const newState = !showAtom;
                         setShowAtom(newState);
                         // Seed a default atom at center if enabling with empty list
                         if (newState && atomPositions && atomPositions.length === 0) {
                           const seedId = `atom-${Date.now()}`;
                           setAtomPositions([{ id: seedId, x: 50, y: 50 }]);
                           setActiveAtomId(seedId);
                         }
                       }}
                       className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showAtom ? 'bg-[#1877F2]' : 'bg-white/10 hover:bg-white/20'}`}
                     >
                       <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${showAtom ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                   </div>

                   {/* Active atom status indicator */}
                   {atomPositions && atomPositions.length > 1 && (
                     <div className="flex items-center justify-between py-1.5 px-2 mb-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                       <p className="text-[10px] text-indigo-300 font-semibold">Editing Atom</p>
                       <span className="text-[10px] font-mono text-white bg-indigo-500/30 px-2 py-0.5 rounded">
                         {(atomPositions?.findIndex(a => a.id === activeAtomId) ?? 0) + 1} / {atomPositions?.length}
                       </span>
                     </div>
                   )}
                   
                   <div className={`space-y-4 transition-all duration-300 ${!showAtom ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                     {/* Base Color Picker */}
                     <div className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg">
                        <p className="text-[11px] text-indigo-200 font-semibold tracking-wide">Base Color</p>
                        <input
                          type="color"
                          value={atomColor}
                          onChange={(e) => setAtomColor && setAtomColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0 appearance-none"
                        />
                     </div>
                     
                     <div>
                       <div className="flex justify-between items-center mb-1.5">
                         <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Orbit Rings</p>
                         <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{currentElectronCount}</span>
                       </div>
                       <input type="range" min="0" max="48" step="1" value={currentElectronCount} onChange={(e) => handleUpdateActiveAtom({ electrons: parseInt(e.target.value) })} className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer border-none accent-indigo-400" />
                     </div>
                   </div>
                 </div>
               );
             })()}

          </div>
          
          {/* Export System */}
          <div className="p-5 bg-gradient-to-t from-purple-900/10 to-transparent border-t border-white/5 shrink-0 relative z-50">
            <ExportControls 
              svgRef={svgRef} 
              geoData={geoData}
              countryName={countryName}
              selectedStyle={selectedStyle}
              hasLabels={showLabels}
              bgMode={bgMode}
              customBgColor={customBgColor}
              animationEnabled={animationEnabled}
              animationStyle={animationStyle}
              animationSpeed={animationSpeed}
            />
          </div>
          
          {/* Footer Sub-brand */}
          <div className="p-4 border-t border-white/5 bg-black/20 shrink-0 text-center text-[10px] text-gray-600 font-mono tracking-widest uppercase">
            Developed by Arif Hossain
          </div>
        </aside>

        {/* COLUMN 2: COLORS */}
        <aside className="w-[320px] flex flex-col h-full border-r border-white/5 bg-[#08080c] animate-slide-in-right">
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01] shrink-0 flex justify-between items-center h-[72px]">
              <div>
                 <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Choose Location</h2>
                 <p className="text-[10px] text-gray-600 mt-0.5 uppercase mb-3">Select your targeted area</p>
              </div>
             <button onClick={handleMagicMap} className="px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-orange-400 hover:text-orange-300 text-[10px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95" title="Randomize Colors & Layout">✨ Magic</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 pb-12">
             <ColorControls
               selectedCountry={selectedCountry}
               geoData={geoData}
               colors={colors}
               onColorsChange={setColors}
               colorMode={colorMode}
               onColorModeChange={setColorMode}
               bgMode={bgMode} setBgMode={setBgMode}
               customBgColor={customBgColor} setCustomBgColor={setCustomBgColor}
               pinColor={pinColor} setPinColor={setPinColor}
               pinEnabled={pinEnabled}
             />
          </div>
        </aside>

        {/* COLUMN 3: DETAILS & EXPORT */}
        <aside className="w-[340px] flex flex-col h-full border-r border-white/5 bg-[#050508] animate-slide-in-right" style={{animationDelay: '100ms'}}>
           <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01] shrink-0 h-[72px] flex flex-col justify-center">
             <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Settings & Tweaks</h2>
             <p className="text-[10px] text-gray-600 mt-1 uppercase">Customize your map geometry</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 pb-8 space-y-6">
             <DetailControls
               layout={layout} setLayout={setLayout}
               showLabels={showLabels} setShowLabels={setShowLabels}
               showTitle={showTitle} setShowTitle={setShowTitle}
               borderWidth={borderWidth} setBorderWidth={setBorderWidth}
               debugMode={debugMode} setDebugMode={setDebugMode}
               stockMode={stockMode} setStockMode={setStockMode}
               includeIslands={includeIslands} setIncludeIslands={setIncludeIslands}
               dotSize={dotSize} setDotSize={setDotSize}
               halftoneShape={halftoneShape} setHalftoneShape={setHalftoneShape}
               showAtom={showAtom} setShowAtom={setShowAtom}
               activeAtomId={activeAtomId} setActiveAtomId={setActiveAtomId}
               atomPositions={atomPositions} setAtomPositions={setAtomPositions}
               electronCount={electronCount} setElectronCount={setElectronCount}
               atomSize={atomSize} setAtomSize={setAtomSize}
               atomColor={atomColor} setAtomColor={setAtomColor}
               pinEnabled={pinEnabled} setPinEnabled={setPinEnabled}
               pinSize={pinSize} setPinSize={setPinSize}
               selectedStyle={selectedStyle}
               animationEnabled={animationEnabled} setAnimationEnabled={setAnimationEnabled}
               animationStyle={animationStyle} setAnimationStyle={setAnimationStyle}
               animationSpeed={animationSpeed} setAnimationSpeed={setAnimationSpeed}
             />
          </div>
        </aside>
      </div>

      {/* RIGHT PANEL - LIVE PREVIEW */}
      <section className="relative z-10 flex-1 flex flex-col h-screen">
        
        {/* Top Info Bar */}
        <div className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0f]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${geoData ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-400 font-medium tracking-wide">
              {loading ? 'Loading Map...' : geoData ? `Ready · ${geoData.features?.length || 0} Regions` : 'Standby'}
            </span>
          </div>
          {geoData && (
             <div className="flex gap-4">
                <span className="text-[10px] text-gray-500 font-mono uppercase bg-white/5 px-2 py-1 rounded">Style: {mapStyles[selectedStyle]?.name || selectedStyle}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase bg-white/5 px-2 py-1 rounded">Layout: {layout}</span>
             </div>
          )}
        </div>

        {/* Interactive Canvas */}
        <div className="flex-1 p-8 flex items-center justify-center overflow-auto custom-scrollbar relative">
          
          {/* Subtle Grid Background for workspace feel */}
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-xl shadow-purple-500/20">
                 <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
              </div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 animate-pulse">Loading Map...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2 shadow-xl shadow-red-500/10">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-red-300 tracking-wide">Map Unavailable</p>
              <p className="text-xs text-gray-500 leading-relaxed">{error}</p>
              <p className="text-[10px] text-gray-600 mt-2">Try selecting a different country or check your internet connection.</p>
            </div>
          ) : (geoData || mapStyles[selectedStyle]?.isPencil) ? (
             <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 border border-white/5" style={{
                // Add soft drop shadow based on styling
                boxShadow: bgMode === 'transparent' ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
             }}>
                <MapPreview
                  geoData={geoData}
                  style={selectedStyle}
                  colors={colors}
                  selectedRegion={selectedRegion}
                  onRegionSelect={setSelectedRegion}
                  onSvgRef={handleSvgRef}
                  bgMode={bgMode}
                  customBgColor={customBgColor}
                  layout={layout}
                  showLabels={showLabels}
                  showTitle={showTitle}
                  borderWidth={borderWidth}
                  debugMode={debugMode}
                  countryName={countryName || 'Custom'}
                  stockMode={stockMode}
                  includeIslands={includeIslands}
                  dotSize={dotSize}
                  halftoneShape={halftoneShape}
                  showAtom={showAtom}
                  activeAtomId={activeAtomId} setActiveAtomId={setActiveAtomId}
                  atomPositions={atomPositions} setAtomPositions={setAtomPositions}
                  electronCount={electronCount}
                  atomSize={atomSize}
                  atomColor={atomColor}
                  pinEnabled={pinEnabled}
                  pinSize={pinSize}
                  pinColor={pinColor}
                  countryIso2={countryIso2}
                  clearDrawingsTrigger={clearDrawingsTrigger}
                  animationEnabled={animationEnabled}
                  animationStyle={animationStyle}
                  animationSpeed={animationSpeed}
                />
             </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-4 right-6 text-[10px] text-gray-500 font-mono tracking-widest uppercase z-20 opacity-50 hover:opacity-100 transition-opacity">
          Developed by Arif Hossain
        </div>
      </section>
    </main>
  );
}
