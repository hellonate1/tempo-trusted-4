# Database Setup for Profile Page

## 🗄️ Required Tables

The Profile page requires the following database tables to be created:

1. **users** (already exists from previous migration)
2. **reviews** (new table for user reviews)
3. **products** (new table for product information)

## 🔧 Setup Instructions

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref ereikqcnvupuqivmwfco
   ```

4. **Run the migration**:
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the migration SQL** from `supabase/migrations/20240322000002_create_reviews_table.sql`

## 📊 What Gets Created

### Reviews Table
- User reviews with ratings, titles, and content
- Links to products and users
- Helpful votes and comment counts
- Timestamps for creation and updates

### Products Table
- Product information (name, description, image, price)
- Sample products for testing

### Security Policies
- Row Level Security (RLS) enabled
- Users can only edit their own reviews
- Anyone can view reviews and products

## 🧪 Testing

After running the migration:

1. **Check your profile page** at `/profile/your-username`
2. **Verify the database tables** in Supabase Dashboard → Table Editor
3. **Test clicking on reviewer names** in review cards

## 🔍 Troubleshooting

If you encounter issues:

1. **Check the migration ran successfully** in Supabase Dashboard → Database → Migrations
2. **Verify RLS policies** are enabled in Table Editor
3. **Check browser console** for any database errors

The Profile page should now work with the complete database structure!
