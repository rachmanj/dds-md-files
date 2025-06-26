# Updated Login Guide - Fixed Issues

## ✅ **CURRENT WORKING CREDENTIALS**

Based on the backend verification, these are the **correct** credentials:

| Email                     | Password  | Role        | Status |
| ------------------------- | --------- | ----------- | ------ |
| `oman@gmail.com`          | `123456`  | Super Admin | Active |
| `prana@gmail.com`         | `123456`  | Accounting  | Active |
| `logistic@gmail.com`      | `123456`  | Logistic    | Active |
| `dadsdevteam@example.com` | `dds2024` | DDS Team    | Active |

## 🔧 **FIXES IMPLEMENTED**

### 1. ✅ **Password Visibility Toggle Added**

The login form now includes an eye icon to show/hide password:

- **Eye icon** (closed) = password hidden
- **Eye icon with slash** = password visible
- Click the icon to toggle between hidden/visible

### 2. ✅ **Backend Port Configuration Fixed**

- **Backend now runs on:** `http://localhost:3001`
- **Frontend configuration updated** to use port 3001
- **Test script updated** to use correct port

## 🚀 **How to Start the System**

### Step 1: Start Backend (Terminal 1)

```bash
cd D:\project\dds-no-chat\backend
php artisan serve --port=3001
```

**Result:** Backend running on `http://localhost:3001`

### Step 2: Start Frontend (Terminal 2)

```bash
cd D:\project\dds-no-chat\frontend
npm run dev
```

**Result:** Frontend running on `http://localhost:3000`

### Step 3: Login

1. **Open browser:** `http://localhost:3000/login`
2. **Use these credentials:**
   - Email: `dadsdevteam@example.com`
   - Password: `dds2024` (use the eye icon to verify you're typing correctly)
3. **Click Sign In**

## 🧪 **Test Backend Connection**

If login still fails, test the backend:

```bash
cd D:\project\dds-no-chat\frontend
node test-backend.js
```

This will test:

- ✅ Backend connectivity on port 3001
- ✅ CSRF token handling
- ✅ Login endpoint with correct credentials
- ✅ User authentication

## 🔍 **If Login Still Fails**

### Check 1: Verify Backend is Running

Visit: `http://localhost:3001/api/health` (should show status)

### Check 2: Check Browser Console

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for any errors** when trying to login

### Check 3: Verify Frontend Environment

Make sure the frontend is using the correct backend URL:

- **Expected:** `http://localhost:3001`
- **Check:** Look for any references to `localhost:8000` in browser dev tools

### Check 4: Test Direct API Call

You can test the API directly using a tool like Postman or curl:

```bash
# Test login API directly
curl -X POST http://localhost:3001/api/token-login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email": "dadsdevteam@example.com", "password": "dds2024"}'
```

## 🎯 **Quick Checklist**

- [ ] ✅ Backend running on port 3001
- [ ] ✅ Frontend running on port 3000
- [ ] ✅ Using correct credentials: `dadsdevteam@example.com` / `dds2024`
- [ ] ✅ Password visibility toggle working
- [ ] ✅ No console errors in browser
- [ ] ✅ Backend API responding at localhost:3001

## 🚨 **Emergency Fallback**

If `dadsdevteam@example.com` still doesn't work, try:

- **Email:** `oman@gmail.com`
- **Password:** `123456`

This is the original admin account that's guaranteed to work.

---

**Note:** The password visibility toggle and port fix have been implemented without breaking any existing functionality. The system should now work correctly with these credentials.
