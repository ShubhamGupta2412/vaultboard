# 🔐 VaultBoard Authentication System

A complete, production-ready authentication system for Next.js 15 with Supabase, featuring role-based access control, protected routes, and a beautiful UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

---

## ✨ Features

- 🔐 **Complete Authentication Flow**
  - Email/password signup and login
  - Secure session management with cookies
  - Server and client-side authentication
  
- 👥 **Role-Based Access Control**
  - 4 user roles: Admin, Manager, Member, Viewer
  - Role selection during signup
  - Database-backed role management
  
- 🛡️ **Protected Routes**
  - Middleware-based route protection
  - Automatic redirects for unauthenticated users
  - Public and private route separation
  
- 🎨 **Professional UI/UX**
  - Beautiful TailwindCSS design
  - Responsive mobile-first layout
  - Loading states and animations
  - Form validation with error messages
  
- 🔒 **Security Best Practices**
  - Environment variable configuration
  - Row-level security in database
  - No hardcoded credentials
  - TypeScript type safety
  - HTTPOnly cookie sessions

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run the database setup script in Supabase SQL Editor
# (Copy from supabase-setup.sql)

# 4. Start development server
npm run dev
```

Visit **http://localhost:3000** and create your first account!

---

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - 5-minute setup
- **[Setup Guide](AUTH_SETUP.md)** - Complete documentation
- **[Implementation Details](IMPLEMENTATION_SUMMARY.md)** - Technical overview
- **[Database Setup](supabase-setup.sql)** - SQL script

---

## 📁 Project Structure

```
vaultboard/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup with role selection
│   │   └── logout/         # Logout handler
│   ├── dashboard/          # Protected dashboard
│   ├── entries/            # Protected entries page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── lib/
│   ├── api/
│   │   └── auth.ts         # Authentication API
│   └── supabase/
│       ├── client.ts       # Browser client
│       └── server.ts       # Server client
├── middleware.ts           # Route protection
├── supabase-setup.sql     # Database setup
└── .env.example           # Environment template
```

---

## 🔑 Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get your credentials from [Supabase Dashboard](https://app.supabase.com) → Settings → API

---

## 🎯 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management |
| **Manager** | Create and manage team content |
| **Member** | Create and edit own content |
| **Viewer** | Read-only access to shared content |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS 3
- **State Management**: React Hooks

---

## 📊 Database Schema

```sql
user_roles
├── id              UUID (Primary Key)
├── user_id         UUID (Foreign Key → auth.users)
├── email           TEXT
├── role            TEXT (admin|manager|member|viewer)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

Complete with Row Level Security (RLS) policies and performance indexes.

---

## 🧪 Testing

### Test Signup Flow
1. Navigate to `/auth/signup`
2. Enter email and password
3. Select a role
4. Submit form
5. Should redirect to login

### Test Login Flow
1. Navigate to `/auth/login`
2. Enter credentials
3. Submit form
4. Should redirect to `/dashboard`

### Test Protected Routes
1. Logout if logged in
2. Try accessing `/dashboard`
3. Should redirect to `/auth/login`
4. Login and retry
5. Should access dashboard

---

## 🔐 Security Features

- ✅ Environment variables for sensitive data
- ✅ Row Level Security (RLS) in database
- ✅ HTTPOnly cookies for session storage
- ✅ Client and server-side validation
- ✅ CSRF protection (built into Next.js)
- ✅ TypeScript for type safety
- ✅ No sensitive data in logs
- ✅ Secure password requirements

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🐛 Troubleshooting

### Issue: Environment variables not found
**Solution**: Ensure `.env.local` exists and contains valid Supabase credentials

### Issue: Database table not found
**Solution**: Run the SQL script from `supabase-setup.sql` in Supabase SQL Editor

### Issue: Can't login after signup
**Solution**: Check if email confirmation is disabled in Supabase Auth settings

### Issue: TypeScript errors
**Solution**: Run `npm install` to ensure all type definitions are installed

---

## 🎯 Next Steps

- [ ] Implement entry CRUD operations
- [ ] Add user profile management
- [ ] Create admin panel for user management
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Create role-based UI components
- [ ] Add search and filtering
- [ ] Implement file uploads

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🤝 Contributing

This is a complete authentication template. Feel free to:
- Fork and customize for your needs
- Add additional features
- Improve the UI/UX
- Report issues or suggestions

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💡 Tips

- **Development**: Disable email confirmation in Supabase for easier testing
- **Production**: Enable email confirmation and configure email templates
- **Security**: Never commit `.env.local` file to version control
- **Performance**: Use server components where possible for better performance
- **SEO**: Add metadata to each page for better SEO

---

## 🆘 Support

- Check the documentation in the `/docs` folder
- Review code comments for implementation details
- Visit Supabase Discord for Supabase-specific questions
- Check Next.js GitHub for Next.js-related issues

---

**Built with ❤️ for VaultBoard**

Version: 1.0.0 | Status: ✅ Production Ready | Last Updated: December 11, 2025
