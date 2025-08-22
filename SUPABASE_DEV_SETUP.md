# Development Environment Google OAuth Fix

## 🔧 Supabase Authentication Settings

### Step 1: Update Site URL
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Site URL**, add:
   ```
   http://localhost:5174
   ```

### Step 2: Update Redirect URLs
1. In the same Authentication Settings page
2. Under **Redirect URLs**, add these URLs:
   ```
   http://localhost:5174/
   http://localhost:5174/signin
   http://localhost:5174/signup
   http://localhost:5173/
   http://localhost:5173/signin
   http://localhost:5173/signup
   ```

### Step 3: Google OAuth Configuration
1. Go to **Authentication** → **Providers** → **Google**
2. Make sure these settings are correct:
   - **Client ID**: `376564717270-fdbgsgiodt79tme4h6urbp27sbbvqdk4.apps.googleusercontent.com`
   - **Client Secret**: Your actual Google Client Secret
   - **Enable Sign in with Google**: ON

## 🔧 Google Cloud Console Settings

### Step 1: Authorized JavaScript Origins
Add these to your Google OAuth client:
```
http://localhost:5174
http://localhost:5173
```

### Step 2: Authorized Redirect URIs
Make sure this is set:
```
https://ereikqcnvupuqivmwfco.supabase.co/auth/v1/callback
```

## 🧪 Testing Steps

1. **Clear browser cache** and cookies for localhost
2. **Restart your development server**:
   ```bash
   npm run dev
   ```
3. **Test Google OAuth** at `http://localhost:5174/signup`

## 🔍 Debugging

If you still get errors, check the browser console for specific error messages. The improved error handling should now give you more detailed information about what's going wrong.

## 📝 Common Issues

- **CORS errors**: Make sure localhost URLs are in both Supabase and Google Cloud Console
- **Redirect errors**: Ensure redirect URLs match exactly
- **Port conflicts**: Try different ports if 5174 doesn't work
