import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, LogOut, RefreshCw, Flame, History, Play, BookmarkCheck, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { signInWithGoogle, logoutUser, isFirebaseEnabled } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, setUser, favorites, history, continueWatching, removeProgress } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const favsList = Array.isArray(favorites) ? favorites : [];
  const histList = Array.isArray(history) ? history : [];
  const cwList = Array.isArray(continueWatching) ? continueWatching : [];

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const fbUser = await signInWithGoogle();
      // useStore.setUser is called inside Auth listener or manually
      // We manually trigger it here to ensure immediate state updates
      await setUser(fbUser);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Error al conectar con Google. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      await setUser(null);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] pt-28 pb-20 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {!user ? (
          /* ================= GUEST / LOGIN VIEW ================= */
          <div className="max-w-md mx-auto glass-panel border border-white/5 p-8 rounded-2xl shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 mx-auto flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-400/25">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-white tracking-wide uppercase">
                Mi AnimeVerso
              </h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Inicia sesión con tu cuenta de Google para sincronizar tus favoritos e historial en la nube.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-left">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-gray-100 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <LogIn className="w-4.5 h-4.5" />
              {isLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}
            </button>

            {!isFirebaseEnabled && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] text-left leading-normal">
                <strong>Modo Local:</strong> La base de datos externa de Firebase no está configurada en esta versión local. Tus datos se guardarán automáticamente en tu navegador (LocalStorage).
              </div>
            )}

            <div className="border-t border-white/5 pt-6 grid grid-cols-3 gap-3 text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              <div>
                <span className="block text-lg text-cyan-400 mb-1">{favsList.length}</span>
                Favoritos
              </div>
              <div>
                <span className="block text-lg text-purple-400 mb-1">{cwList.length}</span>
                Viendo
              </div>
              <div>
                <span className="block text-lg text-white mb-1">{histList.length}</span>
                Historial
              </div>
            </div>

          </div>
        ) : (
          /* ================= LOGGED IN / DASHBOARD VIEW ================= */
          <div className="space-y-12">
            
            {/* User Profile Header Card */}
            <div className="glass-panel border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-400/20"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-wide uppercase">
                      {user.displayName}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  
                  {/* Sync Status Badge */}
                  <div className="flex items-center gap-1.5 mt-2 justify-center md:justify-start text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sincronizado con Firebase
                  </div>
                </div>
              </div>

              {/* Log out */}
              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>

            {/* Section: Continuar Viendo (Continue Watching Grid) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-3">
                <Flame className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide uppercase">
                  Continuar Viendo
                </h3>
              </div>

              {cwList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
                  {cwList.map((ep) => (
                    <div key={`${ep.slug}_${ep.episodeNumber}`} className="relative group rounded-xl overflow-hidden glass-card border border-white/5 flex flex-col justify-between h-full shadow-lg shadow-black/30">
                      
                      {/* Image Thumbnail Frame */}
                      <div className="aspect-video relative overflow-hidden bg-white/5">
                        <img
                          src={ep.image}
                          alt={ep.animeTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-[#080810]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            onClick={() => navigate(`/anime/${ep.slug}/${ep.episodeNumber}`)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 transform scale-75 group-hover:scale-100 transition-all cursor-pointer"
                          >
                            <Play fill="currentColor" className="w-4.5 h-4.5 ml-0.5" />
                          </button>
                        </div>

                        {/* Top indicators */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="text-[10px] font-bold bg-cyan-400 text-black px-2 py-0.5 rounded shadow">
                            Ep {ep.episodeNumber}
                          </span>
                        </div>

                        {/* Remove progress X button */}
                        <button
                          onClick={() => removeProgress(ep.slug, ep.episodeNumber)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 z-20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Eliminar del historial de reproducción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Glow Progress Bar along bottom of thumbnail */}
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_#00f0ff]"
                            style={{ width: `${ep.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-semibold text-sm text-gray-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                            {ep.animeTitle}
                          </h4>
                          <p className="text-xs text-gray-500 font-semibold mt-1">
                            {ep.episodeTitle}
                          </p>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-12 text-center shadow-lg">
                  <Play className="w-12 h-12 text-gray-500 mb-3 animate-pulse" />
                  <h3 className="font-display font-semibold text-gray-300">No tienes animes en curso</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
                    Comienza a ver capítulos desde el catálogo y tu progreso se guardará automáticamente aquí para continuar más tarde.
                  </p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="px-6 py-2.5 rounded-full bg-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase shadow-md shadow-cyan-400/20 active:scale-95 transition-all"
                  >
                    Ir al Catálogo
                  </button>
                </div>
              )}
            </section>

          </div>
        )}

      </div>
    </div>
  );
}
