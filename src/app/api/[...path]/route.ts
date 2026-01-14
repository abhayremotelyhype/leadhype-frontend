import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';

// Next.js 14 App Router requires params to be awaited
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    // Construct the backend URL
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const backendUrl = `${BACKEND_URL}/api/${path}${queryString}`;

    console.log(`[Proxy] ${method} ${backendUrl}`);

    // Get the request body if present
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch (error) {
        // No body or already consumed
      }
    }

    // Forward headers (excluding some Next.js specific ones)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip host and connection headers
      if (!['host', 'connection', 'x-forwarded-host', 'x-forwarded-proto'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

    // Get content type to determine how to handle response
    const contentType = response.headers.get('content-type') || '';
    console.log(`[Proxy] Response: ${response.status} ${contentType}`);

    // Forward all response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip some headers that shouldn't be forwarded
      if (!['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // Handle HTML responses (like /api/docs)
    if (contentType.includes('text/html')) {
      const html = await response.text();
      return new NextResponse(html, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Handle JSON responses
    if (contentType.includes('application/json')) {
      const json = await response.text();
      return new NextResponse(json, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Handle other content types (text, binary, etc.)
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service', details: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}
