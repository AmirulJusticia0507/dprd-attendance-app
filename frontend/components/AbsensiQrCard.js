'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch, readError } from '../lib/api';

export default function AbsensiQrCard({ rapat, onClose }) {
  const [tokens, setTokens] = useState([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tokens.length === 0) return;
    let active = true;
    Promise.all(
      tokens.map(async (item) => [
        item.token,
        await QRCode.toDataURL(item.qrPayload, { width: 240, margin: 1 }),
      ])
    ).then((entries) => {
      if (active) setImages(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, [tokens]);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch(`/api/rapat/${rapat.id}/absensi-qr`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error(await readError(response, 'Gagal membuat QR'));
      const body = await response.json();
      setTokens(body.data.tokens);
      setExpiresAt(body.data.expires_at);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="qr-panel">
      <header className="qr-panel-header">
        <div>
          <h2>QR Absensi · {rapat.judul}</h2>
          <p className="muted">
            QR bersifat pribadi, sekali pakai, dan otomatis men-deteksi anggota.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Tutup
        </button>
      </header>

      <button type="button" className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? 'Membuat QR...' : tokens.length ? 'Buat ulang QR' : 'Buat QR Anggota'}
      </button>

      {error && <p className="error-text">{error}</p>}
      {expiresAt && (
        <p className="muted">Berlaku sampai {new Date(expiresAt).toLocaleString('id-ID')} WIB.</p>
      )}

      <div className="qr-grid">
        {tokens.map((item) => (
          <article className="qr-item" key={item.token}>
            {images[item.token] ? (
              <img src={images[item.token]} alt={`QR ${item.nama}`} />
            ) : (
              <div className="qr-placeholder" />
            )}
            <strong>{item.nama}</strong>
            <span className="muted">{item.fraksi}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
