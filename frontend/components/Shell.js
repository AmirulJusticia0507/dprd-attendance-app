'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, clearSession, getSession } from '../lib/api';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/absensi', label: 'Absensi' },
  { href: '/rapat', label: 'Rapat' },
  { href: '/rekap', label: 'Rekap' },
  { href: '/anggota', label: 'Anggota' },
];

export default function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState('');
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const current = getSession();
    setSession(current);
    setReady(true);
    if (pathname === '/' && current) router.replace('/dashboard');
    if (pathname !== '/' && !current) router.replace('/');
  }, [pathname, router]);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('id-ID')), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkInstallable = () => {
      if (typeof window !== 'undefined' && window.__pwaInstallPrompt) {
        setCanInstall(true);
      }
    };
    checkInstallable();
    const interval = setInterval(checkInstallable, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    if (typeof window !== 'undefined' && window.__pwaInstallPrompt) {
      window.__pwaInstallPrompt.prompt();
      const { outcome } = await window.__pwaInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        window.__pwaInstallPrompt = null;
        setCanInstall(false);
      }
    }
  };

  const logout = async () => {
    if (session?.refreshToken) {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken, all: true }),
      }).catch(() => null);
    }
    clearSession();
    router.replace('/');
  };

  if (pathname === '/') return <main className="auth-page">{children}</main>;
  if (!ready || !session) return <div className="loading">Memuat sesi...</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">DPRD</span>
          <span>Absensi</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${pathname.startsWith(link.href) ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          {canInstall && (
            <button type="button" className="btn btn-pwa-install" onClick={handleInstall}>
              📲 Install App (PWA)
            </button>
          )}
          <button type="button" className="btn btn-danger sidebar-logout" onClick={logout}>
            Keluar
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span className="clock">{clock}</span>
          <span className="user-chip">{session.user?.nama || 'Pengguna'}</span>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
