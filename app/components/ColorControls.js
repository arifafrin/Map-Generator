'use client';

import { useState } from 'react';
import { countryPalettes, aiColorThemes, generateRandomPalette, generateMonochromaticPalette } from '../utils/colorUtils';

export default function ColorControls({ selectedCountry, geoData, colors, onColorsChange, colorMode, onColorModeChange, bgMode, setBgMode, customBgColor, setCustomBgColor, pinColor, setPinColor, pinEnabled }) {

  const [blendColor, setBlendColor] = useState('#ff4500');
  const [heatmapInfo, setHeatmapInfo] = useState(null);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !geoData || !geoData.features) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      
      const dataMap = {};
      let minVal = Infinity, maxVal = -Infinity;
      
      let startIdx = 0;
      if (lines.length > 0 && isNaN(parseFloat(lines[0].split(',')[1]))) {
         startIdx = 1;
      }
      
      for(let i = startIdx; i < lines.length; i++) {
         const parts = lines[i].split(',');
         if (parts.length >= 2) {
            const name = parts[0].trim().toLowerCase();
            const val = parseFloat(parts[1].trim());
            if (!isNaN(val)) {
               dataMap[name] = val;
               if (val < minVal) minVal = val;
               if (val > maxVal) maxVal = val;
            }
         }
      }
      
      if (minVal === Infinity) {
         alert("No valid numerical data found in CSV. Format should be: RegionName,Value");
         return;
      }
      
      const interpolateColor = (val) => {
         const ratio = maxVal === minVal ? 1 : Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
         const r = Math.round(255 - (255 - 220) * ratio); // White to deep red
         const g = Math.round(255 - (255 - 38) * ratio);
         const b = Math.round(255 - (255 - 38) * ratio);
         const toHex = n => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
         return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      };
      
      const newColors = geoData.features.map(f => {
         const fName1 = (f.properties?.name || '').toLowerCase();
         const fName2 = (f.properties?.NAME || '').toLowerCase();
         const fName3 = (f.properties?.NAME_1 || '').toLowerCase();
         
         const val = dataMap[fName1] ?? dataMap[fName2] ?? dataMap[fName3] ?? null;
         if (val !== null) return interpolateColor(val);
         return '#e2e8f0'; 
      });
      
      onColorModeChange('data-heatmap');
      onColorsChange(newColors);
      setHeatmapInfo({ min: minVal, max: maxVal });
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const handleAutoColors = () => {
    onColorModeChange('auto');
    setHeatmapInfo(null);
    const palette = countryPalettes[selectedCountry];
    if (palette) {
      onColorsChange([...palette.colors]);
    }
  };

  const handleAiTheme = (themeName) => {
    onColorModeChange(`theme-${themeName}`);
    setHeatmapInfo(null);
    onColorsChange([...aiColorThemes[themeName]]);
  };

  const handleRandomColors = () => {
    onColorModeChange('random');
    setHeatmapInfo(null);
    onColorsChange(generateRandomPalette(9)); // Updated to 9 color slots to ensure coverage
  };

  const handleBaseColorBlend = (e) => {
    const val = e.target.value.toLowerCase();
    setBlendColor(val);
    onColorModeChange('blend');
    setHeatmapInfo(null);
    onColorsChange(generateMonochromaticPalette(val, 10)); // Generate 10 blended shades
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...colors];
    updated[index] = newColor.toLowerCase();
    onColorsChange(updated);
    onColorModeChange('custom');
    setHeatmapInfo(null);
  };

  return (
    <div className="space-y-4">
      {/* Smart Generators Card */}
      <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 border-t-white/20 rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-4 flex items-center gap-2">
          <span className="text-sm">✨</span> Color Engine
        </h3>

        {/* Mode selectors */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleAutoColors}
            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
              colorMode === 'auto'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]'
                : 'bg-black/20 border-white/5 text-gray-400 hover:border-emerald-500/30 hover:text-emerald-300 hover:bg-emerald-500/5'
            }`}
          >
            🏳️ Auto-Match
          </button>
          <button
            onClick={handleRandomColors}
            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
              colorMode === 'random'
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)] scale-[1.02]'
                : 'bg-black/20 border-white/5 text-gray-400 hover:border-orange-500/30 hover:text-orange-300 hover:bg-orange-500/5'
            }`}
          >
            🎲 Randomize
          </button>
        </div>

        {/* CSV Data Upload Control */}
        <div className="mb-4">
          <label htmlFor="csv-upload" className={`w-full px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${colorMode === 'data-heatmap' ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-black/20 border-white/10 border-dashed text-gray-400 hover:border-red-500/40 hover:text-red-300 hover:bg-red-500/5'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Upload CSV Heatmap</span>
            <input 
              id="csv-upload"
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleCsvUpload}
              disabled={!geoData || !geoData.features}
            />
          </label>
          <p className="text-[9px] text-gray-500 text-center mt-2 leading-tight">
            Upload a .csv file to generate a data heatmap.<br/>
            <strong>Format:</strong> <code className="bg-black/30 px-1 py-0.5 rounded border border-white/5 text-gray-400">Region Name, Value</code> (e.g. <em>Texas, 50</em>)
          </p>
          
          {/* Dynamic Heatmap Legend */}
          {colorMode === 'data-heatmap' && heatmapInfo && (
            <div className="mt-4 p-3 bg-black/40 rounded-lg border border-red-500/20 shadow-inner">
              <div className="text-[9px] text-gray-400 mb-2 flex justify-between font-bold uppercase tracking-wider">
                <span>Low ({heatmapInfo.min})</span>
                <span>High ({heatmapInfo.max})</span>
              </div>
              <div className="h-2 w-full rounded overflow-hidden flex outline outline-1 outline-white/10" style={{ background: 'linear-gradient(to right, #ffffff, #cc0000)' }}></div>
              <p className="text-[9px] text-red-200/60 mt-2 text-center leading-tight">Darker regions represent higher data values.</p>
            </div>
          )}
        </div>

        {/* Smart Blend Control */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] transition-all hover:bg-indigo-500/10 group">
          <div>
             <span className="text-[11px] font-bold text-indigo-400 block tracking-wide">Monochromatic Blend</span>
             <span className="text-[9px] text-indigo-400/60 block mt-0.5">Generates an elegant 10-shade spectrum</span>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-[3px] border-indigo-400 shadow-md group-hover:scale-105 transition-transform duration-300">
            <input
              type="color"
              value={blendColor}
              onChange={handleBaseColorBlend}
              className="absolute -inset-4 w-20 h-20 cursor-pointer"
              title="Pick a Base Seed Color"
            />
          </div>
        </div>
      </div>

      {/* AI Theme Presets Card */}
      <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 border-t-white/20 rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-sm">🤖</span> AI Generative Themes
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(aiColorThemes).map(theme => (
            <button
              key={theme}
              onClick={() => handleAiTheme(theme)}
              className={`px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all capitalize border duration-300 ${
                colorMode === `theme-${theme}`
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Active Color Swatches with pickers */}
      <div className="bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner">
        <div className="flex items-center justify-between mb-3">
           <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
             {colorMode === 'custom' ? 'Custom Palette' : 'Active Palette'}
           </span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {colors.slice(0, 18).map((color, i) => (
            <div key={i} className="relative group aspect-square">
              <input
                type="color"
                value={color.startsWith('#') && color.length === 7 ? color.toLowerCase() : '#888888'}
                onChange={(e) => handleColorChange(i, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                title="Click to edit raw vector fill"
              />
              <div
                className="absolute inset-0 rounded-lg border-2 border-white/10 group-hover:border-white transition-all duration-300 group-hover:scale-125 group-hover:z-10 shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
                style={{ 
                    backgroundColor: color,
                    boxShadow: `0 4px 10px ${color}40, inset 0 2px 4px rgba(255,255,255,0.2)`
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Location Pin Color Card (Conditionally Rendered) */}
      {pinEnabled && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md animate-fade-in">
          <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
            <span className="text-sm">📍</span> Location Pin Color
          </h3>
          
          <div className="flex gap-2.5 justify-center mt-3 border-t border-white/5 pt-3">
            {[
              { name: 'Stock Red', hex: '#ef4444' },
              { name: 'Corporate Blue', hex: '#3b82f6' },
              { name: 'Nature Green', hex: '#10b981' },
              { name: 'Vibrant Yellow', hex: '#f59e0b' },
              { name: 'Royal Purple', hex: '#8b5cf6' },
              { name: 'Minimal White', hex: '#ffffff' },
              { name: 'Pitch Black', hex: '#111827' },
            ].map((color) => (
              <button
                key={color.name}
                title={color.name}
                onClick={() => setPinColor(color.hex)}
                className={`w-7 h-7 rounded-full border-[3px] shadow-sm transition-all duration-300 ${
                  pinColor === color.hex ? 'scale-125 z-10' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{ 
                    backgroundColor: color.hex, 
                    borderColor: pinColor === color.hex ? 'rgba(255,255,255,0.8)' : (color.hex === '#111827' ? '#4b5563' : 'transparent'),
                    boxShadow: pinColor === color.hex ? `0 0 15px ${color.hex}60` : 'none'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Canvas Background Card */}
      <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 border-t-white/20 rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-sm">🖼️</span> Canvas Background
        </h3>
        
        <div className="flex flex-col gap-2">
           <div className="flex gap-2">
             <button onClick={() => setBgMode('style-default')} className={`flex-[2] py-2 rounded-lg border text-[9px] font-bold uppercase transition-all duration-300 ${bgMode === 'style-default' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300'}`}>Preset Theme</button>
             <button onClick={() => setBgMode('transparent')} className={`flex-[2] py-2 rounded-lg border text-[9px] font-bold uppercase transition-all duration-300 ${bgMode === 'transparent' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300'}`}>Clear Base</button>
           </div>
           
           <label className={`w-full py-2.5 px-3 rounded-lg border flex items-center justify-between font-bold uppercase cursor-pointer transition-all duration-300 ${bgMode === 'custom' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/20'}`}>
             <span className="text-[10px]">Solid Custom Fill</span>
             <input 
                type="color" 
                value={customBgColor} 
                onChange={(e) => { 
                   setCustomBgColor(e.target.value); 
                   setBgMode('custom'); 
                }} 
                onClick={() => setBgMode('custom')}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
             />
           </label>
        </div>
        <p className="text-[9px] text-gray-600 leading-tight block pt-2">Whatever background is selected will strictly export visually to exactly match the software grid.</p>
      </div>

    </div>
  );
}
