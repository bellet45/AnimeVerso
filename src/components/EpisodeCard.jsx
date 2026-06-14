import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function EpisodeCard({ episode }) {
  const { title, slug, episodeNumber, image, coverImage, time } = episode;
  const { continueWatching } = useStore();

  const cwList = Array.isArray(continueWatching) ? continueWatching : [];
  // Find progress for this specific episode
  const progressInfo = cwList.find(
    (x) => x && x.slug === slug && parseInt(x.episodeNumber, 10) === parseInt(episodeNumber, 10)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
      className="group rounded-xl overflow-hidden glass-card border border-white/5 shadow-md flex flex-col h-full cursor-pointer"
    >
      <Link to={`/anime/${slug}/${episodeNumber}`} className="flex flex-col h-full">
        {/* Aspect Video Image Frame */}
        <div className="aspect-video relative overflow-hidden bg-white/5">
          <img
            src={image || coverImage}
            alt={`${title} - Episodio ${episodeNumber}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/90 via-[#080810]/10 to-transparent opacity-80" />

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 transform scale-75 group-hover:scale-100 transition-all duration-300">
              <Play fill="currentColor" className="ml-0.5 w-4 h-4" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
            <span className="text-[10px] font-bold bg-cyan-500/80 text-black px-2 py-0.5 rounded backdrop-blur-sm shadow-md">
              Ep {episodeNumber}
            </span>
            {time && (
              <span className="text-[10px] font-medium bg-black/60 text-gray-300 px-2 py-0.5 rounded backdrop-blur-sm">
                {time}
              </span>
            )}
          </div>

          {/* Watch Progress Bar */}
          {progressInfo && progressInfo.percentage > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${progressInfo.percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Info Block */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <h4 className="font-display font-medium text-xs text-gray-400 group-hover:text-cyan-400 transition-colors uppercase tracking-wider mb-1 truncate">
              {title}
            </h4>
            <p className="text-sm font-semibold text-gray-200 line-clamp-1 leading-tight">
              Episodio {episodeNumber}
            </p>
          </div>
          {progressInfo && (
            <p className="text-[10px] text-gray-500 mt-1">
              Viendo: {Math.floor(progressInfo.progressTime / 60)}m / {Math.floor(progressInfo.duration / 60)}m
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
