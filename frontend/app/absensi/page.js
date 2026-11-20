'use client';

import { useState } from 'react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { useCollection } from '../../lib/useCollection';

export default function AbsensiPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [rapatId, setRapatId] = useState('');
  const [anggotaId, setAnggotaId] = useState('');
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (status) params.set('status', status);
  if (rapatId) params.set('rapat_id', rapatId);
  if (anggotaId) params.set('anggota_id', anggotaId);
  const collection = useCollection(`/api/absensi?${params.toString()}`);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Absensi</h1>
          <p className="muted">Daftar kehadiran anggota pada setiap rapat.</p>
        </div>
      </header>

      <section className="card">
        <div className="toolbar">
          <label>
            <span className="form-label">Status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">Semua</option>
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="alpha">Alpha</option>
            </select>
          </label>
          <label>
            <span className="form-label">Rapat ID</span>
            <input value={rapatId} onChange={(event) => { setRapatId(event.target.value); setPage(1); }} placeholder="Contoh: 3" />
          </label>
          <label>
            <span className="form-label">Anggota ID</span>
            <input value={anggotaId} onChange={(event) => { setAnggotaId(event.target.value); setPage(1); }} placeholder="Contoh: 12" />
          </label>
        </div>

        <DataTable
          columns={[
            { key: 'nama_anggota', label: 'Anggota' },
            { key: 'nama_rapat', label: 'Rapat' },
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'jam_masuk', label: 'Jam masuk' },
            { key: 'status', label: 'Status', render: (row) => <span className={`badge ${row.status}`}>{row.status}</span> },
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
