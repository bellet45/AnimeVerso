import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, History, Trash2, Heart, Compass, CheckCircle, Bookmark, Eye, Play } from 'lucide-react';
import { useStore } from '../store/useStore';
import AnimeCard from '../components/AnimeCard';

export default function Favorites() {
  const [activeTab, setActiveTab] = useState('watching'); // 'watching', 'pending', 'completed', 'history'
  const { favorites, history, clearHistory, removeFromHistory } = useStore();

  const handleRemoveFromHistory = (slug, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromHistory(slug);
  };

  const favsList = Array.isArray(favorites) ? favorites : [];
  const histList = Array.isArray(history) ? history : [];

  const watchingList = favsList.filter(x => x && x.listType === 'viendo');
  const pendingList = favsList.filter(x => x && (!x.listType || x.listType === 'pendiente'));
  const completedList = favsList.filter(x => x && x.listType === 'terminado');

  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todo tu historial de visualización?')) {
      clearHistory();
    }
  };

  const getActiveList = () => {
    switch (activeTab) {
      case 'watching':
        return watchingList;
      case 'pending':
        return pendingList;
      case 'completed':
        return completedList;
      default:
        return [];
    }
  };

  const activeList = getActiveList();

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'watching':
        return {
          icon: <Eye className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />,
          title: 'No tienes animes en curso',
          desc: 'Aquí aparecerán los animes que marques como "Viendo" para que continúes donde te quedaste.'
        };
      case 'pending':
        return {
          icon: <Bookmark className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />,
          title: 'Tu lista de pendientes está vacía',
          desc: 'Guarda los animes que planeas ver en el futuro para mantener tu lista organizada.'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />,
          title: 'Aún no has terminado ningún anime',
          desc: 'Una vez que concluyas una serie, puedes clasificarla aquí como "Terminado".'
        };
      default:
        return {
          icon: <Heart className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />,
          title: 'Tu lista está vacía',
          desc: 'Explora y guarda tus series favoritas.'
        };
    }
  };

  const emptyMsg = getEmptyMessage();

  return (
    <div className="min-h-screen bg-[#05050a] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Headers */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('watching')}
            className={`px-6 py-3 border-b-2 font-display font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'watching'
                ? 'border-cyan-400 text-cyan-400 text-neon-glow-blue'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 text-cyan-400" />
            Viendo
            <span className="text-xs bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold ml-1 text-cyan-400">
              {watchingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 border-b-2 font-display font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'border-amber-400 text-amber-400 text-neon-glow-amber'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            Pendientes
            <span className="text-xs bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold ml-1 text-amber-400">
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 border-b-2 font-display font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'border-emerald-400 text-emerald-400 text-neon-glow-emerald'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Terminados
            <span className="text-xs bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold ml-1 text-emerald-400">
              {completedList.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 border-b-2 font-display font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-purple-400 text-purple-400 text-neon-glow-purple'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            Historial
            <span className="text-xs bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold ml-1 text-purple-400">
              {histList.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab !== 'history' ? (
          <div>
            {activeList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-fadeIn">
                {activeList.map((anime) => (
                  <div key={anime.slug} className="aspect-[3/4.8]">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-12 text-center shadow-lg">
                {emptyMsg.icon}
                <h3 className="font-display font-semibold text-gray-300">{emptyMsg.title}</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
                  {emptyMsg.desc}
                </p>
                <Link
                  to="/catalog"
                  className="px-6 py-2.5 rounded-full bg-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase shadow-md shadow-cyan-400/20 active:scale-95 transition-all"
                >
                  Explorar Catálogo
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* History Header options */}
            {histList.length > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar Historial
                </button>
              </div>
            )}

            {histList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-fadeIn">
                {histList.map((anime) => (
                  <div key={anime.slug} className="aspect-[3/4.8] relative group/hist">
                    <AnimeCard anime={anime} />
                    
                    {/* Delete single item from history */}
                    <button
                      onClick={(e) => handleRemoveFromHistory(anime.slug, e)}
                      className="absolute top-2 right-11 p-1.5 rounded-lg border border-red-500/30 bg-black/60 hover:bg-red-500/20 text-red-400 backdrop-blur-md z-20 transition-all cursor-pointer shadow-md shadow-black/30 opacity-75 md:opacity-0 md:group-hover/hist:opacity-100"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {anime.watchedAt && (
                      <div className="absolute -bottom-3 left-2 right-2 bg-black/80 backdrop-blur-md rounded border border-white/5 px-2 py-0.5 text-[9px] text-gray-500 text-center truncate pointer-events-none z-10">
                        Visto: {new Date(anime.watchedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-12 text-center shadow-lg">
                <History className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />
                <h3 className="font-display font-semibold text-gray-300">No tienes historial de visualización</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
                  Aquí aparecerán todos los animes que visites o comiences a ver. Mantén un registro automático de tus aventuras.
                </p>
                <Link
                  to="/catalog"
                  className="px-6 py-2.5 rounded-full bg-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase shadow-md shadow-cyan-400/20 active:scale-95 transition-all"
                >
                  Ver Qué Hay de Nuevo
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
