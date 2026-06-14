import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Home, Info, Loader2 } from 'lucide-react';
import { getEpisodeServers, getAnimeDetails } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';

export default function EpisodePlayer() {
  const { slug, episodeNumber } = useParams();
  const navigate = useNavigate();
  const epNum = parseInt(episodeNumber, 10);

  // 1. Fetch Anime Scraped Details (to get titles, covers, and total episodes count)
  const { data: anime, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['animeDetails', slug],
    queryFn: () => getAnimeDetails(slug)
  });

  // 2. Fetch Play Servers dynamically (e.g. Mega, Streamwish, VOE)
  const { data: servers = [], isLoading: isServersLoading, error } = useQuery({
    queryKey: ['episodeServers', slug, epNum],
    queryFn: () => getEpisodeServers(slug, epNum),
    // Re-fetch if slug or episode changes
  });

  // Scroll to top on mount / change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, episodeNumber]);

  if (isDetailsLoading || isServersLoading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
        <h3 className="font-display font-semibold text-gray-300">Cargando reproductor...</h3>
        <p className="text-xs text-gray-500 mt-1">Conectando con servidores de streaming externos.</p>
      </div>
    );
  }

  if (error || servers.length === 0) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-6 text-center">
        <Info className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
        <h3 className="font-display font-semibold text-gray-200 text-lg">Error al cargar el reproductor</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">
          No se pudieron obtener los servidores de reproducción para el capítulo {episodeNumber} de "{anime?.title || slug}".
        </p>
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-full border border-white/10 cursor-pointer"
          >
            Regresar
          </button>
          <Link to={`/anime/${slug}`} className="px-6 py-2 bg-cyan-400 text-black font-bold text-xs rounded-full">
            Ver Ficha Técnica
          </Link>
        </div>
      </div>
    );
  }

  // Calculate hasNext/hasPrev
  const hasPrev = epNum > 1;
  
  // A next episode is available if we have total episodes metadata AND current ep is less than total,
  // OR since scraping might return 0 for ongoing (like One Piece), we can assume ongoing series
  // have a next episode if it was aired (JkAnime recent list is a good indicator, or we can allow next click)
  const isOngoing = anime?.status?.toLowerCase().includes('emision') || anime?.status?.toLowerCase() === 'ongoing';
  const hasNext = (anime?.episodesCount > 0 && epNum < anime.episodesCount) || isOngoing;

  const handleNext = () => {
    navigate(`/anime/${slug}/${epNum + 1}`);
  };

  const handlePrev = () => {
    navigate(`/anime/${slug}/${epNum - 1}`);
  };

  return (
    <div className="min-h-screen bg-[#05050a] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-white/5">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 font-semibold truncate">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Inicio
            </Link>
            <span>/</span>
            <Link to={`/anime/${slug}`} className="hover:text-cyan-400 text-gray-300 truncate">
              {anime?.title || slug}
            </Link>
            <span>/</span>
            <span className="text-cyan-400">Capítulo {episodeNumber}</span>
          </div>

          {/* Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Capítulo Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Siguiente Capítulo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <VideoPlayer
          servers={servers}
          animeTitle={anime?.title || slug}
          episodeNumber={epNum}
          slug={slug}
          coverImage={anime?.coverImage || ''}
          hasNext={hasNext}
          onNextEpisode={handleNext}
        />

        {/* Episode Info details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Details column */}
          <div className="lg:col-span-8 glass-panel border border-white/5 p-6 rounded-2xl space-y-4 shadow-xl">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Estás viendo
              </span>
              <h2 className="font-display font-extrabold text-xl md:text-2xl text-white mt-0.5">
                {anime?.title} — Capítulo {episodeNumber}
              </h2>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              {anime?.synopsis}
            </p>
          </div>

          {/* Quick specs sidebar */}
          <div className="lg:col-span-4 glass-panel border border-white/5 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Ficha Técnica
            </h3>
            
            <div className="divide-y divide-white/5 text-xs">
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Formato</span>
                <span className="text-gray-300 font-semibold">{anime?.type}</span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Estudio</span>
                <span className="text-gray-300 font-semibold truncate max-w-[180px]">{anime?.studios?.join(', ') || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Estado</span>
                <span className={`font-semibold uppercase ${anime?.status?.includes('emision') ? 'text-emerald-400' : 'text-gray-300'}`}>
                  {anime?.status}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Géneros</span>
                <span className="text-gray-300 font-semibold truncate max-w-[180px]" title={anime?.genres?.join(', ')}>
                  {anime?.genres?.join(', ')}
                </span>
              </div>
            </div>

            <Link
              to={`/anime/${slug}`}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-center font-bold text-[10px] tracking-wider uppercase rounded-xl border border-white/5 hover:border-cyan-400/40 text-cyan-400 block transition-all"
            >
              Ver ficha completa
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
