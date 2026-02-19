export default function SettingsPage() {
  return (
    <div className="container">
      <section className="card">
        <h2 className="section-title">Settings</h2>
        <p className="muted">
          This take-home keeps the Optimizely Graph auth key server-side via a Next.js Route Handler.
          Configure your key in <code>.env</code> (see <code>.env.example</code>).
        </p>
        <ul className="bullets">
          <li>
            Server proxy route: <code>/api/graph</code>
          </li>
          <li>Client uses SWR for caching</li>
          <li>Nearest branches uses browser geolocation</li>
        </ul>
      </section>
    </div>
  );
}
