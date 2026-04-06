export default function DetailControls({ 
  bgMode, setBgMode, 
  customBgColor, setCustomBgColor,
  layout, setLayout, 
  showTitle, setShowTitle,
  showLabels, setShowLabels,
  borderWidth, setBorderWidth,
  debugMode, setDebugMode,
  stockMode, setStockMode,
  includeIslands, setIncludeIslands,
  dotSize, setDotSize,
  halftoneShape, setHalftoneShape,
  showAtom = true, setShowAtom,
  activeAtomId, setActiveAtomId,
  atomSize, setAtomSize,
  atomPositions, setAtomPositions,
  electronCount, setElectronCount,
  atomColor, setAtomColor,
  pinEnabled, setPinEnabled,
  pinSize, setPinSize,
  pinColor, setPinColor,
  selectedStyle,
  animationEnabled, setAnimationEnabled,
  animationStyle, setAnimationStyle,
  animationSpeed, setAnimationSpeed
}) {
  const activeAtom = atomPositions?.find(a => a.id === activeAtomId) || atomPositions?.[0] || { x: 50, y: 50 };
  const atomX = activeAtom.x;
  const atomY = activeAtom.y;
  const currentAtomSize = activeAtom.size ?? atomSize;
  const currentElectronCount = activeAtom.electrons ?? electronCount;

  const handleUpdateActiveAtom = (updates) => {
     if (setAtomPositions) {
         setAtomPositions(prev => prev.map(a => 
             a.id === activeAtom.id ? { ...a, ...updates } : a
         ));
     }
  };

  const handleRecenterAtoms = () => {
     if (setAtomPositions) {
         setAtomPositions([{ id: 'atom-0', x: 50, y: 50 }]);
     }
     if (setActiveAtomId) setActiveAtomId('atom-0');
     if (setAtomSize) setAtomSize(32);
     if (setElectronCount) setElectronCount(12);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Details & Layout
        </label>
      </div>

      {/* Workspace & Layout Card */}
      <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 border-t-white/20 rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
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

        </div>
      </div>

      {/* Features Card */}
      <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 border-t-white/20 rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
          <span className="text-sm">⚙️</span> Map Features
        </h3>
        
        <div className="space-y-3">
          {/* PREMIUM STOCK AUTOMATION TOGGLES */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all hover:bg-emerald-500/10">
            <div>
               <span className="text-[11px] font-bold text-emerald-400 block tracking-wide">Clean Export Mode</span>
               <span className="text-[9px] text-emerald-500/60 block mt-0.5">Prevents edges from getting cut off during export</span>
            </div>
            <button 
              onClick={() => {
                const next = !stockMode;
                setStockMode(next);
                if (next) { setDebugMode(false); setBorderWidth(0.5); }
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${stockMode ? 'bg-[#1877F2]' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${stockMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
             <div>
               <span className="text-[11px] font-semibold text-gray-300 block group-hover:text-white transition-colors">Show Small Islands</span>
               <span className="text-[9px] text-gray-500">Keep tiny shapes on the map</span>
             </div>
            <button 
              onClick={() => setIncludeIslands(!includeIslands)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${includeIslands ? 'bg-[#1877F2]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${includeIslands ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
            <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Show Country Name</span>
            <button 
              onClick={() => setShowTitle(!showTitle)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showTitle ? 'bg-[#1877F2]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showTitle ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
            <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Show State/Region Names</span>
            <button 
              onClick={() => setShowLabels(!showLabels)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showLabels ? 'bg-[#1877F2]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showLabels ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 mt-2 pt-2 border-t border-white/5 group">
            <span className="text-[11px] font-semibold text-gray-400 group-hover:text-red-300 transition-colors">🔍 Show Bounding Boxes</span>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${debugMode ? 'bg-[#1877F2]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${debugMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Line & Scale Settings */}
      {selectedStyle !== 'neuralmesh' && (
      <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 border-t-white/20 rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h3 className="text-[11px] uppercase text-gray-400 font-bold mb-4 flex items-center gap-2">
          <span className="text-sm">📐</span> Map Detail Settings
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Border Line Thickness</p>
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

        {/* Dot Size Slider — visible when Dotted or Neural Mesh or Halftone Draw style is selected */}
        {(selectedStyle === 'dotted' || selectedStyle === 'dotshape' || selectedStyle === 'neuralmesh' || selectedStyle === 'pencilnetwork' || selectedStyle === 'pencilradial') && (
          <div className="pt-2 border-t border-white/5 mt-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Halftone Dot Size</p>
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
              <span>Large</span>
            </div>
            
            {/* Halftone Shape Selector */}
            {(selectedStyle === 'pencilradial' || selectedStyle === 'dotted' || selectedStyle === 'dotshape') && (
              <div className="pt-3 mt-3 border-t border-white/5">
                <p className="text-[11px] font-semibold text-gray-300 tracking-wide mb-2 pointer-events-none">Halftone Pattern Shape</p>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'circle', icon: '●', label: 'Dot' },
                    { id: 'heart', icon: '♥', label: 'Love' },
                    { id: 'square', icon: '■', label: 'Square' },
                    { id: 'diamond', icon: '◆', label: 'Diamond' }
                  ].map(shape => (
                    <button
                      key={shape.id}
                      onClick={() => setHalftoneShape && setHalftoneShape(shape.id)}
                      className={`py-1.5 flex flex-col items-center justify-center rounded transition-all border ${halftoneShape === shape.id ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'bg-black/20 text-gray-500 hover:text-gray-300 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                    >
                      <span className="text-sm leading-none mb-1">{shape.icon}</span>
                      <span className="text-[8px] uppercase font-bold tracking-wider">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* ═══ MAP ANIMATION CONTROLS ═══ */}
      <div className={`transition-all duration-500 border rounded-xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group ${animationEnabled ? 'bg-gradient-to-b from-violet-500/10 to-fuchsia-500/5 border-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.1)]' : 'bg-gradient-to-b from-white/[0.05] to-transparent border-white/10 border-t-white/20'}`}>
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-400/50 to-transparent transition-opacity duration-700 ${animationEnabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎬</span>
            <div>
              <span className={`text-[11px] font-bold block tracking-wide ${animationEnabled ? 'text-violet-300' : 'text-gray-300'}`}>Map Animation</span>
              <span className="text-[9px] text-gray-500 block mt-0.5">Animate map regions live</span>
            </div>
          </div>
          <button 
            onClick={() => setAnimationEnabled && setAnimationEnabled(!animationEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${animationEnabled ? 'bg-violet-500' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${animationEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {animationEnabled && (
          <div className="mt-5 space-y-5 animate-fade-in pb-1">
            
            {/* Animation Style Selector */}
            <div>
              <p className="text-[11px] font-semibold text-gray-300 tracking-wide mb-2.5">Animation Style</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'assemble',   icon: '🧩', label: 'Assemble' },
                  { id: 'reveal',     icon: '✨', label: 'Reveal' },
                  { id: 'pulse',      icon: '💫', label: 'Pulse' },
                  { id: 'wave',       icon: '🌊', label: 'Wave' },
                  { id: 'draw',       icon: '✏️', label: 'Draw' },
                  { id: 'breathe',    icon: '🫧', label: 'Breathe' },
                  { id: 'radar',      icon: '📡', label: 'Radar' },
                  { id: 'colorshift', icon: '🎨', label: 'Shift' },
                  { id: 'float',      icon: '🎈', label: 'Float' },
                ].map(anim => (
                  <button
                    key={anim.id}
                    onClick={() => setAnimationStyle && setAnimationStyle(anim.id)}
                    className={`py-2 flex flex-col items-center justify-center rounded-lg transition-all duration-200 border ${
                      animationStyle === anim.id 
                        ? 'bg-violet-500/20 border-violet-500/40 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.2)]' 
                        : 'bg-black/20 text-gray-500 hover:text-gray-300 border-white/5 hover:bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-sm leading-none mb-1">{anim.icon}</span>
                    <span className="text-[8px] uppercase font-bold tracking-wider">{anim.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Speed</p>
                <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">{animationSpeed.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.2" max="3" step="0.1" 
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed && setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer border border-white/5 accent-violet-500 outline-none hover:bg-black/60 transition-colors"
              />
              <div className="flex justify-between text-[8.5px] text-gray-600 mt-1.5 font-bold uppercase tracking-widest">
                <span>Slow</span><span>Fast</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Pin Controls */}
      <div className={`transition-all duration-500 border border-white/5 rounded-xl p-4 shadow-sm backdrop-blur-md ${pinEnabled ? 'bg-[#1877F2]/5 border-[#1877F2]/20' : 'bg-white/[0.03]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <div>
              <span className={`text-[11px] font-bold block tracking-wide ${pinEnabled ? 'text-blue-400' : 'text-gray-300'}`}>Show Map Pins</span>
              <span className="text-[9px] text-gray-500 block mt-0.5">Display location markers on the map</span>
            </div>
          </div>
          <button 
            onClick={() => setPinEnabled(!pinEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${pinEnabled ? 'bg-[#1877F2]' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${pinEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {pinEnabled && (
          <div className="mt-5 space-y-5 animate-fade-in pb-1">
            {/* Pin Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[11px] font-semibold text-gray-300 tracking-wide">Pin Size</p>
                <span className="text-[10px] font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">{pinSize}px</span>
              </div>
              <input 
                type="range" min="12" max="150" step="1" 
                value={pinSize}
                onChange={(e) => setPinSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer border border-white/5 accent-red-500 outline-none hover:bg-black/60 transition-colors"
                title="Adjust the size of the location markers"
              />
              <p className="text-[9px] text-gray-500 mt-1.5 text-center italic">Larger pins mean fewer pins will fit overall</p>
            </div>
          </div>
        )}
      </div>

      {/* Neural Mesh Master Control Center */}
      {selectedStyle === 'neuralmesh' && (
         <div className="mt-2 bg-[#0f0b1a] border border-indigo-500/20 rounded-xl p-5 shadow-xl backdrop-blur-xl animate-fade-in">
            <h3 className="text-[12px] uppercase text-indigo-400 font-black tracking-widest mb-5 flex items-center gap-2.5">
              <span className="text-sm">🕸️</span> Network Settings
            </h3>
            
            {/* Node System */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3.5 border-b border-indigo-500/20 pb-1.5">
                 <span className="text-[10px] text-indigo-300">⬤</span>
                 <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Map Style Nodes</p>
              </div>
              <div className="space-y-5 px-1">
                {/* Spacing Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Point Density</p>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{atomSize}</span>
                  </div>
                  <input type="range" min="10" max="150" step="1" value={atomSize} onChange={(e) => setAtomSize(parseInt(e.target.value))} className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer border-none accent-indigo-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Controls how closely dots are packed together.</p>
                </div>
                {/* Size Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Dot Size</p>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{dotSize.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="1" max="8" step="0.5" value={dotSize} onChange={(e) => setDotSize(parseFloat(e.target.value))} className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer border-none accent-indigo-400" />
                  <div className="flex justify-between text-[8.5px] text-indigo-500/40 mt-1.5 font-bold uppercase tracking-widest"><span>Micro</span><span>Massive</span></div>
                </div>
              </div>
            </div>

            {/* Line System */}
            <div>
              <div className="flex items-center gap-2 mb-3.5 border-b border-pink-500/20 pb-1.5">
                 <span className="text-[10px] text-pink-300">➖</span>
                 <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Line Network</p>
              </div>
              <div className="space-y-5 px-1">
                {/* Reach Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Line Length</p>
                    <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-1.5 py-0.5 rounded">{electronCount}</span>
                  </div>
                  <input type="range" min="0" max="40" step="1" value={electronCount} onChange={(e) => setElectronCount(parseInt(e.target.value))} className="w-full h-1.5 bg-pink-950 rounded-lg appearance-none cursor-pointer border-none accent-pink-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">How far the connecting lines can reach between dots.</p>
                </div>
                {/* Thickness Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Line Thickness</p>
                    <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-1.5 py-0.5 rounded">{borderWidth.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0" max="3" step="0.1" value={borderWidth} onChange={(e) => setBorderWidth(parseFloat(e.target.value))} className="w-full h-1.5 bg-pink-950 rounded-lg appearance-none cursor-pointer border-none accent-pink-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Adjust how thick the connecting lines appear.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-white/5 pt-5">
              <div className="flex items-center gap-2 mb-3.5 border-b border-emerald-500/20 pb-1.5">
                 <span className="text-[10px] text-emerald-300">🗺️</span>
                 <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Geographic Bounds</p>
              </div>
              <div className="space-y-5 px-1">
                {/* Outline Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Map Outline Visibility</p>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">{borderWidth === 0 ? 'HIDDEN' : borderWidth.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0" max="3" step="0.1" value={borderWidth} onChange={(e) => setBorderWidth(parseFloat(e.target.value))} className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer border-none accent-emerald-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Set to 0 to hide country borders and show only the dot pattern.</p>
                </div>
              </div>
            </div>
         </div>
      )}

      {/* Atom Controls migrated to page.js sidebar */}


    </div>
  );
}

