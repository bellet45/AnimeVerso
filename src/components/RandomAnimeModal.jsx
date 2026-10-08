import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Play, Star, X, Sparkles, RefreshCw, Bookmark, Film, Tv, Calendar, Tag, AlertCircle } from 'lucide-react';
import { getRandomAnime } from '../services/api';
import { useStore } from '../store/useStore';

export default function RandomAnimeModal() {
  const { isRandomModalOpen, closeRandomModal, favorites, addFavorite, removeFavorite } = useStore();
  const navigate = useNavigate();

  const [anime, setAnime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const favsList = Array.isArray(favorites) ? favorites : [];
  const isFavorite = anime ? favsList.some(x => x && x.slug === anime.slug) : false;

  // Roll the dice to fetch a random anime
  const handleRoll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRandomAnime();
      setAnime(data);
    } catch (err) {
      console.error('Error in RandomAnimeModal handleRoll:', err);
      setError('No se pudo obtener un anime aleatorio en este momento. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When modal is opened, trigger roll if there's no anime loaded
  useEffect(() => {
    if (isRandomModalOpen && !anime) {
      handleRoll();
    }
  }, [isRandomModalOpen, anime, handleRoll]);

  // Keyboard shortcut listener (ESC to close, R to re-roll)
  useEffect(() => {
    if (!isRandomModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeRandomModal();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!isLoading) handleRoll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRandomModalOpen, isLoading, handleRoll, closeRandomModal]);

  // Action: Navigate to anime page and close modal
  const handleWatchNow = () => {
    if (!anime) return;
    closeRandomModal();
    navigate(`/anime/${anime.slug}`);
  };

  // Toggle favorite
  const handleToggleFavorite = () => {
    if (!anime) return;
    if (isFavorite) {
      removeFavorite(anime.slug);
    } else {
      addFavorite({
        slug: anime.slug,
        title: anime.title,
        image: anime.image,
        type: anime.type,
        status: anime.status
      }, 'pendiente');
    }
  };

  if (!isRandomModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeRandomModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
        />

        {/* Modal Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-50 w-full max-w-2xl bg-[#0b0b14] border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col my-auto"
        >
          {/* Header Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                <Dices className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="font-display font-bold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                  Anime Aleatorio
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </span>
                <span className="block text-[10px] text-gray-500 font-medium">
                  {isLoading ? 'Consultando el universo anime...' : 'Tu recomendación especial de hoy'}
                </span>
              </div>
            </div>

            <button
              onClick={closeRandomModal}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              aria-label="Cerrar modal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {isLoading ? (
              /* Loading State */
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-400/20"
                  >
                    <Dices className="w-10 h-10 text-cyan-400" />
                  </motion.div>
                  <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 animate-ping opacity-25" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-lg text-white">
                    Tirando los dados...
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Explorando miles de animes para elegir una recomendación única para ti.
                  </p>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-base text-gray-200">
                    Ocurrió un error
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm">
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleRoll}
                  className="px-6 py-2.5 rounded-full bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-400/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Intentar de nuevo
                </button>
              </div>
            ) : anime ? (
              /* Loaded Anime Card */
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Left Column: Cover Poster */}
                <div className="w-full md:w-5/12 flex-shrink-0">
                  <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-white/5 group">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/90 via-transparent to-transparent opacity-60" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                      {anime.type && (
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-purple-950/85 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                          {anime.type}
                        </span>
                      )}
                      {anime.status && (
                        <span className={`text-[10px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded-md backdrop-blur-md ${
                          anime.status.toLowerCase().includes('emision') || anime.status.toLowerCase() === 'ongoing'
                            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/30'
                            : 'bg-zinc-900/85 text-zinc-300 border-zinc-700/30'
                        }`}>
                          {anime.status}
                        </span>
                      )}
                    </div>

                    {/* Quick favorite button */}
                    <button
                      onClick={handleToggleFavorite}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-xl border backdrop-blur-md z-20 transition-all cursor-pointer ${
                        isFavorite
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400 shadow-md shadow-amber-400/20'
                          : 'bg-black/60 border-white/10 text-white hover:text-amber-400 hover:border-amber-400/50'
                      }`}
                      title={isFavorite ? 'En favoritos' : 'Guardar en pendientes'}
                    >
                      <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Right Column: Information & Actions */}
                <div className="w-full md:w-7/12 flex flex-col justify-between space-y-4">
                  
                  {/* Title & Alt Title */}
                  <div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-snug line-clamp-2">
                      {anime.title}
                    </h3>
                    {anime.altTitle && (
                      <p className="text-xs text-gray-500 font-semibold mt-1 truncate">
                        {anime.altTitle}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {anime.genres && anime.genres.slice(0, 4).map((genre, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-md"
                      >
                        {genre}
                      </span>
                    ))}
                    {anime.episodesCount > 0 && (
                      <span className="text-[10px] font-semibold bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md">
                        {anime.episodesCount} Episodios
                      </span>
                    )}
                  </div>

                  {/* Synopsis Box */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">
                      Sinopsis
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed max-h-36 overflow-y-auto pr-1">
                      {anime.synopsis}
                    </p>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    
                    {/* Primary Button: Watch Now */}
                    <button
                      onClick={handleWatchNow}
                      className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play fill="currentColor" className="w-4 h-4" />
                      Ver Anime
                    </button>

                    {/* Secondary Button: Roll Again */}
                    <button
                      onClick={handleRoll}
                      disabled={isLoading}
                      className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-purple-400/40 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      title="Probar con otro anime (tecla R)"
                    >
                      <Dices className="w-4 h-4 text-purple-400" />
                      <span>Otro</span>
                    </button>

                  </div>

                </div>

              </div>
            ) : null}
          </div>

          {/* Footer tip */}
          <div className="px-6 py-2.5 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
            <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">ESC</kbd> para salir</span>
            <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">R</kbd> para tirar de nuevo</span>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
