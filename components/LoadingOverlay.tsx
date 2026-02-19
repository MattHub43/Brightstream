export default function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="spinner" />
        <div className="loading-text">{label}</div>
      </div>
    </div>
  );
}
