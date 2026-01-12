'use client';

export default function DebugEnvPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Environment Variable Debug</h1>
      <div style={{ marginTop: '1rem' }}>
        <strong>NEXT_PUBLIC_API_URL:</strong>
        <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '0.5rem' }}>
          {process.env.NEXT_PUBLIC_API_URL || '(empty/undefined)'}
        </pre>
      </div>
      <div style={{ marginTop: '1rem', color: '#666' }}>
        <p>Expected value: https://leadhype-backend.vercel.app</p>
        <p>If showing empty, the environment variable is not set correctly in Vercel.</p>
      </div>
    </div>
  );
}
