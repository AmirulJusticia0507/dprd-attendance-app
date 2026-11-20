'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../../lib/api';

const QR_PREFIX = 'DPRD-ABSEN:';

export default function ScanPage() {
  const [status, setStatus] = useState('Menyiapkan kamera...');
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const runIdRef = useRef(0);
  const busyRef = useRef(false);

  const handleScan = useCallback(async (decodedText) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setResult(null);
    setStatus('Memproses QR...');

    try {
      const scanner = scannerRef.current;
      if (scanner) await scanner.stop().catch(() => {});
      scannerRef.current = null;

      const raw = decodedText.trim();
      const token = raw.startsWith(QR_PREFIX) ? raw.slice(QR_PREFIX.length) : raw;
      const response = await fetch(`${API_URL}/api/absensi/check-in`, {
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
      setStatus('Arahkan kamera ke QR Code absensi');
    } catch (err) {
      if (runId !== runIdRef.current) return;
      setCameraError(
        'Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan halaman dibuka melalui HTTPS.'
      );
      setStatus('');
    }
  }, [handleScan]);

  useEffect(() => {
    startScanner();
    return () => {
      runIdRef.current += 1;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [startScanner]);

  return (
    <section className="scan-card">
      <div className="scan-header">
        <span className="brand-mark">DPRD</span>
        <div>
          <h1>Presensi Anggota Dewan</h1>
          <p className="muted">Scan QR Code untuk mencatat kehadiran rapat.</p>
        </div>
      </div>

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
    </section>
  );
}
