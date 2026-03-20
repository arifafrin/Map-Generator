'use client';

import { useState, useRef, useEffect } from 'react';
import { continents } from '../data/countries';

export default function CountrySelector({ countries, selectedCountry, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeContinent, setActiveContinent] = useState('All');
  const dropdownRef = useRef(null);

  const selected = countries.find(c => c.code === selectedCountry);
  
  const filtered = countries.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesContinent = activeContinent === 'All' || c.continent === activeContinent;
    return matchesSearch && matchesContinent;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        Country / Region
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-left group"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">{selected?.flag || '🌍'}</span>
          <span className="text-sm font-medium text-gray-200">
            {selected?.name || 'Select a country'}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full md:w-[320px] -right-2 mt-2 py-2 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 max-h-[400px] flex flex-col overflow-hidden">
          <div className="px-3 pb-2 pt-1 border-b border-white/10">
            <input
              type="text"
              placeholder="Search 170+ countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 mb-3"
              autoFocus
            />
            
            {/* Continent Tabs */}
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 mask-linear">
              {continents.map(continent => (
                <button
                  key={continent}
                  onClick={() => setActiveContinent(continent)}
                  className={`flex-shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-md transition-all duration-200 ${
                    activeContinent === continent 
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {filtered.length > 0 ? (
              filtered.map(country => (
                <button
                  key={country.code}
                  onClick={() => {
                    onSelect(country.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-purple-500/10 transition-colors duration-200 ${
                    selectedCountry === country.code ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500 bg-gradient-to-r from-purple-500/10 to-transparent' : 'text-gray-300 border-l-2 border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-sm font-medium">{country.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{country.code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 flex flex-col items-center gap-2 text-center text-sm text-gray-500">
                <span className="text-2xl">🔍</span>
                <p>No countries found in<br/>this region or search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
