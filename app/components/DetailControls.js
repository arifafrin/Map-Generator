'use client';

export default function DetailControls({ 
  bgMode, setBgMode, 
  layout, setLayout, 
  showTitle, setShowTitle,
  showLabels, setShowLabels,
  borderWidth, setBorderWidth,
  debugMode, setDebugMode,
  stockMode, setStockMode,
  includeIslands, setIncludeIslands,
  dotSize, setDotSize,
  selectedStyle
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Details & Layout
        </label>
      </div>

      {/* Composition Buttons */}
      <div>
        <p className="text-[10px] uppercase text-gray-500 mb-2 font-mono">Composition</p>
        <div className="flex gap-2">
          {['square', 'portrait', 'landscape'].map((mode) => (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={`flex-1 py-1.5 rounded-md border text-[10px] font-bold uppercase transition-all ${
                layout === mode 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/30'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Background Toggles */}
      <div>
        <p className="text-[10px] uppercase text-gray-500 mb-2 font-mono">Background</p>
        <div className="flex gap-2">
          {['style-default', 'transparent'].map((mode) => (
            <button
              key={mode}
              onClick={() => setBgMode(mode)}
              className={`flex-1 py-1.5 rounded-md border text-[10px] font-bold uppercase transition-all ${
                bgMode === mode 
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/30'
              }`}
            >
              {mode === 'style-default' ? 'Solid' : 'Clear'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <p className="text-[10px] uppercase text-gray-500 mb-2 font-mono">Features</p>
        
        {/* PREMIUM STOCK AUTOMATION TOGGLES */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div>
             <span className="text-xs font-bold text-emerald-400 block">Adobe Stock Mode</span>
             <span className="text-[9px] text-emerald-500/70">Auto-fixes safe margins & 1px borders</span>
          </div>
          <button 
            onClick={() => {
              const next = !stockMode;
              setStockMode(next);
              if (next) { setDebugMode(false); setBorderWidth(0.5); } // Auto constraint — 0.5px keeps small states visible
            }}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${stockMode ? 'bg-emerald-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${stockMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
          <div>
            <span className="text-xs text-gray-300 block">Include Small Islands</span>
            <span className="text-[9px] text-gray-500">Retains maximum geographic detail</span>
          </div>
          <button 
            onClick={() => setIncludeIslands(!includeIslands)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${includeIslands ? 'bg-indigo-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${includeIslands ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
          <span className="text-xs text-gray-300">Show Map Title</span>
          <button 
            onClick={() => setShowTitle(!showTitle)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${showTitle ? 'bg-indigo-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${showTitle ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
          <span className="text-xs text-gray-300">Show Region Labels</span>
          <button 
            onClick={() => setShowLabels(!showLabels)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${showLabels ? 'bg-emerald-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${showLabels ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
          <span className="text-xs text-gray-300">🔍 Debug Mode</span>
          <button 
            onClick={() => setDebugMode(!debugMode)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${debugMode ? 'bg-red-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${debugMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] uppercase text-gray-500 font-mono">Border Width</p>
          <span className="text-[10px] font-mono text-gray-400">{borderWidth.toFixed(1)}px</span>
        </div>
        <input 
          type="range" 
          min="0" max="3" step="0.1" 
          value={borderWidth}
          onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none accent-purple-500"
        />
      </div>

      {/* Dot Size Slider — only visible when Dotted style is selected */}
      {(selectedStyle === 'dotted' || selectedStyle === 'dotshape') && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] uppercase text-gray-500 font-mono">Dot Size</p>
            <span className="text-[10px] font-mono text-gray-400">{dotSize.toFixed(1)}px</span>
          </div>
          <input 
            type="range" 
            min="1" max="8" step="0.5" 
            value={dotSize}
            onChange={(e) => setDotSize(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-1">
            <span>Fine</span>
            <span>Large</span>
          </div>
        </div>
      )}
    </div>
  );
}
