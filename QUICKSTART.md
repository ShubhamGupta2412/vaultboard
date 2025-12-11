# 🚀 VaultBoard - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

---

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

---

## Step 2: Setup Supabase (2 min)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for setup to complete (~2 minutes)

### Get API Keys
1. Go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public** key

### Setup Database
1. Go to **SQL Editor**
2. Open `supabase-setup.sql` from your project
3. Copy and paste the entire SQL script
4. Click **Run**
5. Verify: `SELECT * FROM user_roles;` (should return empty table)

---

## Step 3: Configure Environment (30 seconds)

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Step 5: Test Authentication (1 min)

### Create Account
1. Click **"Sign up"**
2. Enter email: `test@example.com`
3. Password: `password123`
4. Select role: **Member**
5. Check terms box
6. Click **"Create Account"**

### Login
1. Enter credentials
2. Click **"Sign In"**
3. You'll be redirected to `/dashboard`

### Test Protected Routes
- Try accessing `/dashboard` (should work)
- Try accessing `/entries` (should work)
- Click **Logout**
- Try accessing `/dashboard` again (should redirect to login)

---

## 🎉 You're Done!

Your authentication system is fully functional with:
- ✅ User signup with role selection
- ✅ Email/password login
- ✅ Protected routes
- ✅ Session management
- ✅ Role-based access control
- ✅ Logout functionality

---

## 📁 File Structure

```
vaultboard/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   ├── signup/page.tsx      # Signup page
│   │   └── logout/route.ts      # Logout handler
│   ├── dashboard/page.tsx       # Protected dashboard
│   ├── entries/page.tsx         # Protected entries
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/
│   ├── api/
│   │   └── auth.ts              # Auth functions
│   └── supabase/
│       ├── client.ts            # Browser client
│       └── server.ts            # Server client
├── middleware.ts                # Route protection
├── .env.local                   # Your config (create this)
├── .env.example                 # Template
└── supabase-setup.sql          # Database script
```

---

## 🔧 Configuration Files

All configuration files are already created:
- ✅ `tsconfig.json` - TypeScript config
- ✅ `tailwind.config.js` - TailwindCSS config
- ✅ `postcss.config.js` - PostCSS config
- ✅ `next.config.js` - Next.js config
- ✅ `package.json` - Dependencies

---

## 🐛 Troubleshooting

### "Missing environment variables"
→ Create `.env.local` file with your Supabase credentials

### "Failed to insert user role"
→ Run `supabase-setup.sql` in your Supabase SQL Editor

### Can't access protected routes
→ Make sure you're logged in. Clear cookies if needed.

### npm install fails
→ Delete `node_modules` and `package-lock.json`, then run `npm install` again

---

## 📚 Documentation

- **Full Setup Guide**: `AUTH_SETUP.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Database Setup**: `supabase-setup.sql`

---

## 🎯 What's Next?

Now that authentication is working, you can:
1. Create entry CRUD operations
2. Add role-based UI features
3. Implement user management (admins only)
4. Add password reset
5. Create team collaboration features

---

## 🆘 Need Help?

- Check `AUTH_SETUP.md` for detailed explanations
- Review code comments in each file
- Visit [Supabase Docs](https://supabase.com/docs)
- Check [Next.js Docs](https://nextjs.org/docs)

---

**Built with Next.js 15 + Supabase + TypeScript + TailwindCSS**

Happy coding! 🚀
