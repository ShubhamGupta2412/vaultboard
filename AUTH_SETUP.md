# VaultBoard Authentication Setup Guide

Complete authentication system for VaultBoard using Next.js 15 and Supabase.

## 📋 Features

- ✅ Email/password authentication
- ✅ Role-based access control (Admin, Manager, Member, Viewer)
- ✅ Protected routes with middleware
- ✅ Server and client-side Supabase clients
- ✅ Session management
- ✅ Form validation
- ✅ Error handling
- ✅ TypeScript support
- ✅ Responsive design with TailwindCSS

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@supabase/ssr` - Supabase SSR client for Next.js 15
- `@supabase/supabase-js` - Supabase JavaScript client
- `next` - Next.js 15 framework
- `react` & `react-dom` - React libraries
- `typescript` - TypeScript support

### 2. Set Up Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (~2 minutes)
3. Go to **Settings** > **API** in your Supabase dashboard
4. Copy your project URL and anon key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 4. Set Up Database

1. Go to your Supabase project's **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Paste and run the SQL script
4. Verify the table was created: `SELECT * FROM user_roles;`

This will create:
- `user_roles` table with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp updates

### 5. Configure Supabase Auth Settings

1. Go to **Authentication** > **URL Configuration** in Supabase
2. Add your site URL: `http://localhost:3000`
3. Go to **Authentication** > **Providers**
4. Enable **Email** provider
5. Disable email confirmation for development (optional):
   - Go to **Authentication** > **Settings**
   - Disable "Enable email confirmations"

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you'll be redirected to the login page.

## 📁 File Structure

```
vaultboard/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with email/password
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page with role selection
│   │   └── logout/
│   │       └── route.ts          # Logout route handler
│   ├── dashboard/                # Protected dashboard route
│   └── entries/                  # Protected entries route
├── lib/
│   ├── api/
│   │   └── auth.ts               # Authentication API functions
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client
├── middleware.ts                 # Route protection middleware
├── .env.example                  # Environment variables template
└── supabase-setup.sql           # Database setup script
```

## 🔑 Key Components Explained

### A) Supabase Clients (`lib/supabase/`)

**client.ts** - Browser-side client
- Uses `createBrowserClient` from `@supabase/ssr`
- Automatically handles localStorage for session persistence
- Used in client components (pages with 'use client')

**server.ts** - Server-side client
- Uses `createServerClient` from `@supabase/ssr`
- Handles cookies for session management
- Used in server components, API routes, and middleware

### B) Authentication API (`lib/api/auth.ts`)

Core functions:
- `signUp(email, password, role)` - Create new user account
- `signIn(email, password)` - Authenticate existing user
- `signOut()` - Clear user session
- `getCurrentUser()` - Get authenticated user
- `getUserRole(userId)` - Fetch user's role from database
- `getUserProfile(userId)` - Get complete user profile
- `hasRole(userId, role)` - Check user permissions
- `isAdmin(userId)` - Check admin status

### C) Authentication Pages

**Login (`app/auth/login/page.tsx`)**
- Email/password input with validation
- Client-side form validation
- Loading states during authentication
- Error message display
- Redirects to dashboard on success

**Signup (`app/auth/signup/page.tsx`)**
- Email, password, confirm password fields
- Role selection (admin, manager, member, viewer)
- Terms acceptance checkbox
- Comprehensive validation
- Creates user and inserts role into database
- Redirects to login on success

### D) Middleware (`middleware.ts`)

Handles route protection:
- **Public routes**: `/auth/login`, `/auth/signup`
- **Protected routes**: `/dashboard`, `/entries`, `/api`
- Redirects unauthenticated users to login
- Redirects authenticated users from auth pages to dashboard
- Preserves original URL for post-login redirect

### E) Logout Route (`app/auth/logout/route.ts`)

Server-side logout handler:
- Supports both POST and GET methods
- Clears Supabase session
- Redirects to login page

## 🎨 Styling

- **Framework**: TailwindCSS
- **Colors**: 
  - Primary: Teal (#208280)
  - Error: Red (#ef4444)
  - Background: Slate gradients
- **Features**:
  - Mobile responsive
  - Loading spinners
  - Form validation states
  - Accessible form labels
  - Professional spacing

## 🔐 Security Best Practices

1. **No Hardcoded Credentials**: All sensitive data in environment variables
2. **Row Level Security**: Database policies enforce access control
3. **Client-Side Validation**: Immediate user feedback
4. **Server-Side Validation**: Supabase handles final validation
5. **Secure Sessions**: HTTPOnly cookies for session management
6. **Type Safety**: Full TypeScript coverage
7. **Error Handling**: Meaningful error messages without exposing sensitive info

## 🧪 Testing the System

1. **Signup Flow**:
   ```
   1. Go to /auth/signup
   2. Enter email and password
   3. Select a role
   4. Accept terms
   5. Click "Create Account"
   6. Should redirect to login
   ```

2. **Login Flow**:
   ```
   1. Go to /auth/login
   2. Enter registered email and password
   3. Click "Sign In"
   4. Should redirect to /dashboard
   ```

3. **Protected Routes**:
   ```
   1. Try accessing /dashboard without login
   2. Should redirect to /auth/login
   3. After login, should access /dashboard
   ```

4. **Logout**:
   ```
   1. While logged in, go to /auth/logout
   2. Should clear session and redirect to login
   ```

## 📊 Database Schema

```sql
user_roles
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── email (TEXT, NOT NULL)
├── role (TEXT, CHECK: admin|manager|member|viewer)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🛠️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_SITE_URL` | Your application URL | `http://localhost:3000` |

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: Ensure `.env.local` exists and contains valid credentials

### Issue: "Failed to insert user role"
**Solution**: Run the `supabase-setup.sql` script in your Supabase SQL Editor

### Issue: "Session not persisting"
**Solution**: Check that cookies are enabled and NEXT_PUBLIC_SITE_URL matches your domain

### Issue: "Cannot access protected routes"
**Solution**: Clear cookies and try logging in again

## 📝 Next Steps

1. Create a dashboard page at `app/dashboard/page.tsx`
2. Create an entries page at `app/entries/page.tsx`
3. Add role-based UI elements (show/hide features based on role)
4. Implement profile management
5. Add password reset functionality
6. Configure email templates in Supabase

## 🤝 Support

For issues related to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **VaultBoard**: Review this setup guide and check the code comments

---

Built with ❤️ for VaultBoard
