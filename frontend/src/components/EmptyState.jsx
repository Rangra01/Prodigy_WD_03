export default function EmptyState({ title, description, actionLabel, onAction, actionHref }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {description && <p className="empty-description">{description}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn btn-primary">
          {actionLabel}
        </a>
      )}
    </div>
  );
}
