'use client';

import { useState } from 'react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { useCollection } from '../../lib/useCollection';

export default function RiwayatPage() {
  const [page, setPage] = useState(1);
  const collection = useCollection(`/api/absensi/saya?page=${page}&limit=10`);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Riwayat Kehadiran Saya</h1>
          <p className="muted">Seluruh absensi rapat yang tercatat atas akun Anda.</p>
        </div>
        <a href="/scan" className="btn btn-primary">
          Scan QR
        </a>
      </header>

      <section className="card">
        <DataTable
          columns={[
            { key: 'nama_rapat', label: 'Rapat' },
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'tempat', label: 'Tempat' },
            { key: 'jam_masuk', label: 'Jam masuk' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <span className={`badge ${row.status}`}>{row.status}</span>,
            },
          ]}
          rows={collection.data}
          loading={collection.loading}
          error={collection.error}
        />
        <Pagination meta={collection.meta} rows={collection.data} onChange={setPage} />
      </section>
    </>
  );
}
