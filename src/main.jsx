import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

// 1. Monkey-patch window.fetch to redirect cross-origin scraping to local proxy (bypassing CORS)
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let url = typeof input === 'string' ? input : input.url;
  
  if (url.startsWith('https://jkanime.net/')) {
    url = url.replace('https://jkanime.net/', '/api-jkanime/');
  } else if (url.startsWith('https://jkanime.net')) {
    url = url.replace('https://jkanime.net', '/api-jkanime');
  }

  // Handle Request object vs String URL input
  if (typeof input === 'string') {
    return originalFetch(url, init);
  } else {
    try {
      const newRequest = new Request(url, input);
      return originalFetch(newRequest, init);
    } catch (e) {
      // Fallback in case of cloning restrictions
      return originalFetch(url, init);
    }
  }
};

// 2. Initialize TanStack Query Client for request caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
