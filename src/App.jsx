import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseEnabled } from './services/firebase';
import { useStore } from './store/useStore';

// Common Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react'; // tree shaken loader icon

// Lazy load pages for performance (code splitting)
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const AnimeDetails = lazy(() => import('./pages/AnimeDetails'));
const EpisodePlayer = lazy(() => import('./pages/EpisodePlayer'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));

// Full screen page loading transition fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-6 text-center text-white pt-28">
          <h2 className="text-xl font-bold text-red-500 mb-2">Algo salió mal en el componente</h2>
          <pre className="text-xs bg-black/50 p-4 rounded border border-white/10 max-w-lg overflow-auto text-left text-red-400 whitespace-pre-wrap">
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-cyan-400 text-black font-bold text-xs rounded-full"
          >
            Recargar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { setUser, setAuthLoading } = useStore();

  // Listen to Firebase Auth status changes
  useEffect(() => {
    if (!isFirebaseEnabled || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Logged in user: Zustand store handles merging and syncing
        await setUser(firebaseUser);
      } else {
        // Logged out
        await setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  return (
    <Router>
      <div className="min-h-screen bg-[#05050a] flex flex-col justify-between">
        
        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Main Routes Wrapper */}
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/anime/:slug" element={<AnimeDetails />} />
                <Route path="/anime/:slug/:episodeNumber" element={<EpisodePlayer />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </main>

        {/* Brand Footer */}
        <Footer />
        
      </div>
    </Router>
  );
}
