# Supabase Setup Guide

To enable the sign up functionality in your TrustedGoods application, you need to set up Supabase and configure the environment variables.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter a project name (e.g., "reviewhub")
6. Enter a database password
7. Choose a region close to your users
8. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

## Step 4: Run Database Migrations

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Run the migrations:
   ```bash
   supabase db push
   ```

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL (e.g., `http://localhost:5173`)
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/`
   - `http://localhost:5173/signin`
   - `http://localhost:5173/signup`

## Step 6: Test the Sign Up Functionality

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the sign up page
3. Fill in the form with:
   - Email: your email address
   - Password: a strong password
   - Username: a unique username
   - Bio: optional description

4. Click "Create Account"

## Features Included

The sign up functionality includes:

- ✅ Email and password authentication
- ✅ Username uniqueness validation
- ✅ Bio field (optional, max 150 characters)
- ✅ Google OAuth integration
- ✅ Email confirmation flow
- ✅ Automatic user profile creation
- ✅ Success/error feedback
- ✅ Form validation

## Troubleshooting

### "Invalid API key" error
- Make sure your `.env` file has the correct Supabase URL and anon key
- Restart your development server after updating environment variables

### "Username already taken" error
- The system checks for username uniqueness before creating accounts
- Try a different username

### Email confirmation not working
- Check your spam folder
- Verify the redirect URLs in Supabase Auth settings
- Make sure your email is confirmed in Supabase

### Database errors
- Run `supabase db push` to ensure migrations are applied
- Check the Supabase dashboard for any database errors

## Next Steps

Once sign up is working, you can:
1. Customize the email templates in Supabase Auth settings
2. Add additional user profile fields
3. Implement email verification requirements
4. Add social login providers (GitHub, Discord, etc.)
