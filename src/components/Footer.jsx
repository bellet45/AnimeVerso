import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Twitter, Youtube, Disc, Instagram, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030307] border-t border-white/5 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.jpg" 
                alt="AnimeVerso" 
                className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-all" 
              />
              <span className="font-display font-bold text-lg text-white">
                Anime<span className="text-cyan-400">Verso</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              AnimeVerso para disfrutar de tus series y películas favoritas de anime en español.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-cyan-400 transition-colors">Catálogo</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-cyan-400 transition-colors">Favoritos</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-cyan-400 transition-colors">Mi Cuenta</Link>
              </li>
            </ul>
          </div>

          {/* Categories / Genres */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Géneros Populares
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog?genero=accion" className="hover:text-cyan-400 transition-colors">Acción</Link>
              </li>
              <li>
                <Link to="/catalog?genero=aventura" className="hover:text-cyan-400 transition-colors">Aventura</Link>
              </li>
              <li>
                <Link to="/catalog?genero=fantasia" className="hover:text-cyan-400 transition-colors">Fantasía</Link>
              </li>
              <li>
                <Link to="/catalog?genero=isekai" className="hover:text-cyan-400 transition-colors">Isekai</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/5 pt-8 text-center md:text-left">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} AnimeVerso. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
