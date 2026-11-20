'use client';

import { useState } from 'react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { apiFetch, readError } from '../../lib/api';
import { useCollection } from '../../lib/useCollection';

const fraksiOptions = ['PKB', 'Gerindra', 'PDI Perjuangan', 'Golkar', 'PPP NasDem', 'PKS', 'PAN'];

export default function RekapPage() {
  const [page, setPage] = useState(1);
  const [fraksi, setFraksi] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (fraksi) params.set('fraksi', fraksi);
  const collection = useCollection(`/api/absensi/rekap?${params.toString()}`);

  const downloadCsv = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await apiFetch(`/api/absensi/rekap/csv?${fraksi ? `fraksi=${encodeURIComponent(fraksi)}` : ''}`);
      if (!response.ok) throw new Error(await readError(response, 'Gagal mengunduh CSV'));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rekap-absensi.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Rekap Kehadiran</h1>
          <p className="muted">Ringkasan hadir, izin, dan alpha per anggota.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={downloadCsv} disabled={downloading}>
          {downloading ? 'Mengunduh...' : 'Unduh CSV'}
        </button>
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
        </div>
        {error && <p className="error-text">{error}</p>}
        <DataTable
          columns={[
            { key: 'nama', label: 'Anggota' },
            { key: 'fraksi', label: 'Fraksi' },
            { key: 'periode', label: 'Periode' },
            { key: 'total', label: 'Total' },
            { key: 'hadir', label: 'Hadir' },
            { key: 'izin', label: 'Izin' },
            { key: 'alpha', label: 'Alpha' },
            { key: 'persentase_hadir', label: 'Persentase', render: (row) => <span className="badge hadir">{row.persentase_hadir}%</span> },
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
