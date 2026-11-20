'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PasswordInput from '../../components/PasswordInput';
import { API_URL, apiFetch, clearSession, getSession, setSession } from '../../lib/api';

const QR_PREFIX = 'DPRD-ABSEN:';
const RAPAT_PREFIX = 'DPRD-RAPAT:';

export default function ScanPage() {
  const [session, setCurrentSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const runIdRef = useRef(0);
  const busyRef = useRef(false);

  const stopScanner = useCallback(() => {
    runIdRef.current += 1;
    const scanner = scannerRef.current;
    if (scanner) {
      scanner.stop().catch(() => {});
      scannerRef.current = null;
    }
  }, []);

  const handleScan = useCallback(async (decodedText) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setResult(null);
    setStatus('Memproses QR...');

    try {
      const current = scannerRef.current;
      if (current) await current.stop().catch(() => {});
      scannerRef.current = null;

      const raw = decodedText.trim();
      const isRapat = raw.startsWith(RAPAT_PREFIX);
      const isPersonal = raw.startsWith(QR_PREFIX);
      const token = isRapat
        ? raw.slice(RAPAT_PREFIX.length)
        : isPersonal
          ? raw.slice(QR_PREFIX.length)
          : raw;

      const response = isRapat
        ? await apiFetch('/api/absensi/check-in-rapat', {
            method: 'POST',
            body: JSON.stringify({ token }),
          })
        : await fetch(`${API_URL}/api/absensi/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || body.message || 'Absensi gagal');
      setResult({ ok: true, data: body.data, message: body.message });
      setStatus('');
    } catch (err) {
      setResult({ ok: false, message: err.message });
      setStatus('');
    } finally {
      busyRef.current = false;
    }
  }, []);

  const startScanner = useCallback(async () => {
    const runId = ++runIdRef.current;
    setCameraError('');
    setResult(null);
    setStatus('Menyiapkan kamera...');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader', { verbose: false });
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (text) => handleScan(text),
        () => {}
      );
      if (runId !== runIdRef.current) {
        await scanner.stop().catch(() => {});
        return;
      }
      scannerRef.current = scanner;
      setStatus('Arahkan kamera ke QR Code rapat');
    } catch (err) {
      if (runId !== runIdRef.current) return;
      setCameraError(
        'Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan halaman dibuka melalui HTTPS.'
      );
      setStatus('');
    }
  }, [handleScan]);

  useEffect(() => {
    setCurrentSession(getSession());
    setReady(true);
    return () => stopScanner();
  }, [stopScanner]);

  useEffect(() => {
    if (!ready || session?.user?.role !== 'anggota') {
      stopScanner();
      return;
    }
    startScanner();
    return () => stopScanner();
  }, [ready, session, startScanner, stopScanner]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Login gagal');
      if (body.user?.role !== 'anggota') {
        clearSession();
        throw new Error('Gunakan akun anggota dewan untuk presensi');
      }
      const next = {
        token: body.token,
        refreshToken: body.refreshToken,
        user: body.user,
      };
      setSession(next);
      setCurrentSession(next);
      setPassword('');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    stopScanner();
    clearSession();
    setCurrentSession(null);
    setResult(null);
    setStatus('');
  };

  const isAnggota = session?.user?.role === 'anggota';

  return (
    <section className="scan-card">
      <div className="scan-header">
        <span className="brand-mark">DPRD</span>
        <div>
          <h1>Presensi Anggota Dewan</h1>
          <p className="muted">Masuk sekali, lalu cukup scan QR rapat.</p>
        </div>
      </div>

      {ready && session && (
        <div className="scan-user">
          <span>
            {session.user.nama} <small>{session.user.role}</small>
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      )}

      {ready && !isAnggota && (
        <form onSubmit={handleLogin} className="form-stack">
          <label className="form-group">
            <span className="form-label">Email anggota</span>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@dprd.slemankab.go.id"
              autoComplete="email"
              required
            />
          </label>
          <label className="form-group">
            <span className="form-label">Password</span>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {loginError && <p className="error-text">{loginError}</p>}
          <button type="submit" className="btn btn-primary" disabled={loginLoading}>
            {loginLoading ? 'Memproses...' : 'Masuk sebagai Anggota'}
          </button>
          <p className="muted">
            Identitas kehadiran diambil dari akun yang masuk, bukan dari siapa pun yang memegang QR.
          </p>
        </form>
      )}

      {isAnggota && (
        <>
          <div id="qr-reader" className="qr-reader" />
          {status && <p className="scan-status">{status}</p>}
          {cameraError && <p className="error-text">{cameraError}</p>}

          {result?.ok && (
            <div className="scan-result scan-result-success" role="status">
              <strong>{result.data.anggota.nama}</strong>
              <span>
                {result.data.anggota.jabatan} · {result.data.anggota.fraksi}
              </span>
              <span>{result.data.rapat.judul}</span>
              <span>
                Masuk pukul {result.data.jam_masuk} WIB · {result.data.status}
              </span>
            </div>
          )}
          {result && !result.ok && (
            <div className="scan-result scan-result-error" role="alert">
              <strong>Scan belum berhasil</strong>
              <span>{result.message}</span>
            </div>
          )}

          <button type="button" className="btn btn-primary scan-again" onClick={startScanner}>
            Scan lagi
          </button>
        </>
      )}
    </section>
  );
}
