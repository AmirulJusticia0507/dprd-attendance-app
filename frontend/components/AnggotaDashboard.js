'use client';

import Link from 'next/link';
import DataTable from './DataTable';
import { useCollection } from '../lib/useCollection';

export default function AnggotaDashboard() {
  const dashboard = useCollection('/api/dashboard/anggota');
  const profil = dashboard.data?.profil || {};
  const statistik = dashboard.data?.statistik || {};
  const absensi = dashboard.data?.absensi_terbaru || [];
  const rapat = dashboard.data?.rapat_mendatang || [];

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Halo, {profil.nama || 'Anggota Dewan'}</h1>
          <p className="muted">
            {profil.jabatan || 'Anggota DPRD'} · {profil.fraksi || '-'} · {profil.periode || '-'}
          </p>
        </div>
        <Link href="/scan" className="btn btn-primary">
          Scan QR Sekarang
        </Link>
      </header>

      {dashboard.error && <p className="error-text">{dashboard.error}</p>}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total kehadiran</span>
          <strong className="stat-value">{statistik.total ?? '-'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Hadir</span>
          <strong className="stat-value">{statistik.hadir ?? '-'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Izin</span>
          <strong className="stat-value">{statistik.izin ?? '-'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Persentase hadir</span>
          <strong className="stat-value">{statistik.persentase_hadir ?? '-'}%</strong>
        </article>
      </section>

      <section className="card">
        <h2 className="card-title">Rapat mendatang</h2>
        {rapat.length === 0 ? (
          <p className="muted">Belum ada rapat mendatang.</p>
        ) : (
          <div className="agenda-list">
            {rapat.map((item) => (
              <article className="agenda-item" key={item.id}>
                <div>
                  <strong>{item.judul}</strong>
                  <span className="muted">
                    {item.tanggal} · {item.waktu_mulai || '-'}
                    {item.tempat ? ` · ${item.tempat}` : ''}
                  </span>
                </div>
                <span className={`badge ${item.status_absensi || 'menunggu'}`}>
                  {item.status_absensi || 'belum absen'}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <header className="card-header">
          <h2 className="card-title">Riwayat kehadiran saya</h2>
          <Link href="/riwayat" className="btn btn-ghost btn-sm">
            Lihat semua
          </Link>
        </header>
        <DataTable
          columns={[
            { key: 'nama_rapat', label: 'Rapat' },
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'jam_masuk', label: 'Jam masuk' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <span className={`badge ${row.status}`}>{row.status}</span>,
            },
          ]}
          rows={absensi}
          loading={dashboard.loading}
          error={dashboard.error}
        />
      </section>
    </>
  );
}
