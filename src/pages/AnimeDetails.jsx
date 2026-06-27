import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Star, Sparkles, FolderOpen, Calendar, Film, Bookmark, Info, Tv, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { getAnimeDetails, getAnimeEpisodes } from '../services/api';
import { useStore } from '../store/useStore';
import SkeletonLoader from '../components/SkeletonLoader';

export default function AnimeDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, continueWatching, addToHistory } = useStore();
  
  // Local pagination state for episodes
  const [episodePage, setEpisodePage] = useState(1);
  const [showFavDropdown, setShowFavDropdown] = useState(false);

  // 1. Fetch Anime Scraped Details (cover, title, synopsis, specs, related, animeId, csrfToken)
  const { data: anime, isLoading: isDetailsLoading, error } = useQuery({
    queryKey: ['animeDetails', slug],
    queryFn: () => getAnimeDetails(slug),
  });

  // 2. Fetch Episodes list dynamically using Anime ID and CSRF Token
  const { data: episodesData, isLoading: isEpisodesLoading } = useQuery({
    queryKey: ['animeEpisodes', anime?.animeId, episodePage],
    queryFn: () => getAnimeEpisodes(anime.animeId, episodePage, anime.csrfToken),
    enabled: !!anime?.animeId && !!anime?.csrfToken, // Wait until ID and CSRF are ready
  });

  // Reset episode page when slug changes
  useEffect(() => {
    setEpisodePage(1);
    
    // Add to watch history when visiting details page
    if (anime) {
      addToHistory({
        slug: anime.slug,
        title: anime.title,
        image: anime.coverImage,
        type: anime.type,
        status: anime.status
      });
    }
  }, [slug, anime]);

  if (isDetailsLoading) return <SkeletonLoader type="details" />;

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-6 text-center">
        <Info className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
        <h3 className="font-display font-semibold text-gray-200 text-lg">Error al cargar la información</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">El anime que buscas no está disponible o el scraper falló al extraer los datos.</p>
        <Link to="/catalog" className="mt-4 px-6 py-2 bg-cyan-400 text-black font-bold text-xs rounded-full">
          Volver al Catálogo
        </Link>
      </div>
    );
  }


  const favsList = Array.isArray(favorites) ? favorites : [];
  const isFavorite = favsList.some(x => x && x.slug === slug);
  const currentFavorite = favsList.find(x => x && x.slug === slug);
  const currentListType = currentFavorite ? (currentFavorite.listType || 'pendiente') : null;
  const isMovie = anime?.type?.toLowerCase() === 'pelicula' || anime?.type?.toLowerCase() === 'película' || anime?.type?.toLowerCase() === 'movie';

  // Check if there is watch progress for this anime in Zustand store
  const cwList = Array.isArray(continueWatching) ? continueWatching : [];
  const activeCwList = cwList.filter(x => x && x.slug === slug);
  // Get latest updated progress checkpoint
  const latestProgress = activeCwList.length > 0
    ? activeCwList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    : null;

  // Calculate episode page buttons
  const itemsPerPage = 16;
  const totalEpisodes = episodesData?.total || anime.episodesCount || 0;
  const totalPages = Math.ceil(totalEpisodes / itemsPerPage);

  const handlePageChange = (page) => {
    setEpisodePage(page);
  };

  return (
    <div className="min-h-screen bg-[#05050a] pb-20">
      
      {/* 1. Backdrop banner background */}
      <div className="w-full h-[35vh] md:h-[45vh] relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.bannerImage})` }}
        >
          {/* Black overlay vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/65 to-transparent" />
        </div>
      </div>

      {/* 2. Main content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Cover image poster */}
          <div className="lg:col-span-4 max-w-sm mx-auto lg:max-w-none w-full">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-400/5 aspect-[3/4] bg-white/5 relative group">
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/90 via-transparent to-transparent opacity-60" />
            </div>
          </div>

          {/* Details & Info Block */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title Block */}
            <div className="space-y-2">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-none">
                {anime.title}
              </h1>
              {anime.altTitle && anime.altTitle !== anime.title && (
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                  {anime.altTitle}
                </p>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-4 pt-2">
              {latestProgress ? (
                <button
                  onClick={() => navigate(`/anime/${slug}/${isMovie ? 'pelicula' : latestProgress.episodeNumber}`)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-cyan-400/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Play fill="currentColor" className="w-4.5 h-4.5" />
                  {isMovie ? 'Continuar Película' : `Continuar Ep ${latestProgress.episodeNumber}`}
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/anime/${slug}/${isMovie ? 'pelicula' : '1'}`)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-cyan-400/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Play fill="currentColor" className="w-4.5 h-4.5" />
                  {isMovie ? 'Ver Película' : 'Ver Primer Capítulo'}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowFavDropdown(!showFavDropdown)}
                  className={`px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    isFavorite
                      ? currentListType === 'viendo'
                        ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                        : currentListType === 'terminado'
                        ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400 hover:bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                        : 'bg-amber-400/10 border-amber-400 text-amber-400 hover:bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite
                    ? currentListType === 'viendo'
                      ? 'Viendo'
                      : currentListType === 'terminado'
                      ? 'Terminado'
                      : 'Pendiente'
                    : 'Favorito'}
                </button>

                {showFavDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowFavDropdown(false)} 
                    />
                    <div className="absolute left-0 mt-2 w-44 bg-black/95 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-md z-40 flex flex-col gap-1 text-[11px] font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => {
                          addFavorite({
                            slug,
                            title: anime.title,
                            image: anime.coverImage,
                            type: anime.type,
                            status: anime.status
                          }, 'viendo');
                          setShowFavDropdown(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2 transition-all cursor-pointer ${
                          currentListType === 'viendo'
                            ? 'bg-cyan-500/20 text-cyan-400 font-bold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        Viendo
                      </button>
                      <button
                        onClick={() => {
                          addFavorite({
                            slug,
                            title: anime.title,
                            image: anime.coverImage,
                            type: anime.type,
                            status: anime.status
                          }, 'pendiente');
                          setShowFavDropdown(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2 transition-all cursor-pointer ${
                          currentListType === 'pendiente'
                            ? 'bg-amber-500/20 text-amber-400 font-bold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 text-amber-400" />
                        Pendiente
                      </button>
                      <button
                        onClick={() => {
                          addFavorite({
                            slug,
                            title: anime.title,
                            image: anime.coverImage,
                            type: anime.type,
                            status: anime.status
                          }, 'terminado');
                          setShowFavDropdown(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2 transition-all cursor-pointer ${
                          currentListType === 'terminado'
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Terminado
                      </button>
                      {isFavorite && (
                        <button
                          onClick={() => {
                            removeFavorite(slug);
                            setShowFavDropdown(false);
                          }}
                          className="w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-all border-t border-white/5 mt-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Quitar de Favoritos
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis Panel */}
            <div className="glass-panel border border-white/5 p-5 rounded-2xl space-y-3 shadow-lg">
              <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                Sinopsis
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {anime.synopsis}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel border border-white/5 p-4 rounded-xl flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">Géneros</span>
                  <p className="text-xs text-gray-300 font-semibold">{anime.genres?.join(', ') || 'N/A'}</p>
                </div>
              </div>
              <div className="glass-panel border border-white/5 p-4 rounded-xl flex items-center gap-3">
                <Film className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">Formato & Estado</span>
                  <p className="text-xs text-gray-300 font-semibold">{anime.type} — {anime.status}</p>
                </div>
              </div>
              <div className="glass-panel border border-white/5 p-4 rounded-xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">Estudio</span>
                  <p className="text-xs text-gray-300 font-semibold">{anime.studios?.join(', ') || 'N/A'}</p>
                </div>
              </div>
              <div className="glass-panel border border-white/5 p-4 rounded-xl flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">Temporada</span>
                  <p className="text-xs text-gray-300 font-semibold">{anime.season || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Related Sequels / Prequels */}
            {anime.related?.length > 0 && (
              <div className="glass-panel border border-white/5 p-5 rounded-2xl space-y-3 shadow-lg">
                <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                  Relacionados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {anime.related.map((rel, idx) => (
                    <Link
                      key={idx}
                      to={`/anime/${rel.slug}`}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-400/40 hover:bg-white/10 flex items-center justify-between transition-all group"
                    >
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-white truncate pr-2">
                        {rel.title}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/10">
                        {rel.relationship}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. Episodes Section */}
        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide uppercase flex items-center gap-2">
              <Tv className="w-5 h-5 text-cyan-400" />
              Episodios Disponibles
            </h3>
            
            {/* Pagination Tabs */}
            {totalPages > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const startRange = i * itemsPerPage + 1;
                  const endRange = Math.min((i + 1) * itemsPerPage, totalEpisodes);
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        episodePage === pageNum
                          ? 'bg-cyan-400 text-black font-extrabold shadow-md shadow-cyan-400/25'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {startRange}-{endRange}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Episode Grid Loader */}
          {isEpisodesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (episodesData?.data?.length > 0 || isMovie) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {isMovie ? (
                (() => {
                  const progress = cwList.find(
                    x => x && x.slug === slug && (String(x.episodeNumber) === 'pelicula' || String(x.episodeNumber) === '1')
                  );
                  const isEpWatched = progress && progress.percentage > 85;
                  return (
                    <button
                      key="pelicula"
                      onClick={() => navigate(`/anime/${slug}/pelicula`)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-semibold text-center transition-all cursor-pointer relative overflow-hidden group ${
                        isEpWatched
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-white/5 border-white/5 text-gray-300 hover:border-cyan-400/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-widest text-gray-500 font-bold group-hover:text-gray-400">
                        Reproducir
                      </span>
                      <span className="text-base font-extrabold tracking-wide">
                        Película
                      </span>
                      {progress && !isEpWatched && (
                        <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]" />
                      )}
                      {isEpWatched && (
                        <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      )}
                    </button>
                  );
                })()
              ) : (
                episodesData.data.map((ep) => {
                  const progress = cwList.find(
                    x => x && x.slug === slug && String(x.episodeNumber) === String(ep.number)
                  );
                  const isEpWatched = progress && progress.percentage > 85;

                  return (
                    <button
                      key={ep.number}
                      onClick={() => navigate(`/anime/${slug}/${ep.number}`)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-semibold text-center transition-all cursor-pointer relative overflow-hidden group ${
                        isEpWatched
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-white/5 border-white/5 text-gray-300 hover:border-cyan-400/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-widest text-gray-500 font-bold group-hover:text-gray-400">
                        Capítulo
                      </span>
                      <span className="text-base font-extrabold tracking-wide">
                        {ep.number}
                      </span>
                      
                      {/* Tiny neon dot showing watch progress */}
                      {progress && !isEpWatched && (
                        <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]" />
                      )}
                      {isEpWatched && (
                        <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="aspect-[4/1] w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
              <Tv className="w-8 h-8 text-gray-500 mb-2" />
              <h4 className="font-display font-semibold text-gray-300">Episodios no encontrados</h4>
              <p className="text-xs text-gray-500 mt-0.5">El scraper falló al realizar la paginación de los capítulos o el servidor no respondió.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
