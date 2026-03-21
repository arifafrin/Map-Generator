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
  atomSize, setAtomSize,
  atomX, setAtomX,
  atomY, setAtomY,
  electronCount, setElectronCount,
  pinEnabled, setPinEnabled,
  pinSize, setPinSize,
  pinColor, setPinColor,
  selectedStyle
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Details & Layout
        </label>
      </div>

      {/* Workspace & Layout Card */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md">
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-sm">🖼️</span> Workspace Layout
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            {['square', 'portrait', 'landscape'].map((mode) => (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                className={`flex-1 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all duration-300 ${
                  layout === mode 
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/20'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['style-default', 'transparent'].map((mode) => (
              <button
                key={mode}
                onClick={() => setBgMode(mode)}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all duration-300 ${
                  bgMode === mode 
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' 
                  : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/20'
                }`}
              >
                {mode === 'style-default' ? 'Solid Background' : 'Clear Background'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md">
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-sm">⚙️</span> Map Features
        </h3>
        
        <div className="space-y-3">
          {/* PREMIUM STOCK AUTOMATION TOGGLES */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all hover:bg-emerald-500/10">
            <div>
               <span className="text-[11px] font-bold text-emerald-400 block tracking-wide">Adobe Stock Compatibility</span>
               <span className="text-[9px] text-emerald-500/60 block mt-0.5">Enforces safe margins & 1px pristine borders</span>
            </div>
            <button 
              onClick={() => {
                const next = !stockMode;
                setStockMode(next);
                if (next) { setDebugMode(false); setBorderWidth(0.5); }
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${stockMode ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${stockMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
             <div>
               <span className="text-[11px] font-semibold text-gray-300 block group-hover:text-white transition-colors">Include Small Islands</span>
               <span className="text-[9px] text-gray-500">Retains max geographical detail</span>
             </div>
            <button 
              onClick={() => setIncludeIslands(!includeIslands)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${includeIslands ? 'bg-indigo-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${includeIslands ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
            <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Show Map Title</span>
            <button 
              onClick={() => setShowTitle(!showTitle)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showTitle ? 'bg-indigo-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showTitle ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
            <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Show Region Labels</span>
            <button 
              onClick={() => setShowLabels(!showLabels)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showLabels ? 'bg-teal-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showLabels ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 mt-2 pt-2 border-t border-white/5 group">
            <span className="text-[11px] font-semibold text-gray-400 group-hover:text-red-300 transition-colors">🔍 Developer Debug Mode</span>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${debugMode ? 'bg-red-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${debugMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Line & Scale Settings */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md">
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-4 flex items-center gap-2">
          <span className="text-sm">📐</span> Geometry Scaling
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Stroke Border Width</p>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">{borderWidth.toFixed(1)}px</span>
          </div>
          <input 
            type="range" 
            min="0" max="3" step="0.1" 
            value={borderWidth}
            onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer border border-white/5 accent-purple-500 outline-none hover:bg-black/60 transition-colors"
          />
        </div>

        {/* Dot Size Slider — only visible when Dotted style is selected */}
        {(selectedStyle === 'dotted' || selectedStyle === 'dotshape') && (
          <div className="pt-2 border-t border-white/5 mt-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Dot Radius Matrix</p>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">{dotSize.toFixed(1)}px</span>
            </div>
            <input 
              type="range" 
              min="1" max="8" step="0.5" 
              value={dotSize}
              onChange={(e) => setDotSize(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer border border-white/5 accent-blue-500 outline-none hover:bg-black/60 transition-colors"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1.5 font-medium uppercase">
              <span>Fine</span>
              <span>Ultra</span>
            </div>
          </div>
        )}
      </div>

      {/* Location Pin Controls */}
      <div className={`transition-all duration-500 border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md ${pinEnabled ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.03]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <div>
              <span className={`text-[11px] font-bold block tracking-wide ${pinEnabled ? 'text-red-400' : 'text-gray-300'}`}>Local Map Pins</span>
              <span className="text-[9px] text-gray-500 block mt-0.5">Automated flag embedding</span>
            </div>
          </div>
          <button 
            onClick={() => setPinEnabled(!pinEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${pinEnabled ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${pinEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {pinEnabled && (
          <div className="mt-5 space-y-5 animate-fade-in pb-1">
            {/* Pin Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Pin Physical Scale</p>
                <span className="text-[10px] font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">{pinSize}px</span>
              </div>
              <input 
                type="range" min="12" max="150" step="1" 
                value={pinSize}
                onChange={(e) => setPinSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer border border-white/5 accent-red-500 outline-none hover:bg-black/60 transition-colors"
                title="Size determines collision culling density!"
              />
              <p className="text-[9px] text-gray-500 mt-1.5 text-center italic">Larger sizes naturally reduce density overlap</p>
            </div>

            {/* Pin Colors */}
            <div>
              <p className="text-[11px] font-semibold text-gray-300 tracking-wide mb-2.5">Teardrop Color</p>
              <div className="flex gap-2.5 justify-center">
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
          </div>
        )}
      </div>

      {/* Atom Settings (Only for Network Style) */}
      {selectedStyle === 'network' && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <p className="text-[10px] uppercase text-indigo-400 font-mono tracking-wider mb-2">⚛️ Atom Controls</p>
          
          {/* Atom Size Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-gray-500 font-mono">Atom Scale</p>
              <span className="text-[10px] font-mono text-gray-400">{atomSize}%</span>
            </div>
            <input 
              type="range" min="10" max="100" step="1" 
              value={atomSize}
              onChange={(e) => setAtomSize(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none accent-indigo-500"
            />
          </div>

          {/* Atom X Position */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-gray-500 font-mono">Horizontal Position</p>
              <span className="text-[10px] font-mono text-gray-400">{atomX}%</span>
            </div>
            <input 
              type="range" min="10" max="90" step="1" 
              value={atomX}
              onChange={(e) => setAtomX(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none accent-indigo-500"
            />
          </div>

          {/* Atom Y Position */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-gray-500 font-mono">Vertical Position</p>
              <span className="text-[10px] font-mono text-gray-400">{atomY}%</span>
            </div>
            <input 
              type="range" min="10" max="90" step="1" 
              value={atomY}
              onChange={(e) => setAtomY(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none accent-indigo-500"
            />
          </div>

          {/* Electron Dots Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-gray-500 font-mono">Electron Dots</p>
              <span className="text-[10px] font-mono text-gray-400">{electronCount}</span>
            </div>
            <input 
              type="range" min="0" max="36" step="1" 
              value={electronCount}
              onChange={(e) => setElectronCount(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer border-none accent-indigo-500"
            />
          </div>

          {/* Center Reset */}
          <button
            onClick={() => { setAtomX(50); setAtomY(50); }}
            className="w-full py-2 px-3 mt-2 rounded text-[10px] text-gray-500 hover:text-gray-300 transition-colors underline decoration-gray-600"
          >
            Reset to Center
          </button>
        </div>
      )}

    </div>
  );
}

