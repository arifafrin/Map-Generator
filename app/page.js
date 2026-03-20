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

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [selectedStyle, setSelectedStyle] = useState('colorful');
  const [colors, setColors] = useState(mapStyles.colorful.regionColors);
  const [colorMode, setColorMode] = useState('auto'); // auto, theme-*, random, custom
  
  // Detail Controls State
  const [bgMode, setBgMode] = useState('style-default'); // style-default, transparent
  const [layout, setLayout] = useState('landscape'); // square, portrait, landscape
  const [showLabels, setShowLabels] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [borderWidth, setBorderWidth] = useState(0.5);
  const [debugMode, setDebugMode] = useState(false);
  const [stockMode, setStockMode] = useState(true);
  const [includeIslands, setIncludeIslands] = useState(true);
  const [dotSize, setDotSize] = useState(3);

  // App State
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [svgRef, setSvgRef] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('style'); // style, colors, details

  const countryName = countries.find(c => c.code === selectedCountry)?.name;

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
          setColors(palette ? [...palette.colors] : [...mapStyles[selectedStyle].regionColors]);
        }
      })
      .catch(err => {
        setError(err.message);
        setGeoData(null);
      })
      .finally(() => setLoading(false));
  }, [selectedCountry]);

  // Handle Style Switch updates
  useEffect(() => {
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

      {/* LEFT PANEL */}
      <aside className="relative z-10 w-[360px] flex-shrink-0 border-r border-white/5 bg-[#0a0a0f]/95 backdrop-blur-2xl flex flex-col h-screen shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center justify-between mb-4">
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
            
            <button 
              onClick={handleMagicMap}
              className="px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-orange-400 hover:text-orange-300 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
               title="I'm Feeling Lucky"
            >
              ✨ Magic
            </button>
          </div>
          
          <CountrySelector
            countries={countries}
            selectedCountry={selectedCountry}
            onSelect={setSelectedCountry}
          />
        </div>

        {/* Navigation Tabs */}
        {geoData && (
          <div className="flex p-2 bg-[#050508] border-b border-white/5">
            {['style', 'colors', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Tool Panels */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
          {!geoData ? (
             <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1">No Country Selected</h3>
                <p className="text-xs text-gray-500 line-height-relaxed">Select a country from the dropdown above to begin generating your custom stock-ready vector map.</p>
             </div>
          ) : (
            <div className="space-y-6 animate-fade-in pb-8">
              {activeTab === 'style' && (
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onSelect={setSelectedStyle}
                />
              )}
              {activeTab === 'colors' && (
                <ColorControls
                  selectedCountry={selectedCountry}
                  colors={colors}
                  onColorsChange={setColors}
                  colorMode={colorMode}
                  onColorModeChange={setColorMode}
                />
              )}
              {activeTab === 'details' && (
                <DetailControls
                  bgMode={bgMode} setBgMode={setBgMode}
                  layout={layout} setLayout={setLayout}
                  showLabels={showLabels} setShowLabels={setShowLabels}
                  showTitle={showTitle} setShowTitle={setShowTitle}
                  borderWidth={borderWidth} setBorderWidth={setBorderWidth}
                  debugMode={debugMode} setDebugMode={setDebugMode}
                  stockMode={stockMode} setStockMode={setStockMode}
                  includeIslands={includeIslands} setIncludeIslands={setIncludeIslands}
                  dotSize={dotSize} setDotSize={setDotSize}
                  selectedStyle={selectedStyle}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer / Export */}
        <div className="p-4 bg-gradient-to-t from-[#0a0a0f] to-transparent border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
            {geoData ? (
              <ExportControls 
                svgRef={svgRef} 
                geoData={geoData}
                countryName={countryName}
                selectedStyle={selectedStyle}
                hasLabels={showLabels}
              />
            ) : (
              <div className="text-center text-[10px] text-gray-600 font-mono tracking-widest pt-2">
                MADE FOR CREATORS
              </div>
            )}
        </div>
      </aside>

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
          ) : geoData ? (
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
                  layout={layout}
                  showLabels={showLabels}
                  showTitle={showTitle}
                  borderWidth={borderWidth}
                  debugMode={debugMode}
                  countryName={countryName}
                  stockMode={stockMode}
                  includeIslands={includeIslands}
                  dotSize={dotSize}
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
