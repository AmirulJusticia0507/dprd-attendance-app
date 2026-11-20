export default function Pagination({ meta, rows, onChange }) {
  if (!meta) return null;
  const page = meta.page || 1;
  const limit = meta.limit || 10;
  const total = meta.total;
  const hasNext = total === undefined ? rows.length === limit : page * limit < total;
  return (
    <div className="pagination">
      <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Sebelumnya
      </button>
      <span className="page-info">Halaman {page}</span>
      <button type="button" className="btn btn-secondary" disabled={!hasNext} onClick={() => onChange(page + 1)}>
        Berikutnya
      </button>
    </div>
  );
}
