# Troubleshooting Redirect Loop Issues

## 🔍 Root Cause

Your frontend keeps redirecting because:
1. It tries to check authentication via `/api/auth/me`
2. The API proxy forwards this to the backend
3. **Backend URL is not configured** in Vercel environment variables
4. Request fails → user appears unauthenticated → redirects to `/login`
5. Login page loads → tries to check auth again → infinite loop

---

## ✅ Solution (3 Steps)

### Step 1: Set Backend URL in Vercel Frontend
```bash
# Go to: Vercel Dashboard → Frontend Project → Settings → Environment Variables
# Add:
BACKEND_API_URL=https://api.leadhype-portal.site
```

### Step 2: Redeploy Frontend
- After adding the env var, click **"Redeploy"** in Vercel Dashboard

### Step 3: Clear Browser Cache
- Open incognito window OR
- Clear localStorage: DevTools → Application → Local Storage → Clear

---

## 🧪 How to Test

### Test 1: Check API Proxy
```bash
# Open browser console on https://leadhype-portal.site
# Run:
fetch('/api/status')
  .then(r => r.json())
  .then(d => console.log(d))

# Should return: { status: "healthy", ... }
```

### Test 2: Check Backend Direct
```bash
curl https://api.leadhype-portal.site/api/status

# Should return: {"status":"healthy","timestamp":"...","environment":"production"}
```

### Test 3: Check Auth Endpoint
```bash
# In browser console on https://leadhype-portal.site
fetch('/api/auth/me', {
  headers: { Authorization: 'Bearer fake-token' }
})
  .then(r => r.text())
  .then(d => console.log(d))

# Should return error (expected), but proves proxy is working
```

---

## 🔧 Common Issues

### Issue 1: "Failed to connect to backend service"
**Symptom:** 502 error in Network tab

**Causes:**
- Backend not deployed yet
- Wrong BACKEND_API_URL
- Backend is down

**Fix:**
1. Verify backend is running: `curl https://api.leadhype-portal.site/api/status`
2. Check env var is correct in Vercel
3. Redeploy frontend

---

### Issue 2: CORS errors
**Symptom:** `Access-Control-Allow-Origin` error in console

**Fix:**
```bash
# Backend needs these env vars:
ALLOWED_ORIGINS=https://leadhype-portal.site,https://www.leadhype-portal.site
FRONTEND_URL=https://leadhype-portal.site

# After setting, REDEPLOY backend!
```

---

### Issue 3: Still redirecting after fix
**Symptom:** Keeps going to /login even after setting env vars

**Causes:**
- Old tokens in localStorage
- Browser cache
- Didn't redeploy after env var change

**Fix:**
1. Open DevTools → Application → Local Storage
2. Clear `accessToken` and `refreshToken`
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Try incognito mode
5. Verify you redeployed after setting env vars

---

### Issue 4: Can't log in
**Symptom:** Login button doesn't work or gives error

**Fix:**
1. Check Network tab for `/api/auth/login` request
2. If 502: Backend URL wrong or backend down
3. If CORS error: Update backend ALLOWED_ORIGINS
4. If 401: Check if backend auth endpoint works:
   ```bash
   curl -X POST https://api.leadhype-portal.site/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@leadhype.com","password":"your_password"}'
   ```

---

## 📋 Checklist

Before contacting support, verify:

- [ ] Backend is deployed and accessible
- [ ] `curl https://api.leadhype-portal.site/api/status` returns healthy
- [ ] Frontend env var `BACKEND_API_URL=https://api.leadhype-portal.site` is set
- [ ] Backend env var `ALLOWED_ORIGINS=https://leadhype-portal.site` is set
- [ ] Both backend and frontend have been **redeployed** after env var changes
- [ ] Tried in incognito mode (clears cache/cookies)
- [ ] Cleared localStorage (DevTools → Application → Local Storage → Clear)
- [ ] No CORS errors in browser console
- [ ] Network tab shows `/api/auth/me` is being called

---

## 🔍 Debug Commands

### Check what URL frontend is using:
```bash
# In browser console on your site:
console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL)

# OR look at Network tab → /api/auth/me → Headers → Request URL
# It should proxy to: https://api.leadhype-portal.site/api/auth/me
```

### Check if tokens exist:
```bash
# In browser console:
console.log('Access Token:', localStorage.getItem('accessToken'))
console.log('Refresh Token:', localStorage.getItem('refreshToken'))

# If null, you need to log in
# If present but still redirecting, token might be invalid
```

### Force logout and clear:
```bash
# In browser console:
localStorage.clear()
location.href = '/login'
```

---

## 🆘 Still Having Issues?

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Deployments → Select deployment → Functions tab
   - Look for errors in the API proxy function

2. **Check Backend Logs:**
   - Vercel Dashboard → Backend Project → Deployments → Logs
   - Look for CORS or authentication errors

3. **Enable Debug Mode:**
   - Add to frontend .env.local: `NODE_ENV=development`
   - Redeploy and check browser console for more detailed logs

---

## ✅ Expected Behavior

When everything is working:
1. Visit `https://leadhype-portal.site`
2. If not logged in → redirects to `/login` (this is OK)
3. Log in with credentials
4. Successful login → redirects to `/` (dashboard)
5. Dashboard loads with data
6. No CORS errors in console
7. Can navigate between pages without redirecting to login

---

**Need more help? Check the environment variable files:**
- Frontend: `ENV_VARS_FOR_VERCEL.txt` (in this directory)
- Backend: `../backend-nodejs/ENV_VARS_FOR_VERCEL.txt`
