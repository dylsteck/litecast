# Troubleshooting Signer Creation - 500 Error

## Problem

Getting `API error: 500` when trying to sign in with Farcaster.

## Common Causes

### 1. Web Server Not Running

**Symptom:** 500 error or network error

**Solution:**
```bash
# In a separate terminal, start the web server
pnpm dev:web

# Or run both together
pnpm dev
```

The mobile app needs the web server running because it hosts the API endpoints.

---

### 2. Missing Environment Variables

**Symptom:** 500 error with message like "FARCASTER_APP_FID not configured"

**Solution:**
Create or update `.env` file in the **root** of the project:

```env
# Required for signer creation
FARCASTER_APP_FID=your_app_fid_here
FARCASTER_APP_MNEMONIC=your_mnemonic_phrase_here

# OR use private key instead of mnemonic
# FARCASTER_APP_PRIVATE_KEY=0x...

# Required for other API endpoints
NEYNAR_API_KEY=your_neynar_api_key

# Optional: For local mobile development
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Where to get these:**
- `FARCASTER_APP_FID`: Your Farcaster app's FID (from Farcaster developer portal)
- `FARCASTER_APP_MNEMONIC`: Your app's mnemonic phrase (keep secret!)
- `NEYNAR_API_KEY`: From Neynar dashboard

---

### 3. Wrong API URL Configuration

**Symptom:** Network error or can't reach server

**For Local Development:**

1. **Set environment variable:**
   ```bash
   # In apps/mobile/.env or root .env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

2. **Or update `apps/mobile/app/_layout.tsx`:**
   ```typescript
   // Change line 41 from:
   return 'https://litecast.xyz';
   // To:
   return 'http://localhost:3000';
   ```

**For iOS Simulator:**
- Use `http://localhost:3000` (works directly)

**For Physical Device:**
- Use your computer's local IP: `http://192.168.x.x:3000`
- Find IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Make sure phone and computer are on same network

---

### 4. Server Error in API Route

**Symptom:** 500 error with specific error message

**Check server logs:**
```bash
# Look at the terminal running pnpm dev:web
# You should see error details like:
# "Farcaster API error: ..."
# "Signer API error: ..."
```

**Common server errors:**
- Invalid mnemonic format
- Invalid FID format
- Farcaster API error (check Farcaster API status)
- Network issue calling Farcaster API

---

## Step-by-Step Debugging

### Step 1: Check Web Server is Running

```bash
# Terminal 1: Start web server
pnpm dev:web

# Should see:
# ▲ Next.js 16.1.4
# - Local:        http://localhost:3000
```

### Step 2: Test API Endpoint Directly

```bash
# Test the signer endpoint
curl -X POST http://localhost:3000/api/signer \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"test123"}'

# Should return error message if env vars missing
# Or success if configured correctly
```

### Step 3: Check Environment Variables

```bash
# In apps/web directory, check if .env exists
cat apps/web/.env

# Or check root .env
cat .env
```

### Step 4: Check Mobile App Configuration

```bash
# Check what API URL mobile app is using
# Look at console logs when signing in
# Should see: [Signer] Calling API: http://...
```

---

## Quick Fix Checklist

- [ ] Web server is running (`pnpm dev:web`)
- [ ] `.env` file exists in root or `apps/web/`
- [ ] `FARCASTER_APP_FID` is set in `.env`
- [ ] `FARCASTER_APP_MNEMONIC` or `FARCASTER_APP_PRIVATE_KEY` is set
- [ ] `EXPO_PUBLIC_API_URL` is set for local dev (if needed)
- [ ] Server logs show no errors
- [ ] Can reach API at `http://localhost:3000/api/signer` (test with curl)

---

## Error Messages Explained

### "FARCASTER_APP_FID not configured"
- **Cause:** Missing `FARCASTER_APP_FID` in `.env`
- **Fix:** Add `FARCASTER_APP_FID=xxx` to `.env`

### "Farcaster app credentials not configured"
- **Cause:** Missing both `FARCASTER_APP_MNEMONIC` and `FARCASTER_APP_PRIVATE_KEY`
- **Fix:** Add one of them to `.env`

### "Cannot reach API server"
- **Cause:** Web server not running or wrong URL
- **Fix:** Start `pnpm dev:web` and check `EXPO_PUBLIC_API_URL`

### "Farcaster API error: 400/401/403"
- **Cause:** Issue with Farcaster API (invalid credentials, rate limit, etc.)
- **Fix:** Check Farcaster API status, verify credentials

---

## Still Having Issues?

1. **Check server logs** - Most errors are logged there
2. **Test API directly** - Use curl or Postman to test endpoint
3. **Verify credentials** - Make sure Farcaster app credentials are correct
4. **Check network** - Ensure mobile device can reach your computer

---

**Last Updated:** February 6, 2026
