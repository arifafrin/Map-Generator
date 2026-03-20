'use client';

import { useState } from 'react';
import { countryPalettes, aiColorThemes, generateRandomPalette, generateMonochromaticPalette } from '../utils/colorUtils';

export default function ColorControls({ selectedCountry, colors, onColorsChange, colorMode, onColorModeChange }) {

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

  const handleBaseColorBlend = (baseHex) => {
    onColorModeChange('blend');
    onColorsChange(generateMonochromaticPalette(baseHex, 10)); // Generate 10 blended shades
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...colors];
    updated[index] = newColor;
    onColorsChange(updated);
    onColorModeChange('custom');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Smart Color Engine
        </label>
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAutoColors}
          className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            colorMode === 'auto'
              ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/50 text-emerald-300 shadow-inner'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-emerald-500/30 hover:text-emerald-300'
          }`}
        >
          🏳️ Country Theme
        </button>
        <button
          onClick={handleRandomColors}
          className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            colorMode === 'random'
              ? 'bg-gradient-to-r from-orange-500/30 to-pink-500/30 border border-orange-500/50 text-orange-300 shadow-inner'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-orange-500/30 hover:text-orange-300'
          }`}
        >
          🎲 Random HSL
        </button>
      </div>

      {/* Smart Blend Control */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
        <div>
           <span className="text-xs font-bold text-indigo-400 block">Single Color Blend</span>
           <span className="text-[9px] text-indigo-500/70">Pick a base color, we generate 10 shades</span>
        </div>
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-400 shadow-md">
          <input
            type="color"
            value={colorMode === 'blend' ? (colors[0] || '#ff4500') : '#ff4500'}
            onChange={(e) => handleBaseColorBlend(e.target.value)}
            className="absolute -inset-4 w-16 h-16 cursor-pointer"
            title="Pick a Base Seed Color"
          />
        </div>
      </div>

      {/* AI Theme Presets */}
      <div>
        <p className="text-[10px] uppercase text-gray-500 mb-2 font-mono">AI Generative Themes</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.keys(aiColorThemes).map(theme => (
            <button
              key={theme}
              onClick={() => handleAiTheme(theme)}
              className={`px-2 py-2 rounded-lg text-[11px] font-medium transition-all capitalize border ${
                colorMode === `theme-${theme}`
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Active Color Swatches with pickers */}
      <div className="bg-black/20 p-3 rounded-xl border border-white/5">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] text-gray-500 font-mono">
             {colorMode === 'custom' ? 'CUSTOM PALETTE' : 'ACTIVE PALETTE'}
           </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {colors.slice(0, 18).map((color, i) => (
            <div key={i} className="relative group aspect-square">
              <input
                type="color"
                value={color.startsWith('#') ? color : '#888888'}
                onChange={(e) => handleColorChange(i, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                title="Click to edit"
              />
              <div
                className="w-full h-full rounded border border-white/10 group-hover:border-white/50 transition-all duration-300 group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
