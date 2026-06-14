import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Filter, RotateCcw, Play, Compass, ChevronDown, Check } from 'lucide-react';
import { getFilteredCatalog, searchAnime } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import SkeletonLoader from '../components/SkeletonLoader';

const GENDERS = [
  { name: 'Acción', slug: 'accion' },
  { name: 'Aventura', slug: 'aventura' },
  { name: 'Fantasía', slug: 'fantasia' },
  { name: 'Isekai', slug: 'isekai' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Comedia', slug: 'comedia' },
  { name: 'Escolar', slug: 'colegial' },
  { name: 'Shonen', slug: 'shounen' },
  { name: 'Seinen', slug: 'seinen' },
  { name: 'Terror', slug: 'terror' },
  { name: 'Misterio', slug: 'misterio' },
  { name: 'Ciencia Ficción', slug: 'sci-fi' },
  { name: 'Deportes', slug: 'deportes' },
  { name: 'Música', slug: 'musica' }
];

const STATES = [
  { name: 'En Emisión', slug: 'emision' },
  { name: 'Finalizado', slug: 'finalizados' },
  { name: 'Próximos Estrenos', slug: 'estrenos' }
];

const TYPES = [
  { name: 'Series (TV)', slug: 'animes' },
  { name: 'Películas', slug: 'peliculas' },
  { name: 'Especiales', slug: 'especiales' },
  { name: 'OVAs', slug: 'ovas' },
  { name: 'ONAs', slug: 'onas' }
];

const SEASONS = [
  { name: 'Invierno', slug: 'invierno' },
  { name: 'Primavera', slug: 'primavera' },
  { name: 'Verano', slug: 'verano' },
  { name: 'Otoño', slug: 'otoño' }
];

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

const SORT_OPTIONS = [
  { name: 'Últimos Agregados', slug: '' },
  { name: 'Por Nombre', slug: 'nombre' },
  { name: 'Popularidad', slug: 'popularidad' }
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Read filters from URL parameters
  const urlGenre = searchParams.get('genero') || '';
  const urlSearch = searchParams.get('search') || '';

  // 2. Local filters state
  const [filters, setFilters] = useState({
    genero: urlGenre,
    estado: '',
    tipo: '',
    fecha: '',
    temporada: '',
    filtro: '' // sort option
  });

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedAnimes, setAccumulatedAnimes] = useState([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      genero: urlGenre
    }));
    setSearchTerm(urlSearch);
    setCurrentPage(1); // Reset page on query change
    setAccumulatedAnimes([]);
  }, [urlGenre, urlSearch]);

  // 3. React Query to fetch data
  // If we have a search term, we call `searchAnime`
  // Otherwise, we call `getFilteredCatalog`
  const queryKey = searchTerm 
    ? ['searchCatalog', searchTerm, currentPage]
    : ['filterCatalog', filters, currentPage];

  const queryFn = () => {
    if (searchTerm) {
      return searchAnime(searchTerm, currentPage);
    } else {
      return getFilteredCatalog(filters, currentPage);
    }
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData
  });

  // 4. Merge paginated results
  useEffect(() => {
    if (!data) return;

    if (searchTerm) {
      // For search results
      if (currentPage === 1) {
        setAccumulatedAnimes(data.animes || []);
      } else {
        setAccumulatedAnimes(prev => {
          const combined = [...prev];
          (data.animes || []).forEach(anime => {
            if (!combined.some(x => x.slug === anime.slug)) {
              combined.push(anime);
            }
          });
          return combined;
        });
      }
    } else {
      // For directory filters
      if (currentPage === 1) {
        setAccumulatedAnimes(data.data || []);
      } else {
        setAccumulatedAnimes(prev => {
          const combined = [...prev];
          (data.data || []).forEach(anime => {
            if (!combined.some(x => x.slug === anime.slug)) {
              combined.push(anime);
            }
          });
          return combined;
        });
      }
    }
  }, [data, currentPage, searchTerm]);

  // 5. Handlers
  const handleFilterChange = (key, value) => {
    // Clear search term when changing filters
    if (searchTerm) {
      setSearchTerm('');
      setSearchParams({});
    }
    
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    setCurrentPage(1);
    setAccumulatedAnimes([]);

    // Update URL if genre changes
    if (key === 'genero') {
      if (value) {
        setSearchParams({ genero: value });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      genero: '',
      estado: '',
      tipo: '',
      fecha: '',
      temporada: '',
      filtro: ''
    });
    setSearchTerm('');
    setSearchParams({});
    setCurrentPage(1);
    setAccumulatedAnimes([]);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Determine if there are more items to load
  const hasMore = searchTerm 
    ? data?.hasNextPage 
    : data && data.current_page < data.last_page;

  return (
    <div className="min-h-screen bg-[#05050a] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-wide uppercase">
              {searchTerm ? `Resultados de búsqueda` : `Catálogo de Anime`}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1.5">
              {searchTerm 
                ? `Mostrando resultados para "${searchTerm}"` 
                : `Explora todo nuestro catálogo utilizando los filtros combinados.`
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="lg:hidden w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-cyan-400" />
              Filtros Avanzados
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              Limpiar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Filter Panel (Desktop & Mobile drawer) */}
          <div className={`lg:col-span-3 lg:block space-y-6 ${
            isFilterPanelOpen ? 'block fixed inset-0 z-50 bg-[#05050a] p-6 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:p-0' : 'hidden'
          }`}>
            <div className="flex items-center justify-between lg:hidden mb-6 border-b border-white/5 pb-4">
              <span className="font-display font-extrabold text-white text-lg uppercase">Filtros</span>
              <button 
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1 rounded-lg bg-white/5 text-gray-400"
              >
                Cerrar
              </button>
            </div>

            <div className="glass-panel border border-white/5 p-5 rounded-2xl space-y-6 shadow-xl">
              
              {/* Genre Filter */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Género
                </span>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-[220px] lg:max-h-[300px] overflow-y-auto pr-1">
                  {GENDERS.map(g => (
                    <button
                      key={g.slug}
                      onClick={() => handleFilterChange('genero', filters.genero === g.slug ? '' : g.slug)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between border cursor-pointer transition-all ${
                        filters.genero === g.slug
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {g.name}
                      {filters.genero === g.slug && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Estado
                </span>
                <div className="space-y-1.5">
                  {STATES.map(s => (
                    <button
                      key={s.slug}
                      onClick={() => handleFilterChange('estado', filters.estado === s.slug ? '' : s.slug)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between border cursor-pointer transition-all ${
                        filters.estado === s.slug
                          ? 'bg-purple-500/15 border-purple-400 text-purple-300'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {s.name}
                      {filters.estado === s.slug && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Formato (Tipo)
                </span>
                <div className="space-y-1.5">
                  {TYPES.map(t => (
                    <button
                      key={t.slug}
                      onClick={() => handleFilterChange('tipo', filters.tipo === t.slug ? '' : t.slug)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between border cursor-pointer transition-all ${
                        filters.tipo === t.slug
                          ? 'bg-violet-500/15 border-violet-400 text-violet-300'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t.name}
                      {filters.tipo === t.slug && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season Filter */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Temporada
                </span>
                <select
                  value={filters.temporada}
                  onChange={(e) => handleFilterChange('temporada', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
                >
                  <option className="bg-[#0c0c14]" value="">Todas las temporadas</option>
                  {SEASONS.map(s => (
                    <option className="bg-[#0c0c14]" key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Año
                </span>
                <select
                  value={filters.fecha}
                  onChange={(e) => handleFilterChange('fecha', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
                >
                  <option className="bg-[#0c0c14]" value="">Todos los años</option>
                  {YEARS.map(year => (
                    <option className="bg-[#0c0c14]" key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Ordenar por
                </span>
                <select
                  value={filters.filtro}
                  onChange={(e) => handleFilterChange('filtro', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option className="bg-[#0c0c14]" key={opt.slug} value={opt.slug}>{opt.name}</option>
                  ))}
                </select>
              </div>

              {/* Mobile apply button */}
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="lg:hidden w-full py-3 rounded-xl bg-cyan-400 text-black text-center font-bold text-xs shadow-lg shadow-cyan-400/25 cursor-pointer"
              >
                Aplicar Filtros
              </button>

            </div>
          </div>

          {/* Right Column: Cards Grid */}
          <div className="lg:col-span-9 space-y-10">
            {isLoading && accumulatedAnimes.length === 0 ? (
              <SkeletonLoader count={6} />
            ) : accumulatedAnimes.length > 0 ? (
              <div className="space-y-12">
                
                {/* Anime Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-fadeIn">
                  {accumulatedAnimes.map((anime) => (
                    <div key={anime.slug} className="aspect-[3/4.8]">
                      <AnimeCard anime={anime} />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isFetching}
                      className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/40 text-cyan-400 text-xs font-extrabold tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isFetching ? 'Cargando más...' : 'Cargar más animes'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-12 text-center">
                <Compass className="w-12 h-12 text-gray-500 mb-3 animate-spin" />
                <h3 className="font-display font-semibold text-gray-300">No se encontraron resultados</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1">
                  Intenta cambiar los filtros seleccionados o buscar con otro término de búsqueda.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
