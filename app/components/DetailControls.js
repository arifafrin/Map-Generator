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
  showAtom = true, setShowAtom,
  activeAtomId, setActiveAtomId,
  atomSize, setAtomSize,
  atomPositions, setAtomPositions,
  electronCount, setElectronCount,
  pinEnabled, setPinEnabled,
  pinSize, setPinSize,
  pinColor, setPinColor,
  selectedStyle
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
               <span className="text-[11px] font-bold text-emerald-400 block tracking-wide">Adobe Stock Compatibility</span>
               <span className="text-[9px] text-emerald-500/60 block mt-0.5">Enforces safe margins & 1px pristine borders</span>
            </div>
            <button 
              onClick={() => {
                const next = !stockMode;
                setStockMode(next);
                if (next) { setDebugMode(false); setBorderWidth(0.5); }
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${stockMode ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
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
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${includeIslands ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${includeIslands ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
            <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Show Map Title</span>
            <button 
              onClick={() => setShowTitle(!showTitle)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showTitle ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showTitle ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 group">
            <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Show Region Labels</span>
            <button 
              onClick={() => setShowLabels(!showLabels)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showLabels ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${showLabels ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 mt-2 pt-2 border-t border-white/5 group">
            <span className="text-[11px] font-semibold text-gray-400 group-hover:text-red-300 transition-colors">🔍 Developer Debug Mode</span>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${debugMode ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}
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

        {/* Dot Size Slider — visible when Dotted or Neural Mesh style is selected */}
        {(selectedStyle === 'dotted' || selectedStyle === 'dotshape' || selectedStyle === 'neuralmesh') && (
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
      )}

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
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${pinEnabled ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
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
          </div>
        )}
      </div>

      {/* Neural Mesh Master Control Center */}
      {selectedStyle === 'neuralmesh' && (
         <div className="mt-2 bg-[#0f0b1a] border border-indigo-500/20 rounded-xl p-5 shadow-xl backdrop-blur-xl animate-fade-in">
            <h3 className="text-[12px] uppercase text-indigo-400 font-black tracking-widest mb-5 flex items-center gap-2.5">
              <span className="text-sm">🕸️</span> Neural Studio
            </h3>
            
            {/* Node System */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3.5 border-b border-indigo-500/20 pb-1.5">
                 <span className="text-[10px] text-indigo-300">⬤</span>
                 <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Node System</p>
              </div>
              <div className="space-y-5 px-1">
                {/* Spacing Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Node Spacing Gap</p>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{atomSize}</span>
                  </div>
                  <input type="range" min="10" max="150" step="1" value={atomSize} onChange={(e) => setAtomSize(parseInt(e.target.value))} className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer border-none accent-indigo-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Controls population density across the map.</p>
                </div>
                {/* Size Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Node Physical Radius</p>
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
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Max Connection Reach</p>
                    <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-1.5 py-0.5 rounded">{electronCount}</span>
                  </div>
                  <input type="range" min="0" max="40" step="1" value={electronCount} onChange={(e) => setElectronCount(parseInt(e.target.value))} className="w-full h-1.5 bg-pink-950 rounded-lg appearance-none cursor-pointer border-none accent-pink-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Allows nodes to cast synaptic webs much further.</p>
                </div>
                {/* Thickness Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Synaptic Line Weight</p>
                    <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-1.5 py-0.5 rounded">{borderWidth.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0" max="3" step="0.1" value={borderWidth} onChange={(e) => setBorderWidth(parseFloat(e.target.value))} className="w-full h-1.5 bg-pink-950 rounded-lg appearance-none cursor-pointer border-none accent-pink-400" />
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Increases baseline trunk thickness of node links.</p>
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
                  <p className="text-[9px] text-gray-500 mt-1.5 leading-tight">Drag to 0 to completely hide territorial shapes, revealing a pure floating mesh. Color inherits standard palette.</p>
                </div>
              </div>
            </div>
         </div>
      )}

      {/* Atom Controls */}
      {(selectedStyle === 'network' || selectedStyle === 'pencilnetwork') && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between mb-1 border-b border-indigo-500/20 pb-2">
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-indigo-300">⚛️</span>
               <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Atom Generator</p>
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
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${showAtom ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
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
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[11px] text-gray-200 font-semibold tracking-wide">Electron Particles</p>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{currentElectronCount}</span>
              </div>
              <input type="range" min="0" max="48" step="1" value={currentElectronCount} onChange={(e) => handleUpdateActiveAtom({ electrons: parseInt(e.target.value) })} className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer border-none accent-indigo-400" />
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

