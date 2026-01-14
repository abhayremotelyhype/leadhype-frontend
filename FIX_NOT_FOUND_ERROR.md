# Fix "The page could not be found" Error

## 🔍 Common Causes

1. **Build failed on Vercel**
2. **Missing environment variables** (causing build to fail)
3. **TypeScript/ESLint errors** preventing build
4. **Wrong URL** being accessed
5. **Catch-all route issue** with Next.js App Router

---

## ✅ Step-by-Step Fix

### Step 1: Check Vercel Build Logs

1. Go to **Vercel Dashboard** → Your Frontend Project
2. Click on **Deployments**
3. Click on the latest deployment
4. Check if it says **"Ready"** or **"Failed"**

If it says **"Failed"**:
- Click "View Function Logs" or "Build Logs"
- Look for error messages
- Common errors:
  - TypeScript errors
  - Missing dependencies
  - Environment variable issues

---

### Step 2: Fix Common Build Errors

#### Error: Missing environment variables
```bash
# Add to Vercel Dashboard → Settings → Environment Variables:
BACKEND_API_URL=https://api.leadhype-portal.site

# Then redeploy
```

#### Error: TypeScript errors
```bash
# Locally, run:
cd /Users/abhaybhosale/RiderProjects/Leadhype/frontend
npm run type-check

# Fix any errors shown, then commit and push
```

#### Error: ESLint errors
```bash
# Locally, run:
npm run lint

# Fix any errors shown, then commit and push
```

---

### Step 3: Verify Correct URL

Make sure you're accessing:
- ✅ `https://leadhype-portal.site` (correct)
- ✅ `https://leadhype-portal.site/login` (correct)
- ❌ `https://leadhype-portal.site/api/...` (this is for API only)

---

### Step 4: Fix Next.js 14 App Router Compatibility

The catch-all API route needs to be updated for Next.js 14:

**Current issue:** The route uses synchronous params, but Next.js 14 requires async params.

**File:** `src/app/api/[...path]/route.ts`

Update it to:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';

// Add these route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
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

    console.log(`[API Proxy] ${method} ${backendUrl}`);

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
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service', details: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}
```

---

### Step 5: Local Testing

Before deploying, test locally:

```bash
cd /Users/abhaybhosale/RiderProjects/Leadhype/frontend

# Install dependencies
npm install

# Build locally to check for errors
npm run build

# If build succeeds:
npm start

# Visit http://localhost:3000
```

If local build fails, fix the errors shown before deploying.

---

### Step 6: Redeploy to Vercel

After fixing any issues:

```bash
# Commit changes
git add .
git commit -m "Fix Next.js 14 App Router compatibility"
git push

# Vercel will auto-deploy, OR manually trigger:
vercel --prod
```

---

## 🧪 Testing Checklist

After deployment:

- [ ] Deployment shows "Ready" (not "Failed")
- [ ] Visit `https://leadhype-portal.site` → should show login page or dashboard
- [ ] No "NOT_FOUND" error
- [ ] Can access `/login` page
- [ ] Can access `/campaigns` page (after login)
- [ ] API proxy works: Check DevTools → Network → `/api/auth/me` returns data

---

## 🔍 Debug Information

### Check Vercel Deployment Status

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Check deployments
vercel list

# View logs
vercel logs <deployment-url>
```

### Check Build Output

In Vercel Dashboard → Deployment → Build Logs, look for:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

If you see errors instead, that's what needs to be fixed.

---

## 🆘 Still Not Working?

### Option 1: Check for Framework Preset

In Vercel Dashboard:
1. Go to Project Settings
2. Build & Development Settings
3. **Framework Preset** should be: **Next.js**
4. **Build Command**: `npm run build` or `next build`
5. **Output Directory**: `.next`

### Option 2: Check Node Version

In `package.json`, add:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Option 3: Simplify next.config.js

Try with minimal config:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

---

## 📞 Quick Diagnosis

**Symptom:** "NOT_FOUND" error on homepage

**Most likely causes (in order):**
1. Build failed on Vercel (check deployment logs)
2. Missing BACKEND_API_URL env var causing build errors
3. Next.js 14 params compatibility issue
4. Wrong Framework Preset in Vercel settings

**Quick fix to try first:**
1. Add `BACKEND_API_URL=https://api.leadhype-portal.site` in Vercel
2. Redeploy
3. Clear browser cache

---

**Need the updated route file? I can create it for you!**
