'use client';

import { useState } from 'react';
import { apiFetch, readError } from '../lib/api';

const BADAN_OPTIONS = ['Banggar', 'Badan Musyawarah', 'Badan Kehormatan', 'Bapemperda'];
const EMPTY_FORM = {
  jenis_rapat: 'Paripurna',
  sub_jenis: '',
  judul: '',
  tanggal: '',
  waktu_mulai: '',
  waktu_selesai: '',
  tempat: '',
};

export default function RapatForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) =>
      name === 'jenis_rapat'
        ? { ...current, jenis_rapat: value, sub_jenis: '' }
        : { ...current, [name]: value }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/rapat', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(await readError(response, 'Gagal menyimpan rapat'));
      await onSuccess();
      setForm(EMPTY_FORM);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const judulPlaceholder =
    form.jenis_rapat === 'Badan'
      ? `Rapat ${form.sub_jenis || 'Badan'} membahas ...`
      : `Rapat ${form.jenis_rapat} tentang ...`;

  return (
    <form className="card rapat-form" onSubmit={handleSubmit}>
      <h2 className="card-title">Tambah Rapat Baru</h2>
      <div className="rapat-form-grid">
        <label className="form-group">
          <span className="form-label">Jenis rapat</span>
          <select
            className="form-input"
            name="jenis_rapat"
            value={form.jenis_rapat}
            onChange={handleChange}
            required
          >
            <option value="Paripurna">Rapat Paripurna</option>
            <option value="Komisi">Rapat Komisi</option>
            <option value="Badan">Rapat Badan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </label>

        <label className="form-group">
          <span className="form-label">
            {form.jenis_rapat === 'Badan' ? 'Nama badan' : 'Detail rapat (opsional)'}
          </span>
          {form.jenis_rapat === 'Badan' ? (
            <select
              className="form-input"
              name="sub_jenis"
              value={form.sub_jenis}
              onChange={handleChange}
              required
            >
              <option value="">Pilih badan</option>
              {BADAN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="form-input"
              name="sub_jenis"
              value={form.sub_jenis}
              onChange={handleChange}
              placeholder={form.jenis_rapat === 'Komisi' ? 'Contoh: Komisi I' : 'Contoh: khusus'}
              disabled={form.jenis_rapat === 'Paripurna'}
            />
          )}
        </label>

        <label className="form-group rapat-form-wide">
          <span className="form-label">Judul rapat</span>
          <input
            className="form-input"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            placeholder={judulPlaceholder}
            minLength={3}
            maxLength={200}
            required
          />
        </label>

        <label className="form-group">
          <span className="form-label">Tanggal</span>
          <input
            className="form-input"
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-group">
          <span className="form-label">Tempat</span>
          <input
            className="form-input"
            name="tempat"
            value={form.tempat}
            onChange={handleChange}
            placeholder="Contoh: Ruang Rapat Utama"
          />
        </label>

        <label className="form-group">
          <span className="form-label">Waktu mulai</span>
          <input
            className="form-input"
            type="time"
            name="waktu_mulai"
            value={form.waktu_mulai}
            onChange={handleChange}
          />
        </label>

        <label className="form-group">
          <span className="form-label">Waktu selesai</span>
          <input
            className="form-input"
            type="time"
            name="waktu_selesai"
            value={form.waktu_selesai}
            onChange={handleChange}
          />
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Rapat'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Batal
        </button>
      </div>
    </form>
  );
}
