'use client';

import { useState } from 'react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { useCollection } from '../../lib/useCollection';

const fraksiOptions = ['PKB', 'Gerindra', 'PDI Perjuangan', 'Golkar', 'PPP NasDem', 'PKS', 'PAN'];

export default function AnggotaPage() {
  const [page, setPage] = useState(1);
  const [fraksi, setFraksi] = useState('');
  const [aktif, setAktif] = useState('');
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (fraksi) params.set('fraksi', fraksi);
  if (aktif) params.set('aktif', aktif);
  const collection = useCollection(`/api/anggota?${params.toString()}`);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Anggota DPRD</h1>
          <p className="muted">Data anggota periode 2024-2029.</p>
        </div>
      </header>
      <section className="card">
        <div className="toolbar">
          <label>
            <span className="form-label">Fraksi</span>
            <select value={fraksi} onChange={(event) => { setFraksi(event.target.value); setPage(1); }}>
              <option value="">Semua fraksi</option>
              {fraksiOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select value={aktif} onChange={(event) => { setAktif(event.target.value); setPage(1); }}>
              <option value="">Semua status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </label>
        </div>
        <DataTable
          columns={[
            { key: 'nama', label: 'Nama' },
            { key: 'fraksi', label: 'Fraksi' },
            { key: 'jabatan', label: 'Jabatan' },
            { key: 'dapil', label: 'Dapil' },
            { key: 'periode', label: 'Periode' },
            { key: 'aktif', label: 'Status', render: (row) => <span className={`badge ${row.aktif ? 'hadir' : 'alpha'}`}>{row.aktif ? 'Aktif' : 'Nonaktif'}</span> },
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
