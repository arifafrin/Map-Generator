'use client';

import { mapStyles } from '../utils/colorUtils';

export default function StyleSelector({ selectedStyle, onSelect }) {
  const styles = Object.values(mapStyles);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Premium Style
        </label>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
          19 Styles
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {styles.map(style => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden ${
                isSelected
                  ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/8'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-lg">{style.icon}</span>
                <span className={`text-xs font-semibold ${isSelected ? 'text-purple-300' : 'text-gray-200'}`}>
                  {style.name}
                </span>
              </div>
              
              {/* Preset preview pill based on style background */}
              <div 
                className="w-full h-8 mt-2 rounded-md border border-white/10 shadow-sm overflow-hidden flex"
                style={{ background: style.background !== 'transparent' ? style.background : '#eee' }}
              >
                {style.regionColors.slice(0, 3).map((col, i) => (
                  <div key={i} className="h-full flex-1 border-r border-white/5 last:border-0" style={{ backgroundColor: col }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
