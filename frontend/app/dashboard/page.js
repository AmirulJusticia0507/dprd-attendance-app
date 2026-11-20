'use client';

import Link from 'next/link';
import DataTable from '../../components/DataTable';
import { useCollection } from '../../lib/useCollection';

const columns = [
  { key: 'nama', label: 'Anggota' },
  { key: 'fraksi', label: 'Fraksi' },
  { key: 'hadir', label: 'Hadir' },
  {
    key: 'persentase_hadir',
    label: 'Persentase',
    render: (row) => <span className="badge hadir">{row.persentase_hadir}%</span>,
  },
];

export default function DashboardPage() {
  const rekap = useCollection('/api/absensi/rekap?limit=5');
  const absensi = useCollection('/api/absensi?limit=5');
  const totalAnggota = rekap.meta?.total ?? rekap.data.length;
  const hadir = rekap.data.reduce((sum, row) => sum + Number(row.hadir || 0), 0);
  const alpha = rekap.data.reduce((sum, row) => sum + Number(row.alpha || 0), 0);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted">Ringkasan kehadiran DPRD periode berjalan.</p>
        </div>
        <Link href="/rekap" className="btn btn-primary">
          Lihat Rekap
        </Link>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Anggota tercatat</span>
          <strong className="stat-value">{totalAnggota}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Hadir (5 teratas)</span>
          <strong className="stat-value">{hadir}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Alpha (5 teratas)</span>
          <strong className="stat-value">{alpha}</strong>
        </article>
      </section>

      <section className="card">
        <h2 className="card-title">Rekap kehadiran teratas</h2>
        <DataTable columns={columns} rows={rekap.data} loading={rekap.loading} error={rekap.error} />
      </section>

      <section className="card">
        <h2 className="card-title">Absensi terbaru</h2>
        <DataTable
          columns={[
            { key: 'nama_anggota', label: 'Anggota' },
            { key: 'nama_rapat', label: 'Rapat' },
            { key: 'status', label: 'Status', render: (row) => <span className={`badge ${row.status}`}>{row.status}</span> },
            { key: 'tanggal', label: 'Tanggal' },
          ]}
          rows={absensi.data}
          loading={absensi.loading}
          error={absensi.error}
        />
      </section>
    </>
  );
}
