import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

const GENRE_GRADIENTS = [
  'from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border-cyan-500/25',
  'from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/25',
  'from-violet-500/10 to-indigo-500/10 hover:from-violet-500/20 hover:to-indigo-500/20 border-violet-500/25',
  'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-500/25',
  'from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border-amber-500/25'
];

export default function GenreCard({ genre, index }) {
  const navigate = useNavigate();
  const { name, slug } = genre;
  
  const gradient = GENRE_GRADIENTS[index % GENRE_GRADIENTS.length];

  const handleGenreClick = () => {
    // Navigate to Catalog with genre slug as query parameter
    navigate(`/catalog?genero=${slug}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGenreClick}
      className={`w-full p-4 rounded-xl border bg-gradient-to-br ${gradient} flex items-center gap-3 transition-all duration-300 text-left cursor-pointer group shadow-lg shadow-black/20`}
    >
      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-cyan-400 group-hover:text-purple-400 transition-colors">
        <Compass className="w-5 h-5 animate-pulse" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-gray-200 text-sm md:text-base group-hover:text-white transition-colors">
          {name}
        </h3>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
          Explorar
        </p>
      </div>
    </motion.button>
  );
}
