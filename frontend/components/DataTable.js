export default function DataTable({ columns, rows, loading, error, empty = 'Belum ada data.' }) {
  if (loading) return <div className="loading">Memuat data...</div>;
  if (error) return <div className="error-text">{error}</div>;
  if (!rows.length) return <div className="empty">{empty}</div>;
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
