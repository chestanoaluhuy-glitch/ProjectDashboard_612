import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 1. Import QueryClient & QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. Inisialisasi client dengan konfigurasi caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data dianggap fresh 5 menit (pindah tab tidak re-fetch)
      gcTime: 1000 * 60 * 30,    // Simpan cache di memory selama 30 menit
      refetchOnWindowFocus: false, // Mencegah fetch ulang pas ganti window/tab browser
      retry: 1,                    // Coba 1 kali saja kalau API error
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Bungkus App dengan Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)