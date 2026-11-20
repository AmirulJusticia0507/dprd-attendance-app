'use client';

import Link from 'next/link';
import DataTable from './DataTable';
import { useCollection } from '../lib/useCollection';

export default function AdminDashboard() {
  const dashboard = useCollection('/api/dashboard/admin');
  const statistik = dashboard.data?.statistik || {};
  const rekap = dashboard.data?.rekap_teratas || [];
  const absensi = dashboard.data?.absensi_terbaru || [];
  const fraksi = dashboard.data?.fraksi || [];

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard Admin</h1>
          <p className="muted">Ringkasan menyeluruh kehadiran DPRD periode berjalan.</p>
        </div>
        <Link href="/rekap" className="btn btn-primary">
          Lihat Rekap
        </Link>
      </header>

      {dashboard.error && <p className="error-text">{dashboard.error}</p>}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Anggota aktif</span>
          <strong className="stat-value">{statistik.total_anggota ?? '-'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Rapat tercatat</span>
          <strong className="stat-value">{statistik.total_rapat ?? '-'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total hadir</span>
          <strong className="stat-value">{statistik.total_hadir ?? '-'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Persentase hadir</span>
          <strong className="stat-value">{statistik.persentase_hadir ?? '-'}%</strong>
        </article>
      </section>

      <section className="card">
        <h2 className="card-title">Rekap kehadiran teratas</h2>
        <DataTable
          columns={[
            { key: 'nama', label: 'Anggota' },
            { key: 'fraksi', label: 'Fraksi' },
            { key: 'hadir', label: 'Hadir' },
            {
              key: 'persentase_hadir',
              label: 'Persentase',
              render: (row) => <span className="badge hadir">{row.persentase_hadir}%</span>,
            },
          ]}
          rows={rekap}
          loading={dashboard.loading}
          error={dashboard.error}
        />
      </section>

      <section className="card">
        <h2 className="card-title">Komposisi fraksi</h2>
        <div className="chip-row">
          {fraksi.map((item) => (
            <span className="badge fraksi" key={item.fraksi}>
              {item.fraksi}: {item.total}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Absensi terbaru</h2>
        <DataTable
          columns={[
            { key: 'nama_anggota', label: 'Anggota' },
            { key: 'nama_rapat', label: 'Rapat' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <span className={`badge ${row.status}`}>{row.status}</span>,
            },
            { key: 'tanggal', label: 'Tanggal' },
          ]}
          rows={absensi}
          loading={dashboard.loading}
          error={dashboard.error}
        />
      </section>
    </>
  );
}
