import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play, Heart, History, User, Compass, LogOut } from 'lucide-react';
import SearchBar from './SearchBar';
import { useStore } from '../store/useStore';
import { logoutUser } from '../services/firebase';

const NAV_ITEMS = [
  { label: 'Inicio', path: '/' },
  { label: 'Catálogo', path: '/catalog' },
  { label: 'Favoritos', path: '/favorites' }
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, favorites } = useStore();
  const location = useLocation();

  // Handle scroll trigger to toggle background density
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-[#05050a]/90 backdrop-blur-md py-3 border-white/10 shadow-lg shadow-black/40' 
          : 'bg-transparent py-5 border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img 
                src="/logo.jpg" 
                alt="AnimeVerso" 
                className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-md shadow-cyan-500/10 group-hover:scale-105 active:scale-95 transition-all" 
              />
              <span className="font-display font-bold text-xl md:text-2xl tracking-tight bg-gradient-to-r from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
                Anime<span className="text-cyan-400">Verso</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `text-sm font-semibold tracking-wide transition-colors ${
                    isActive 
                      ? 'text-cyan-400 text-neon-glow-blue' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Autocomplete Search Bar */}
            <div className="hidden md:flex flex-grow max-w-sm">
              <SearchBar />
            </div>

            {/* Right-side Profile Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full border border-white/20 group-hover:border-cyan-400 transition-colors bg-white/5"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-200 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {user.displayName.split(' ')[0]}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors border border-white/5 hover:border-red-500/20 cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="px-5 py-2 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 shadow-md shadow-black/40 cursor-pointer"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Mobile Hamburger / Search Icon */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white transition-all cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sliding Drawer content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-[#07070e] border-l border-white/10 z-50 p-6 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-8">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                    Navegación
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="w-full">
                  <SearchBar placeholder="Buscar en AnimeVerso..." />
                </div>

                {/* Nav Links */}
                <div className="flex flex-col gap-4">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                          : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Compass className="w-4.5 h-4.5" />
                      {item.label}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <User className="w-4.5 h-4.5" />
                    Mi Perfil
                  </NavLink>
                </div>
              </div>

              {/* Drawer footer (User Auth status) */}
              <div className="border-t border-white/5 pt-6">
                {user ? (
                  <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-9 h-9 rounded-full border border-white/10"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-200 line-clamp-1">
                          {user.displayName}
                        </div>
                        <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                          Sincronizado
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/profile"
                    className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-400/25 transition-all"
                  >
                    <User className="w-4 h-4" />
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
