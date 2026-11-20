'use client';

import { useEffect, useState } from 'react';

export default function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Network status listener
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__pwaInstallPrompt = e;
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {isOffline && (
        <div className="pwa-offline-banner" role="alert">
          <span className="pwa-dot"></span>
          <span>Mode Offline: Beberapa fitur mungkin tidak dapat diakses tanpa koneksi internet.</span>
        </div>
      )}

      {deferredPrompt && !installed && (
        <div className="pwa-install-toast">
          <div className="pwa-toast-content">
            <img src="/icons/icon-192x192.png" alt="DPRD" className="pwa-toast-icon" />
            <div>
              <strong>Pasang Aplikasi DPRD</strong>
              <p>Akses cepat presensi dan jadwal rapat langsung dari layar utama</p>
            </div>
          </div>
          <div className="pwa-toast-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleInstallClick}>
              Install
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setDeferredPrompt(null)}
            >
              Nanti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
