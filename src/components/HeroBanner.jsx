import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Play, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroBanner({ slides = [] }) {
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite } = useStore();

  const handleFavoriteToggle = (slide) => {
    const isFavorite = favorites.some(x => x.slug === slide.slug);
    if (isFavorite) {
      removeFavorite(slide.slug);
    } else {
      addFavorite({
        slug: slide.slug,
        title: slide.title,
        image: slide.image,
        type: slide.type,
        status: slide.status
      });
    }
  };

  if (slides.length === 0) return null;

  return (
    <div className="w-full relative bg-[#05050a] min-h-[65vh] md:min-h-[75vh] lg:h-[85vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full h-full min-h-[65vh] md:min-h-[75vh] lg:h-[85vh]"
      >
        {slides.map((slide) => {
          const isFav = favorites.some(x => x.slug === slide.slug);
          
          return (
            <SwiperSlide key={slide.slug} className="relative w-full h-full">
              
              {/* Background Backdrop Image */}
              <div className="absolute inset-0 w-full h-full bg-cover bg-center banner-mask"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Horizontal and Vertical Vignette overlays to match deep dark background */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/40 to-[#05050a]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#05050a] via-[#05050a]/60 to-transparent" />
              </div>

              {/* Slider Content Container */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[65vh] md:min-h-[75vh] lg:h-[85vh] flex items-center pt-24 pb-16">
                <div className="max-w-3xl space-y-6">
                  
                  {/* Badge Row */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs font-bold tracking-widest uppercase bg-cyan-400 text-black px-2.5 py-0.5 rounded shadow-lg shadow-cyan-400/20">
                      Destacado del día
                    </span>
                    <span className="text-xs font-bold tracking-widest uppercase bg-purple-950/70 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded backdrop-blur-md">
                      {slide.type}
                    </span>
                    <span className="text-xs font-bold tracking-widest uppercase bg-black/50 text-gray-300 border border-white/5 px-2.5 py-0.5 rounded backdrop-blur-md">
                      {slide.status}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight"
                  >
                    {slide.title}
                  </motion.h2>

                  {/* Synopsis Paragraph */}
                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl"
                  >
                    {slide.synopsis}
                  </motion.p>

                  {/* Button Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap gap-4 pt-4"
                  >
                    <button
                      onClick={() => navigate(`/anime/${slide.slug}`)}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play fill="currentColor" className="w-4.5 h-4.5" />
                      Ver Ahora
                    </button>
                    
                    <button
                      onClick={() => handleFavoriteToggle(slide)}
                      className={`px-6 py-3 rounded-full text-sm font-bold border flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                        isFav
                          ? 'bg-amber-400/10 border-amber-400 text-amber-400 hover:bg-amber-400/20'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <Star className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                      {isFav ? 'En Favoritos' : 'Añadir Favoritos'}
                    </button>
                  </motion.div>

                </div>
              </div>

            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
