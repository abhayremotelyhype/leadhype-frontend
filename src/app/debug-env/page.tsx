'use client';

import { API_BASE } from '@/lib/api';

export default function DebugEnvPage() {
  const testEndpoint = '/api/auth/login';
  const constructedUrl = API_BASE ? `${API_BASE}${testEndpoint}` : testEndpoint;

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>API Configuration Debug</h1>

      <div style={{ marginTop: '1rem' }}>
        <strong>1. Environment Variable (process.env):</strong>
        <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '0.5rem' }}>
          NEXT_PUBLIC_API_URL = {process.env.NEXT_PUBLIC_API_URL || '(empty/undefined)'}
        </pre>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <strong>2. API_BASE Constant (from api.ts):</strong>
        <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '0.5rem' }}>
          API_BASE = {API_BASE || '(empty string)'}
        </pre>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <strong>3. Sample URL Construction:</strong>
        <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '0.5rem' }}>
          Endpoint: {testEndpoint}
          {'\n'}Constructed URL: {constructedUrl}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fffbea', border: '1px solid #f5c200' }}>
        <strong>Expected Configuration:</strong>
        <ul style={{ marginTop: '0.5rem' }}>
          <li>NEXT_PUBLIC_API_URL = https://leadhype-backend.vercel.app</li>
          <li>API_BASE = https://leadhype-backend.vercel.app</li>
          <li>Constructed URL = https://leadhype-backend.vercel.app/api/auth/login</li>
        </ul>
      </div>

      <div style={{ marginTop: '1rem', color: '#dc2626' }}>
        {!API_BASE && (
          <p><strong>⚠️ WARNING:</strong> API_BASE is empty! API calls will use relative URLs and go to the frontend domain.</p>
        )}
      </div>
    </div>
  );
}
