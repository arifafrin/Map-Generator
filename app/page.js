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
  
  // Location Pin State
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinSize, setPinSize] = useState(36);
  const [pinColor, setPinColor] = useState('#ef4444');

  // Atom Settings State (for Network style)
  const [atomX, setAtomX] = useState(50); // percentage 0-100
  const [atomY, setAtomY] = useState(50); // percentage 0-100
  const [electronCount, setElectronCount] = useState(12);
  const [atomSize, setAtomSize] = useState(32); // percentage 10-100

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
    setSelectedCountry(savedCountry || 'BGD');
    setSelectedStyle(savedStyle || 'colorful');
    
    setIsLoaded(true);
  }, []);

  // Save country selection when it changes
  useEffect(() => {
    if (isLoaded && selectedCountry) {
      localStorage.setItem('vmg_selectedCountry', selectedCountry);
    }
  }, [selectedCountry, isLoaded]);

  // Save map style when it changes
  useEffect(() => {
    if (isLoaded && selectedStyle) {
      localStorage.setItem('vmg_selectedStyle', selectedStyle);
    }
  }, [selectedStyle, isLoaded]);

  const countryName = countries.find(c => c.code === selectedCountry)?.name;
  
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
    if (!selectedCountry) return;
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
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px]" />
      </div>

      {/* MACRO CONTROL CENTER - 3 COLUMN LAYOUT */}
      <div className="relative z-20 flex flex-shrink-0 h-screen bg-[#0a0a0f]/95 backdrop-blur-2xl shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        
        {/* COLUMN 1: HEADER, COUNTRY & STYLES */}
        <aside className="w-[320px] flex flex-col h-full border-r border-white/5 bg-[#0a0a0f]">
          {/* Header */}
          <div className="px-5 py-5 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-wide text-white">Vector Map Generator</h1>
                  <p className="text-[10px] text-purple-300 font-medium uppercase tracking-widest mt-0.5">Premium Edition</p>
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
             
             {/* Custom Freehand Drawing Mode UI */}
             <div className="pt-5 border-t border-white/5 animate-fade-in pb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex justify-between items-center">
                  <span>Freehand Draw Mode</span>
                  <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase">BETA</span>
                </label>
                <p className="text-[10px] text-gray-500 leading-snug mb-3">Draw custom paths without a predefined country map. Select a tool below to begin.</p>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setSelectedCountry(''); setSelectedStyle('pencilmesh'); }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${selectedStyle === 'pencilmesh' ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/10'} `}
                    >
                       <span className="text-2xl drop-shadow-md">✏️</span>
                       <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${selectedStyle === 'pencilmesh' ? 'text-purple-300' : 'text-gray-400'}`}>Draw Neural</span>
                    </button>
                    <button 
                      onClick={() => { setSelectedCountry(''); setSelectedStyle('pencilnetwork'); }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${selectedStyle === 'pencilnetwork' ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-white/10'} `}
                    >
                       <span className="text-2xl drop-shadow-md">✍️</span>
                       <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${selectedStyle === 'pencilnetwork' ? 'text-orange-400' : 'text-gray-400'}`}>Draw Network</span>
                    </button>
                </div>
                {mapStyles[selectedStyle]?.isPencil && (
                   <p className="text-[10px] text-blue-300 mt-3 text-center bg-blue-900/10 py-2 rounded-md border border-blue-500/20 animate-pulse font-medium">✨ Pencil Tool Active. Draw on the right canvas!</p>
                )}
             </div>
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Color Engine</h2>
                <p className="text-[10px] text-gray-600 mt-1 uppercase">Palette Mapping</p>
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
             <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Map Parameters</h2>
             <p className="text-[10px] text-gray-600 mt-1 uppercase">Advanced Config</p>
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
               atomX={atomX} setAtomX={setAtomX}
               atomY={atomY} setAtomY={setAtomY}
               electronCount={electronCount} setElectronCount={setElectronCount}
               atomSize={atomSize} setAtomSize={setAtomSize}
               pinEnabled={pinEnabled} setPinEnabled={setPinEnabled}
               pinSize={pinSize} setPinSize={setPinSize}
               selectedStyle={selectedStyle}
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
              {loading ? 'Compiling GeoJSON...' : geoData ? `Renderer Active · ${geoData.features?.length || 0} Regions` : 'Standby'}
            </span>
          </div>
          {geoData && (
             <div className="flex gap-4">
                <span className="text-[10px] text-gray-500 font-mono uppercase bg-white/5 px-2 py-1 rounded">Style: {selectedStyle}</span>
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
              <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 animate-pulse">Parsing Geometry</p>
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
              <p className="text-[10px] text-gray-600 mt-2">Try selecting a different country, or check your internet connection for CDN fallback.</p>
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
                  atomX={atomX}
                  atomY={atomY}
                  electronCount={electronCount}
                  atomSize={atomSize}
                  pinEnabled={pinEnabled}
                  pinSize={pinSize}
                  pinColor={pinColor}
                  countryIso2={countryIso2}
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
