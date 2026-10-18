export default function Pagination({ page, total, limit, onChange }) {
  const pageCount = Math.ceil(total / limit);
  if (pageCount <= 1) return null;

  const pages = [];
  for (let i = 1; i <= pageCount; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Product pagination">
      <button
        className="btn btn-outline pagination-button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`pagination-button ${p === page ? 'active' : ''} btn btn-outline`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="btn btn-outline pagination-button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </button>
    </nav>
  );
}
