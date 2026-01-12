import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    // Construct the backend URL
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const backendUrl = `${BACKEND_URL}/api/${path}${queryString}`;

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
      // Don't follow redirects automatically
      redirect: 'manual',
    });

    // Get response body
    const responseBody = await response.text();

    // Forward the response
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip some headers that shouldn't be forwarded
      if (!['connection', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service' },
      { status: 502 }
    );
  }
}
