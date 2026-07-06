export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 32, lineHeight: 1.6 }}>
      <h1>Future Self Diary API</h1>
      <p>Backend is running.</p>
      <ul>
        <li>
          <code>GET /health</code>
        </li>
        <li>
          <code>GET /api/health</code>
        </li>
        <li>
          <code>POST /api/reflection</code>
        </li>
      </ul>
    </main>
  );
}
