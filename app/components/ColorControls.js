'use client';

import { useState } from 'react';
import { countryPalettes, aiColorThemes, generateRandomPalette, generateMonochromaticPalette } from '../utils/colorUtils';

export default function ColorControls({ selectedCountry, colors, onColorsChange, colorMode, onColorModeChange }) {

  const [blendColor, setBlendColor] = useState('#ff4500');

  const handleAutoColors = () => {
    onColorModeChange('auto');
    const palette = countryPalettes[selectedCountry];
    if (palette) {
      onColorsChange([...palette.colors]);
    }
  };

  const handleAiTheme = (themeName) => {
    onColorModeChange(`theme-${themeName}`);
    onColorsChange([...aiColorThemes[themeName]]);
  };

  const handleRandomColors = () => {
    onColorModeChange('random');
    onColorsChange(generateRandomPalette(9)); // Updated to 9 color slots to ensure coverage
  };

  const handleBaseColorBlend = (e) => {
    const val = e.target.value.toLowerCase();
    setBlendColor(val);
    onColorModeChange('blend');
    onColorsChange(generateMonochromaticPalette(val, 10)); // Generate 10 blended shades
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...colors];
    updated[index] = newColor.toLowerCase();
    onColorsChange(updated);
    onColorModeChange('custom');
  };

  return (
    <div className="space-y-4">
      {/* Smart Generators Card */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md">
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
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md">
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
    </div>
  );
}
