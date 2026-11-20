'use client';

import { useState } from 'react';
import AbsensiQrCard from '../../components/AbsensiQrCard';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { useCollection } from '../../lib/useCollection';

export default function RapatPage() {
  const [page, setPage] = useState(1);
  const [selectedRapat, setSelectedRapat] = useState(null);
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
            {
              key: 'qr',
              label: 'QR Absensi',
              render: (row) => (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setSelectedRapat(row)}
                >
                  Buat QR
                </button>
              ),
            },
          ]}
          rows={collection.data}
          loading={collection.loading}
          error={collection.error}
        />
        <Pagination meta={collection.meta} rows={collection.data} onChange={setPage} />
      </section>

      {selectedRapat && (
        <AbsensiQrCard rapat={selectedRapat} onClose={() => setSelectedRapat(null)} />
      )}
    </>
  );
}
