import React, { useState, useEffect, useRef } from 'react';
import { Play, Tv, Maximize, Film, ChevronRight, Eye, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function VideoPlayer({ 
  servers = [], 
  animeTitle = '', 
  episodeNumber = 1, 
  slug = '', 
  coverImage = '',
  hasNext = false,
  onNextEpisode = null 
}) {
  const [currentServerIdx, setCurrentServerIdx] = useState(0);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const { updateProgress, continueWatching } = useStore();

  const duration = 1440; // standard anime episode duration (24 minutes)

  const cwList = Array.isArray(continueWatching) ? continueWatching : [];

  // Find if this episode has saved progress
  const savedProgress = cwList.find(
    x => x && x.slug === slug && String(x.episodeNumber) === String(episodeNumber)
  );

  const [progressTime, setProgressTime] = useState(savedProgress?.progressTime || 300);

  // Sync state with savedProgress when page mounts or episode changes
  useEffect(() => {
    setProgressTime(savedProgress?.progressTime || 300);
  }, [slug, episodeNumber]);

  // Save initial progress when the episode loads
  useEffect(() => {
    if (!slug || !episodeNumber) return;
    
    updateProgress(
      slug,
      episodeNumber,
      animeTitle,
      String(episodeNumber).toLowerCase() === 'pelicula' ? 'Película' : `Episodio ${episodeNumber}`,
      coverImage,
      progressTime,
      duration
    );
  }, [slug, episodeNumber]);

  // Set watched state if progress is almost complete or manually toggled
  useEffect(() => {
    if (savedProgress && savedProgress.percentage > 85) {
      setIsWatched(true);
    } else {
      setIsWatched(false);
    }
  }, [savedProgress, episodeNumber]);

  // Toggle cinema mode helper
  const handleCinemaToggle = () => {
    setIsCinemaMode(!isCinemaMode);
    if (!isCinemaMode) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  // Clean up cinema mode class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const handleMarkAsWatched = () => {
    const newProgress = isWatched ? 300 : 1430; // Toggle between 5m and 23.8m
    setIsWatched(!isWatched);
    setProgressTime(newProgress);
    updateProgress(
      slug,
      episodeNumber,
      animeTitle,
      String(episodeNumber).toLowerCase() === 'pelicula' ? 'Película' : `Episodio ${episodeNumber}`,
      coverImage,
      newProgress,
      duration
    );
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setProgressTime(val);
    updateProgress(
      slug,
      episodeNumber,
      animeTitle,
      String(episodeNumber).toLowerCase() === 'pelicula' ? 'Película' : `Episodio ${episodeNumber}`,
      coverImage,
      val,
      duration
    );
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (servers.length === 0) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
        <Tv className="w-12 h-12 text-gray-500 mb-3 animate-bounce" />
        <h3 className="font-display font-semibold text-gray-300">No hay servidores disponibles</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">Este episodio aún se está procesando o los enlaces externos no se cargaron correctamente.</p>
      </div>
    );
  }

  const activeServer = servers[currentServerIdx];

  return (
    <div className={`space-y-6 ${isCinemaMode ? 'cinema-mode' : ''}`}>
      {/* Cinema Overlay */}
      {isCinemaMode && (
        <div 
          onClick={handleCinemaToggle} 
          className="cinema-overlay animate-fadeIn" 
        />
      )}

      {/* Video Frame */}
      <div className="relative z-100 aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-cyan-500/5">
        <iframe
          src={activeServer.url}
          title={`Reproductor ${activeServer.name}`}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Playback Progress Timeline (Manual & Simulated) */}
      <div className="relative z-100 p-4 rounded-2xl glass-panel border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold text-cyan-400">{formatTime(progressTime)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Ajustar progreso de reproducción
          </span>
          <span className="font-semibold text-gray-300">{formatTime(duration)}</span>
        </div>
        
        <div className="relative group flex items-center">
          <input
            type="range"
            min="0"
            max={duration}
            value={progressTime}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
            style={{
              background: `linear-gradient(to right, #00f0ff 0%, #a855f7 ${(progressTime / duration) * 100}%, rgba(255,255,255,0.1) ${(progressTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 rounded-2xl glass-panel border border-white/5">
        
        {/* Server Selectors */}
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">
            Seleccionar Servidor
          </label>
          <div className="flex flex-wrap gap-2">
            {servers.map((server, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentServerIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentServerIdx === idx
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/30'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                }`}
              >
                {server.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          {/* Mark as watched */}
          <button
            onClick={handleMarkAsWatched}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isWatched
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {isWatched ? (
              <>
                <Check className="w-4 h-4" />
                Visto
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Marcar Visto
              </>
            )}
          </button>

          {/* Cinema mode */}
          <button
            onClick={handleCinemaToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isCinemaMode
                ? 'bg-purple-500/25 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(189,0,255,0.3)]'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Maximize className="w-4 h-4" />
            {isCinemaMode ? 'Modo Normal' : 'Modo Cine'}
          </button>

          {/* Next Episode */}
          {hasNext && onNextEpisode && (
            <button
              onClick={onNextEpisode}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 flex items-center gap-1 shadow-md shadow-cyan-400/25 active:scale-95 transition-all cursor-pointer"
            >
              Siguiente Ep
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
