import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Twitter, Youtube, Disc, Instagram, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030307] border-t border-white/5 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-black font-extrabold group-hover:scale-105 transition-all">
                <Play fill="currentColor" className="w-3.5 h-3.5 ml-0.5" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Anime<span className="text-cyan-400">Verso</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              AnimeVerso es tu portal premium de streaming de anime para Latinoamérica. Disfruta de tus series y películas favoritas, catálogo avanzado de géneros y emisión en tiempo real, todo con calidad premium.
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

          {/* Socials & Community */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Únete a la Comunidad
            </h4>
            <p className="text-xs text-gray-500">
              Mantente al día con los últimos estrenos, anuncios del sitio y sorteos a través de nuestras redes.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-400 hover:text-cyan-400 flex items-center justify-center transition-all hover:-translate-y-1"
                aria-label="Twitter"
              >
                <Twitter className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-all hover:-translate-y-1"
                aria-label="YouTube"
              >
                <Youtube className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center transition-all hover:-translate-y-1"
                aria-label="Discord"
              >
                <Disc className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500 hover:text-pink-500 flex items-center justify-center transition-all hover:-translate-y-1"
                aria-label="Instagram"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright & compliance banner */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} AnimeVerso. Todos los derechos reservados. Desarrollado con calidad premium.
          </p>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Sitio no comercial para demostración</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
