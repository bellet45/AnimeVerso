import { create } from 'zustand';
import { saveUserData, getUserData } from '../services/firebase';

const loadLocalState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(`animeverso_${key}`);
    if (saved === null || saved === undefined || saved === 'null' || saved === 'undefined') {
      return defaultValue;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (e) {
    console.error(`Error loading localStorage key: ${key}`, e);
    return defaultValue;
  }
};

const saveLocalState = (key, value) => {
  try {
    localStorage.setItem(`animeverso_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving localStorage key: ${key}`, e);
  }
};

export const useStore = create((set, get) => ({
  // State variables
  user: null,
  isAuthLoading: true,
  favorites: loadLocalState('favorites', []),
  history: loadLocalState('history', []),
  continueWatching: loadLocalState('continueWatching', []),

  // User Authentication Actions
  setUser: async (user) => {
    set({ user, isAuthLoading: false });
    if (user) {
      // Fetch data from Firestore and sync/merge
      const dbData = await getUserData(user.uid);
      if (dbData) {
        // Merge favorites
        const localFavs = Array.isArray(get().favorites) ? get().favorites : [];
        const mergedFavs = [...localFavs];
        const dbFavs = Array.isArray(dbData.favorites) ? dbData.favorites : [];
        dbFavs.forEach(f => {
          if (f && f.slug && !mergedFavs.some(x => x.slug === f.slug)) mergedFavs.push(f);
        });

        // Merge history
        const localHist = Array.isArray(get().history) ? get().history : [];
        const mergedHist = [...localHist];
        const dbHist = Array.isArray(dbData.history) ? dbData.history : [];
        dbHist.forEach(h => {
          if (h && h.slug && !mergedHist.some(x => x.slug === h.slug)) mergedHist.push(h);
        });

        // Merge continue watching
        const localCw = Array.isArray(get().continueWatching) ? get().continueWatching : [];
        const mergedCw = [...localCw];
        const dbCw = Array.isArray(dbData.continueWatching) ? dbData.continueWatching : [];
        dbCw.forEach(c => {
          if (!c || !c.slug || !c.episodeNumber) return;
          const idx = mergedCw.findIndex(x => x.slug === c.slug && x.episodeNumber === c.episodeNumber);
          if (idx === -1) {
            mergedCw.push(c);
          } else if (c.updatedAt > (mergedCw[idx].updatedAt || '')) {
            mergedCw[idx] = c;
          }
        });

        // Save merged results locally
        set({ favorites: mergedFavs, history: mergedHist, continueWatching: mergedCw });
        saveLocalState('favorites', mergedFavs);
        saveLocalState('history', mergedHist);
        saveLocalState('continueWatching', mergedCw);

        // Upload merged state back to Firestore
        await saveUserData(user.uid, {
          favorites: mergedFavs,
          history: mergedHist,
          continueWatching: mergedCw
        });
      } else {
        // First time user, sync local state to firestore
        await saveUserData(user.uid, {
          favorites: Array.isArray(get().favorites) ? get().favorites : [],
          history: Array.isArray(get().history) ? get().history : [],
          continueWatching: Array.isArray(get().continueWatching) ? get().continueWatching : []
        });
      }
    } else {
      // User signed out, keep local state as is
    }
  },
  
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  // Favorites Actions
  addFavorite: async (anime, listType = 'pendiente') => {
    const favorites = Array.isArray(get().favorites) ? get().favorites : [];
    const filteredFavorites = favorites.filter(x => x && x.slug !== anime.slug);
    const newFavorites = [{ ...anime, listType }, ...filteredFavorites];
    
    set({ favorites: newFavorites });
    saveLocalState('favorites', newFavorites);

    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: newFavorites,
        history: Array.isArray(get().history) ? get().history : [],
        continueWatching: Array.isArray(get().continueWatching) ? get().continueWatching : []
      });
    }
  },

  removeFavorite: async (slug) => {
    const favorites = Array.isArray(get().favorites) ? get().favorites : [];
    const newFavorites = favorites.filter(x => x && x.slug !== slug);
    set({ favorites: newFavorites });
    saveLocalState('favorites', newFavorites);

    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: newFavorites,
        history: Array.isArray(get().history) ? get().history : [],
        continueWatching: Array.isArray(get().continueWatching) ? get().continueWatching : []
      });
    }
  },

  // History Actions
  addToHistory: async (anime) => {
    const history = Array.isArray(get().history) ? get().history : [];
    const filteredHistory = history.filter(x => x && x.slug !== anime.slug);
    const newHistory = [{ ...anime, watchedAt: new Date().toISOString() }, ...filteredHistory];
    
    // Limit history list size to 50
    if (newHistory.length > 50) newHistory.pop();

    set({ history: newHistory });
    saveLocalState('history', newHistory);

    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: Array.isArray(get().favorites) ? get().favorites : [],
        history: newHistory,
        continueWatching: Array.isArray(get().continueWatching) ? get().continueWatching : []
      });
    }
  },

  clearHistory: async () => {
    set({ history: [] });
    saveLocalState('history', []);
    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: Array.isArray(get().favorites) ? get().favorites : [],
        history: [],
        continueWatching: Array.isArray(get().continueWatching) ? get().continueWatching : []
      });
    }
  },

  removeFromHistory: async (slug) => {
    const history = Array.isArray(get().history) ? get().history : [];
    const newHistory = history.filter(x => x && x.slug !== slug);
    set({ history: newHistory });
    saveLocalState('history', newHistory);
    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: Array.isArray(get().favorites) ? get().favorites : [],
        history: newHistory,
        continueWatching: Array.isArray(get().continueWatching) ? get().continueWatching : []
      });
    }
  },

  // Continue Watching Actions
  updateProgress: async (slug, episodeNumber, animeTitle, episodeTitle, image, progressTime, duration) => {
    const cw = Array.isArray(get().continueWatching) ? get().continueWatching : [];
    const filteredCw = cw.filter(x => x && !(x.slug === slug && x.episodeNumber === episodeNumber));
    
    const newProgress = {
      slug,
      episodeNumber,
      animeTitle,
      episodeTitle,
      image,
      progressTime,
      duration,
      percentage: duration > 0 ? (progressTime / duration) * 100 : 0,
      updatedAt: new Date().toISOString()
    };

    const newCw = [newProgress, ...filteredCw];
    // Limit list size to 30
    if (newCw.length > 30) newCw.pop();

    set({ continueWatching: newCw });
    saveLocalState('continueWatching', newCw);

    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: Array.isArray(get().favorites) ? get().favorites : [],
        history: Array.isArray(get().history) ? get().history : [],
        continueWatching: newCw
      });
    }
  },

  removeProgress: async (slug, episodeNumber) => {
    const cw = Array.isArray(get().continueWatching) ? get().continueWatching : [];
    const newCw = cw.filter(x => x && !(x.slug === slug && x.episodeNumber === episodeNumber));
    set({ continueWatching: newCw });
    saveLocalState('continueWatching', newCw);

    const { user } = get();
    if (user) {
      await saveUserData(user.uid, {
        favorites: Array.isArray(get().favorites) ? get().favorites : [],
        history: Array.isArray(get().history) ? get().history : [],
        continueWatching: newCw
      });
    }
  }
}));
