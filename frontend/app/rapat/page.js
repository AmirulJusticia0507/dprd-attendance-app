'use client';

import { useState } from 'react';
import AbsensiQrCard from '../../components/AbsensiQrCard';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import RapatForm from '../../components/RapatForm';
import { useCollection } from '../../lib/useCollection';

export default function RapatPage() {
  const [page, setPage] = useState(1);
  const [selectedRapat, setSelectedRapat] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const collection = useCollection(`/api/rapat?page=${page}&limit=10`);

  const handleCreated = async () => {
    setShowForm(false);
    await collection.reload();
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Rapat</h1>
          <p className="muted">Agenda rapat yang tercatat dalam sistem.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          Tambah Rapat
        </button>
      </header>

      {showForm && <RapatForm onSuccess={handleCreated} onCancel={() => setShowForm(false)} />}

      <section className="card">
        <DataTable
          columns={[
            {
              key: 'jenis_rapat',
              label: 'Jenis',
              render: (row) => (
                <span className="badge jenis">
                  {row.jenis_rapat || 'Lainnya'}
                  {row.sub_jenis ? ` · ${row.sub_jenis}` : ''}
                </span>
              ),
            },
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
