import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X, Film } from 'lucide-react';
import { searchAnime } from '../services/api';

export default function SearchBar({ placeholder = "Buscar anime..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Debounced Auto-complete
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchAnime(query);
        setSuggestions(res.animes?.slice(0, 5) || []); // Limit suggestions to 5
      } catch (e) {
        console.error("Autocomplete error:", e);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (slug) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/anime/${slug}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md z-50">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          id="search-input-field"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-11 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 transition-all backdrop-blur-md"
        />
        
        {/* Search icon */}
        <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />

        {/* Action icons (Loader / Clear button) */}
        <div className="absolute right-4 top-3 flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Auto-complete Dropdown */}
      {isOpen && (suggestions.length > 0 || (query.trim().length >= 3 && !isLoading)) && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
          {suggestions.length > 0 ? (
            <div className="py-2 divide-y divide-white/5">
              <div className="px-4 py-1 text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                Sugerencias
              </div>
              {suggestions.map((anime) => (
                <button
                  key={anime.slug}
                  onClick={() => handleSuggestionClick(anime.slug)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 text-left transition-colors cursor-pointer group"
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-10 h-14 object-cover rounded-lg bg-white/5 border border-white/5 group-hover:border-cyan-500/20"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="font-semibold text-gray-200 text-sm truncate group-hover:text-cyan-300 transition-colors">
                      {anime.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span className="text-purple-400">{anime.type}</span>
                      <span>•</span>
                      <span className={anime.status?.toLowerCase().includes('emision') ? 'text-emerald-400' : 'text-gray-500'}>
                        {anime.status || 'Finalizado'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">
              No se encontraron animes para "{query}"
            </div>
          )}
          
          {query.trim().length >= 3 && (
            <button
              onClick={handleSearchSubmit}
              className="w-full bg-white/5 hover:bg-white/10 py-2.5 px-4 text-xs font-bold text-cyan-400 flex items-center justify-center gap-1.5 border-t border-white/5 transition-all cursor-pointer"
            >
              <Film className="w-3.5 h-3.5" />
              Ver todos los resultados
            </button>
          )}
        </div>
      )}
    </div>
  );
}
