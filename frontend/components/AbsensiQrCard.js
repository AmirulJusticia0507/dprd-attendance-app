'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch, readError } from '../lib/api';

export default function AbsensiQrCard({ rapat, onClose }) {
  const [qrPayload, setQrPayload] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!qrPayload) return;
    let active = true;
    QRCode.toDataURL(qrPayload, { width: 320, margin: 2 }).then((url) => {
      if (active) setQrImage(url);
    });
    return () => {
      active = false;
    };
  }, [qrPayload]);

  const generate = async () => {
    setLoading(true);
    setError('');
    setQrImage('');
    try {
      const response = await apiFetch(`/api/rapat/${rapat.id}/absensi-qr/shared`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error(await readError(response, 'Gagal membuat QR'));
      const body = await response.json();
      setQrPayload(body.data.qrPayload);
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
          <h2>QR Rapat · {rapat.judul}</h2>
          <p className="muted">
            Anggota masuk dengan akunnya sekali, lalu cukup scan QR ini. Identitas yang tercatat
            berasal dari akun yang sedang masuk.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Tutup
        </button>
      </header>

      <button type="button" className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? 'Membuat QR...' : qrPayload ? 'Buat ulang QR' : 'Buat QR Rapat'}
      </button>

      {error && <p className="error-text">{error}</p>}
      {expiresAt && (
        <p className="muted">Berlaku sampai {new Date(expiresAt).toLocaleString('id-ID')} WIB.</p>
      )}

      {qrPayload && (
        <div className="qr-shared">
          {qrImage ? (
            <img src={qrImage} alt={`QR rapat ${rapat.judul}`} />
          ) : (
            <div className="qr-placeholder" />
          )}
          <p className="muted">
            Tampilkan QR ini di layar. Setiap anggota scan dengan PWA masing-masing.
          </p>
        </div>
      )}
    </section>
  );
}
