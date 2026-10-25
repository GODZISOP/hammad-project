# LUMINA // Creative Studio & Art Portfolio CMS

A complete, production-ready full-stack **Art Portfolio & Creative Gallery System** built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Authentication, and Storage)**.

---

## 🌟 Features

### 🎨 Public Creative Website
- **Modern Dark Studio Aesthetic**: Deep obsidian background with purple and electric gradient accents, subtle glassmorphism, and responsive typography.
- **Dynamic Category Showcase**: 12 default art categories (OC Character, Book Cover, 2D Character, 3D Character, Overlay, Emotes, Thumbnail, Banner, Logos, VTuber, Art Scenes, VRChat Avatars) plus unlimited dynamic categories added via admin.
- **Interactive Artwork Gallery**:
  - Live category filters
  - Instant text search across titles, categories, descriptions, and tags
  - Aspect-ratio-preserving cards with smooth hover transitions
  - Pagination / "Load More" system
- **Full-Screen Lightbox Viewer**:
  - High-res image modal with keyboard shortcuts (`Esc`, `←`, `→`), zoom, and thumbnail strips.
- **Artwork Detail Page (`/artwork/[slug]`)**:
  - Multiple gallery angles (turnarounds, close-ups, wireframes)
  - Concept notes, tags, metadata, and direct commission CTA.
  - Related pieces from the same category.
- **Commission Inquiry Form (`/contact`)**:
  - Real-time category selector, budget range pills, and anti-spam protection.
  - Submissions stored securely in Supabase.
- **Dynamic SEO**: Dynamic metadata, OpenGraph tags, automated `sitemap.xml`, and `robots.txt`.

### 🛡️ Admin Dashboard (`/admin`)
- **Protected Routes & Role Authorization**: Only authenticated users with `role = 'admin'` or `'editor'` in `profiles` can access management tools.
- **Overview Metrics**: Total artworks, active categories, featured pieces, drafts, and new commission messages.
- **Category Management (`/admin/categories`)**:
  - Add, edit, reorder, and toggle visibility.
  - **Delete Protection**: Warns if artworks exist in a category and allows reassigning them before deletion to prevent orphan records.
- **Artwork Management (`/admin/artworks`)**:
  - Add artwork (`/admin/artworks/new`) & Edit (`/admin/artworks/[id]/edit`).
  - Direct drag-and-drop cover upload to Supabase Storage.
  - Multi-image gallery uploader for additional views, captions, and reordering.
  - Featured and Published toggles.
- **Services Management (`/admin/services`)**:
  - Manage custom offerings, turnaround notes, and icons.
- **Commission Inbox (`/admin/messages`)**:
  - Filter by `New`, `Read`, `Replied`, `Archived`.
  - Detailed message view and one-click email response.
- **Website Settings (`/admin/settings`)**:
  - Control site name, logo, hero banner headings, about story, statistics, and social handles without touching source code.

---

## 🚀 Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mlobidzdaxvxlnhgoidf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_gGMfPnbl5qk65Sn46C8dqA_wcJXKy0Q
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run Database Schema & Seeds in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab on the left menu.
3. Open `supabase/schema.sql` from this repository, paste its contents into the SQL editor, and click **Run**.
   - This sets up all tables (`profiles`, `categories`, `artworks`, `artwork_images`, `services`, `contact_messages`, `site_settings`), triggers, indexes, and Row Level Security (RLS) policies.
4. Next, open `supabase/seed.sql`, paste into the SQL Editor, and click **Run**.
   - This automatically seeds the 12 default categories, initial site settings, default services, and sample artworks.

### 4. Verify Supabase Storage Buckets
The `schema.sql` automatically registers the following public storage buckets:
- `artworks`
- `categories`
- `site-assets`
- `service-images`

If your Supabase project requires creating them via the dashboard:
1. Navigate to **Storage** -> **New Bucket**.
2. Create each bucket above and ensure **Public bucket** is checked.

### 5. Create Your First Admin User
1. Go to **Authentication** -> **Users** in your Supabase Dashboard.
2. Click **Add User** -> **Create User**.
3. Enter your chosen admin email and password.
4. Go to the **Table Editor** -> `profiles` table.
5. Find the row matching your new user ID and verify that `role` is set to `'admin'`.
   *(The database trigger in `schema.sql` automatically assigns `role = 'admin'` upon user creation).*

### 6. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the portfolio.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to sign into the dashboard.

---

## 📦 Deployment to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com/new).
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional)
4. Click **Deploy**.
5. Once deployed, add your production domain to Supabase under **Authentication** -> **URL Configuration** -> **Site URL** and **Redirect URLs**.

---

## 🔒 Security & RLS
- **Public Users**:
  - Read active categories, published artworks, and active services.
  - Insert contact messages (cannot read existing messages).
  - Cannot access `/admin` routes.
- **Admin Users**:
  - Complete CRUD permissions verified via the `is_admin()` SQL security definer function.
  - Storage upload, update, and delete restricted to authenticated admins.
