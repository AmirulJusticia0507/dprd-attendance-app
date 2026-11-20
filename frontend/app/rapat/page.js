'use client';

import { useState } from 'react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { useCollection } from '../../lib/useCollection';

export default function RapatPage() {
  const [page, setPage] = useState(1);
  const collection = useCollection(`/api/rapat?page=${page}&limit=10`);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Rapat</h1>
          <p className="muted">Agenda rapat yang tercatat dalam sistem.</p>
        </div>
      </header>
      <section className="card">
        <DataTable
          columns={[
            { key: 'judul', label: 'Judul' },
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'waktu_mulai', label: 'Mulai' },
            { key: 'waktu_selesai', label: 'Selesai' },
            { key: 'tempat', label: 'Tempat' },
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
