import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Play, Eye, Bookmark, CheckCircle, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AnimeCard({ anime }) {
  const { slug, title, image, type, status } = anime;
  const { favorites, addFavorite, removeFavorite } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const favsList = Array.isArray(favorites) ? favorites : [];
  const isFavorite = favsList.some(x => x && x.slug === slug);
  const currentFavorite = favsList.find(x => x && x.slug === slug);
  const currentListType = currentFavorite ? (currentFavorite.listType || 'pendiente') : null;

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8 }}
      className="group relative rounded-xl overflow-hidden glass-card flex flex-col h-full border border-white/5 shadow-lg shadow-black/30 cursor-pointer"
    >
      <Link to={`/anime/${slug}`} className="flex flex-col h-full">
        {/* Cover Image Container */}
        <div className="aspect-[3/4] relative overflow-hidden bg-white/5">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          
          {/* Black Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/95 via-[#080810]/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />

          {/* Quick Play Button (shows on card hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg shadow-cyan-400/50 hover:bg-cyan-300 hover:scale-105 active:scale-95 transition-all">
              <Play fill="currentColor" className="ml-1 w-5 h-5" />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {type && (
              <span className="text-[10px] font-bold tracking-widest uppercase bg-purple-950/80 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded backdrop-blur-md">
                {type}
              </span>
            )}
            {status && (
              <span className={`text-[10px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded backdrop-blur-md ${
                status.toLowerCase().includes('emision') || status.toLowerCase() === 'ongoing'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/20'
              }`}>
                {status}
              </span>
            )}
          </div>

          {/* Favorite star toggle button */}
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-md z-20 transition-all duration-300 ${
              isFavorite
                ? currentListType === 'viendo'
                  ? 'bg-cyan-400/20 border-cyan-400 text-cyan-400 scale-110'
                  : currentListType === 'terminado'
                  ? 'bg-emerald-400/20 border-emerald-400 text-emerald-400 scale-110'
                  : 'bg-amber-400/20 border-amber-400 text-amber-400 scale-110'
                : 'bg-black/50 border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50'
            }`}
            aria-label="Agregar a favoritos"
          >
            <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {showDropdown && (
            <>
              {/* Backdrop to close the dropdown */}
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(false);
                }}
              />
              {/* Dropdown Menu */}
              <div 
                className="absolute right-2 top-10 w-36 bg-black/95 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-md z-40 flex flex-col gap-1 text-[11px] font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <button
                  onClick={() => {
                    addFavorite({ slug, title, image, type, status }, 'viendo');
                    setShowDropdown(false);
                  }}
                  className={`w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentListType === 'viendo'
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Viendo
                </button>
                <button
                  onClick={() => {
                    addFavorite({ slug, title, image, type, status }, 'pendiente');
                    setShowDropdown(false);
                  }}
                  className={`w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentListType === 'pendiente'
                      ? 'bg-amber-500/20 text-amber-400 font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  Pendiente
                </button>
                <button
                  onClick={() => {
                    addFavorite({ slug, title, image, type, status }, 'terminado');
                    setShowDropdown(false);
                  }}
                  className={`w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentListType === 'terminado'
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Terminado
                </button>
                {isFavorite && (
                  <button
                    onClick={() => {
                      removeFavorite(slug);
                      setShowDropdown(false);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg text-left flex items-center gap-1.5 text-red-400 hover:bg-red-500/10 transition-all border-t border-white/5 mt-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Text Container */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <h3 className="font-display font-medium text-sm text-gray-200 line-clamp-2 group-hover:text-cyan-300 transition-colors leading-tight">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
