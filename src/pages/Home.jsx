import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Tv, Sparkles, TrendingUp, Flame, CalendarClock, Compass, Dices } from 'lucide-react';

import { getHomeData, getFilteredCatalog } from '../services/api';
import { useStore } from '../store/useStore';
import HeroBanner from '../components/HeroBanner';
import AnimeCard from '../components/AnimeCard';
import EpisodeCard from '../components/EpisodeCard';
import SkeletonLoader from '../components/SkeletonLoader';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function Home() {
  const { openRandomModal } = useStore();

  // 1. Fetch Homepage Scraped Data (Hero slider, Top popular, Recent episodes)
  const { data: home, isLoading: isHomeLoading } = useQuery({
    queryKey: ['homeData'],
    queryFn: getHomeData
  });

  // 2. Fetch "En Emisión" animes via filter
  const { data: airing, isLoading: isAiringLoading } = useQuery({
    queryKey: ['airingAnimes'],
    queryFn: () => getFilteredCatalog({ estado: 'emision' })
  });

  // 3. Fetch "Temporada Actual" (Summer 2026)
  const { data: season, isLoading: isSeasonLoading } = useQuery({
    queryKey: ['seasonAnimes'],
    queryFn: () => getFilteredCatalog({ temporada: 'verano', fecha: '2026' })
  });

  // 4. Fetch "Próximos Estrenos" via filter
  const { data: upcoming, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['upcomingAnimes'],
    queryFn: () => getFilteredCatalog({ estado: 'estrenos' })
  });

  // 5. Fetch "Finalizados" via filter
  const { data: finished, isLoading: isFinishedLoading } = useQuery({
    queryKey: ['finishedAnimes'],
    queryFn: () => getFilteredCatalog({ estado: 'finalizados' })
  });

  const swiperBreakpoints = {
    320: { slidesPerView: 2, spaceBetween: 12 },
    640: { slidesPerView: 3, spaceBetween: 16 },
    1024: { slidesPerView: 5, spaceBetween: 20 },
    1280: { slidesPerView: 6, spaceBetween: 20 }
  };

  const swiperBreakpointsEpisodes = {
    320: { slidesPerView: 1.5, spaceBetween: 12 },
    640: { slidesPerView: 2.5, spaceBetween: 16 },
    1024: { slidesPerView: 3.5, spaceBetween: 20 },
    1280: { slidesPerView: 4, spaceBetween: 20 }
  };

  return (
    <div className="min-h-screen bg-[#05050a] pb-20">
      
      {/* 1. Hero Slide Banner */}
      {isHomeLoading ? (
        <SkeletonLoader type="hero" />
      ) : (
        <HeroBanner slides={home?.hero || []} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* Discovery Banner: Anime Aleatorio */}
        <div className="relative overflow-hidden rounded-2xl glass-panel border border-cyan-500/20 p-5 sm:p-6 bg-gradient-to-r from-purple-950/20 via-[#0b0b14] to-cyan-950/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-lg shadow-cyan-400/10">
              <Dices className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base sm:text-lg text-white">
                ¿No sabes qué ver hoy?
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Deja que la suerte elija tu próxima serie con nuestra ruleta de anime aleatorio.
              </p>
            </div>
          </div>
          <button
            onClick={openRandomModal}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Dices className="w-4 h-4" />
            <span>Tirar Ruleta</span>
          </button>
        </div>

        {/* 2. Section: Recién Actualizados (Episodes list) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-3">
            <Tv className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide uppercase">
              Recién Actualizados
            </h3>
          </div>
          
          {isHomeLoading ? (
            <SkeletonLoader type="episode" count={4} />
          ) : home?.recentEpisodes?.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              breakpoints={swiperBreakpointsEpisodes}
              className="px-1 py-3"
            >
              {home.recentEpisodes.map((ep, idx) => (
                <SwiperSlide key={idx}>
                  <EpisodeCard episode={ep} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No hay capítulos cargados recientemente.</p>
          )}
        </section>

        {/* 3. Section: En Emisión */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-emerald-400 pl-3">
            <Flame className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide uppercase">
              En Emisión
            </h3>
          </div>

          {isAiringLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : airing?.data?.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              breakpoints={swiperBreakpoints}
              className="px-1 py-3 animate-fadeIn"
            >
              {airing.data.map((anime) => (
                <SwiperSlide key={anime.slug}>
                  <AnimeCard anime={anime} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No se encontraron animes en emisión.</p>
          )}
        </section>

        {/* 4. Section: Temporada Actual (Summer 2026) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-purple-400 pl-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide uppercase">
              Temporada Actual (Verano 2026)
            </h3>
          </div>

          {isSeasonLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : season?.data?.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              breakpoints={swiperBreakpoints}
              className="px-1 py-3 animate-fadeIn"
            >
              {season.data.map((anime) => (
                <SwiperSlide key={anime.slug}>
                  <AnimeCard anime={anime} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No se encontraron animes de la temporada.</p>
          )}
        </section>

        {/* 5. Section: Más Populares */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-3">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide uppercase">
              Más Populares
            </h3>
          </div>

          {isHomeLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : home?.popular?.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              breakpoints={swiperBreakpoints}
              className="px-1 py-3 animate-fadeIn"
            >
              {home.popular.map((anime) => (
                <SwiperSlide key={anime.slug}>
                  <AnimeCard anime={{ ...anime, status: 'Top ' + anime.rank }} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No se encontraron los animes más populares.</p>
          )}
        </section>

        {/* Grid layout for remaining sections (Upcoming + Finished) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
          
          {/* 6. Section: Próximos Estrenos */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-amber-400 pl-3">
              <CalendarClock className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-extrabold text-lg md:text-xl text-white tracking-wide uppercase">
                Próximos Estrenos
              </h3>
            </div>

            {isUpcomingLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <SkeletonLoader type="card" count={2} />
              </div>
            ) : upcoming?.data?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {upcoming.data.slice(0, 4).map((anime) => (
                  <div key={anime.slug} className="aspect-[3/4.8]">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-8 text-center">No se encontraron estrenos futuros.</p>
            )}
          </section>

          {/* 7. Section: Finalizados */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-zinc-400 pl-3">
              <Compass className="w-5 h-5 text-zinc-400" />
              <h3 className="font-display font-extrabold text-lg md:text-xl text-white tracking-wide uppercase">
                Finalizados Recientes
              </h3>
            </div>

            {isFinishedLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <SkeletonLoader type="card" count={2} />
              </div>
            ) : finished?.data?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {finished.data.slice(0, 4).map((anime) => (
                  <div key={anime.slug} className="aspect-[3/4.8]">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-8 text-center">No se encontraron animes finalizados.</p>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}
