# 🔐 VaultBoard - Knowledge Management System

A complete, production-ready knowledge management platform built with Next.js 15, Supabase, featuring role-based access control, AES-256 encryption, document uploads, and automated credential expiration tracking.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)
![Security](https://img.shields.io/badge/Encryption-AES--256-red)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [User Roles & Permissions](#-user-roles--permissions)
- [Security Features](#-security-features)
- [File Upload System](#-file-upload-system)
- [Credential Expiration Tracking](#-credential-expiration-tracking)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Complete email/password authentication flow
- Role-based access control (Admin, Manager, Member, Viewer)
- User profile with full name
- Secure session management with HTTPOnly cookies
- Middleware-based route protection

### 📚 Knowledge Management
- Create, Read, Update, Delete (CRUD) operations for entries
- 4 entry categories: Credentials, SOPs, Links, Documents
- 4 classification levels: Public, Internal, Confidential, Restricted
- Tagging system for easy organization
- Search and filter capabilities
- Access logging for audit trails

### 🔒 Security & Encryption
- **AES-256 encryption** for sensitive content
- Client-side and server-side encryption/decryption
- Content masking in list views
- Row-level security (RLS) policies
- Encrypted data at rest in database
- Generated encryption keys

### 📁 Document Upload
- File attachments for document entries
- Supported formats: PDF, DOC, DOCX, TXT, MD, XLSX, XLS, CSV, ZIP
- 10MB file size limit
- Supabase Storage integration
- User-specific file folders
- Download capability from entry details

### ⏰ Credential Expiration System
- Set expiration dates on entries
- Real-time dashboard alerts for expiring credentials
- Visual indicators (Red/Orange/Yellow badges)
- Automated daily checks via Vercel Cron
- Categorized by urgency (Expired, Critical ≤7d, Warning ≤14d)
- Expandable alert details with direct links

### 🎨 User Interface
- Beautiful, responsive TailwindCSS design
- Custom logo component
- Masked user ID display with toggle
- Entry cards with action buttons
- Loading states and animations
- Form validation with error messages
- Export functionality (JSON, TXT formats)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account ([sign up free](https://supabase.com))
- Git installed

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ShubhamGupta2412/vaultboard.git
cd vaultboard

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables section)

# 4. Setup Supabase Database
# Go to Supabase Dashboard → SQL Editor
# Run the following SQL commands in order:

# Step 4a: Create user_roles table
# (Copy from DATABASE_FILE_UPLOAD.sql - user_roles section)

# Step 4b: Create knowledge_entries table
# (See Database Setup section below)

# Step 4c: Create access_logs table
# (See Database Setup section below)

# Step 4d: Add file upload columns
ALTER TABLE knowledge_entries
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;

# 5. Setup Supabase Storage
# - Go to Supabase Dashboard → Storage
# - Create bucket named "documents" (Public)
# - Run storage policies from DATABASE_FILE_UPLOAD.sql

# 6. Generate encryption key
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64').slice(0, 32))"
# Add output to .env.local as ENCRYPTION_SECRET_KEY

# 7. Start development server
npm run dev
```

Visit **http://localhost:3000** and create your first admin account!

---

## 📁 Project Structure

```
vaultboard/
├── app/
│   ├── api/
│   │   ├── entries/              # Entry CRUD endpoints
│   │   │   ├── route.ts          # List & Create entries
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts      # Get, Update, Delete entry
│   │   │   │   ├── access/       # Access logs
│   │   │   │   └── export/       # Export entry
│   │   │   └── expiring/         # Expiring credentials
│   │   ├── upload/               # File upload endpoint
│   │   ├── cron/
│   │   │   └── check-expiring/   # Vercel cron job
│   │   └── setup-storage/        # Storage bucket setup
│   ├── auth/
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup with role & name
│   │   └── logout/               # Logout handler
│   ├── dashboard/                # Main dashboard
│   ├── entries/
│   │   ├── new/                  # Create entry form
│   │   └── [id]/
│   │       ├── page.tsx          # Entry detail view
│   │       └── edit/             # Edit entry form
│   ├── test-storage/             # Storage testing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── AccessIndicator.tsx       # Security level indicator
│   ├── CopyButton.tsx            # Copy to clipboard
│   ├── DeleteButton.tsx          # Delete entry button
│   ├── EntriesGrid.tsx           # Entry cards grid
│   ├── EntryCard.tsx             # Individual entry card
│   ├── ExpiringCredentialsAlert.tsx  # Dashboard alerts
│   ├── ExportButton.tsx          # Export functionality
│   ├── Logo.tsx                  # VaultBoard logo
│   ├── SearchBar.tsx             # Search component
│   ├── SecurityBadge.tsx         # Classification badge
│   └── UserIdDisplay.tsx         # Masked user ID
├── lib/
│   ├── api/
│   │   ├── access-control.ts     # Permission checking
│   │   ├── auth.ts               # Client auth functions
│   │   ├── auth-server.ts        # Server auth functions
│   │   └── entries.ts            # Entry API functions
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   └── utils/
│       └── encryption.ts         # AES-256 encryption utils
├── middleware.ts                 # Route protection
├── vercel.json                   # Vercel cron configuration
├── DATABASE_FILE_UPLOAD.sql      # Database & storage setup
├── .env.example                  # Environment template
├── .env.local                    # Your credentials (DO NOT COMMIT)
└── README.md                     # This file
```

---

## 🗄️ Database Setup

### Complete SQL Setup Script

Run this in your **Supabase SQL Editor** (Settings → SQL Editor → New Query):

```sql
-- ============================================================================
-- 1. USER ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_email ON user_roles(email);

-- Enable RLS (currently disabled for testing - re-enable for production)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role during signup"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. KNOWLEDGE ENTRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('credential', 'sop', 'link', 'document')),
  classification TEXT NOT NULL CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
  tags TEXT[] DEFAULT '{}',
  is_sensitive BOOLEAN DEFAULT FALSE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_knowledge_entries_user_id ON knowledge_entries(user_id);
CREATE INDEX idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX idx_knowledge_entries_classification ON knowledge_entries(classification);
CREATE INDEX idx_knowledge_entries_expiration_date ON knowledge_entries(expiration_date);
CREATE INDEX idx_knowledge_entries_created_at ON knowledge_entries(created_at);

-- Enable RLS
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own entries"
  ON knowledge_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries"
  ON knowledge_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON knowledge_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON knowledge_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. ACCESS LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_access_logs_entry_id ON access_logs(entry_id);
CREATE INDEX idx_access_logs_accessed_by ON access_logs(accessed_by);
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at);

-- Enable RLS
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read access logs for their entries"
  ON access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_entries
      WHERE id = access_logs.entry_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. STORAGE POLICIES (for file uploads)
-- ============================================================================
-- Note: Create 'documents' bucket in Supabase Dashboard → Storage first

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🔑 Environment Variables

Create `.env.local` in the project root:

```env
# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
# Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# =============================================================================
# SITE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# =============================================================================
# ENCRYPTION
# =============================================================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64').slice(0, 32))"
ENCRYPTION_SECRET_KEY=your-32-character-secret-key-here

# =============================================================================
# VERCEL CRON (Optional - for production)
# =============================================================================
# Generate a strong secret for cron job authentication
CRON_SECRET=your-secret-cron-key-change-in-production
```

**Security Note**: Never commit `.env.local` to version control!

---

## 👥 User Roles & Permissions

| Role | Create | Edit Own | Edit All | Delete Own | Delete All | View Sensitive | Manage Users |
|------|--------|----------|----------|------------|------------|----------------|--------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Member** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Viewer** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Classification Access

| Classification | Admin | Manager | Member | Viewer |
|----------------|-------|---------|--------|--------|
| Public | ✅ | ✅ | ✅ | ✅ |
| Internal | ✅ | ✅ | ✅ | ❌ |
| Confidential | ✅ | ✅ | ❌ | ❌ |
| Restricted | ✅ | ❌ | ❌ | ❌ |

---

## 🔒 Security Features

### AES-256 Encryption
- Sensitive content encrypted before database storage
- Uses `crypto-js` library with AES-256-CBC
- Unique encryption key per installation
- Automatic encryption/decryption on API calls
- Content masking in list views

```typescript
// Encryption utilities
import { encryptText, decryptText, conditionalEncrypt, conditionalDecrypt } from '@/lib/utils/encryption'

// Automatically encrypts if is_sensitive = true
const encrypted = conditionalEncrypt(content, is_sensitive)
const decrypted = conditionalDecrypt(content, is_sensitive)
```

### Row-Level Security (RLS)
- PostgreSQL RLS policies on all tables
- Users can only access their own data
- Admins have elevated permissions
- Storage files isolated per user

### Authentication Security
- HTTPOnly cookies for session tokens
- Secure password requirements
- CSRF protection (built into Next.js)
- Server-side validation
- Environment variable protection

---

## 📁 File Upload System

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Spreadsheets**: XLSX, XLS, CSV
- **Archives**: ZIP

### File Size Limit
- Maximum: **10MB** per file

### Storage Structure
```
documents/
  └── {user_id}/
      ├── {timestamp}_filename1.pdf
      ├── {timestamp}_filename2.docx
      └── {timestamp}_filename3.xlsx
```

### Upload Flow
1. User selects "Document" category
2. File input field appears
3. User selects file (client-side validation)
4. On submit:
   - File uploaded to `/api/upload`
   - Stored in Supabase Storage
   - Public URL generated
   - Entry created with file reference

### Downloading Files
- Click "Download" button on entry detail page
- Files served directly from Supabase Storage
- Public URL for easy sharing (if bucket is public)

### Setup Storage
```bash
# 1. Create bucket in Supabase Dashboard → Storage
# 2. Name: "documents"
# 3. Public: Yes (or No for private files)
# 4. Run storage policies from DATABASE_FILE_UPLOAD.sql
```

---

## ⏰ Credential Expiration Tracking

### Features
- Set expiration dates on any entry
- Real-time dashboard alerts
- Visual badges on entry cards
- Automated daily checks (Vercel Cron)
- Categorized by urgency

### Status Indicators
- 🔴 **EXPIRED**: Past expiration date
- 🟠 **CRITICAL**: Expires within 7 days
- 🟡 **WARNING**: Expires within 14 days

### Dashboard Alert
- Collapsible alert banner
- Shows count of expiring credentials
- Expandable details with clickable links
- Auto-hides when no alerts

### Vercel Cron (Automated Checks)
- Runs daily at 9 AM UTC
- Checks credentials expiring within 14 days
- Logs results to Vercel deployment logs
- Ready for email notification integration

### Configuration
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/check-expiring",
    "schedule": "0 9 * * *"
  }]
}
```

---

## 🔌 API Documentation

### Authentication
All API endpoints require authentication via Supabase session cookies.

### Endpoints

#### Entries

**GET /api/entries**
- List all entries with pagination and filtering
- Query params: `category`, `classification`, `search`, `page`, `limit`
- Returns: Array of entries (sensitive content masked)

**POST /api/entries**
- Create new entry
- Body: `{ title, content, category, classification, tags, is_sensitive, expiration_date, file_url, file_name }`
- Returns: Created entry object

**GET /api/entries/[id]**
- Get single entry by ID
- Returns: Entry object (decrypted if sensitive)

**PUT /api/entries/[id]**
- Update entry
- Body: Partial entry object
- Returns: Updated entry

**DELETE /api/entries/[id]**
- Delete entry
- Returns: Success message

**GET /api/entries/expiring**
- Get expiring credentials
- Query params: `days` (default: 30)
- Returns: Categorized expiring entries

**GET /api/entries/[id]/export**
- Export entry
- Query params: `format` (json|txt)
- Returns: File download

**GET /api/entries/[id]/access**
- Get access logs for entry
- Returns: Array of access log entries

#### File Upload

**POST /api/upload**
- Upload file to Supabase Storage
- Body: FormData with `file` field
- Returns: `{ url, fileName, path }`

#### Storage Setup

**GET /api/setup-storage**
- Check storage bucket status
- Returns: Bucket configuration

**POST /api/setup-storage**
- Create storage bucket
- Returns: Bucket creation result

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] Signup with all role types
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Logout functionality
- [ ] Protected route redirection

**Entry Management**
- [ ] Create entry (all categories)
- [ ] View entry details
- [ ] Edit own entry
- [ ] Delete own entry
- [ ] Search and filter entries

**File Upload**
- [ ] Upload PDF document
- [ ] Upload DOC file
- [ ] Download uploaded file
- [ ] Replace file in edit mode

**Encryption**
- [ ] Mark entry as sensitive
- [ ] Verify masking in list view
- [ ] Verify decryption in detail view

**Expiration Tracking**
- [ ] Set expiration date
- [ ] View alert on dashboard
- [ ] Click through to entry

### Test Storage Setup
Visit `/test-storage` for interactive storage testing:
1. Check bucket status
2. Create bucket (if needed)
3. Test file upload
4. Verify download

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel Dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - ENCRYPTION_SECRET_KEY
# - CRON_SECRET
# - NEXT_PUBLIC_SITE_URL (your production URL)

# 5. Deploy to production
vercel --prod
```

### Post-Deployment
1. Create storage bucket in Supabase
2. Run database setup SQL
3. Test authentication flow
4. Verify cron jobs in Vercel Dashboard
5. Test file uploads

---

## 🐛 Troubleshooting

### Common Issues

**"Authentication required" error**
- Ensure user is logged in
- Check session cookies
- Verify Supabase credentials in `.env.local`

**"RLS policy violation" on storage**
- Run storage policies from `DATABASE_FILE_UPLOAD.sql`
- Verify bucket name is "documents"
- Check user is authenticated

**File upload fails**
- Create "documents" bucket in Supabase Storage
- Apply storage RLS policies
- Check file size (must be ≤10MB)
- Verify file type is supported

**Encrypted content shows gibberish**
- Ensure `ENCRYPTION_SECRET_KEY` is set
- Check decryption is called in entry detail view
- Verify encryption key is same across deployments

**Database errors**
- Run complete database setup SQL
- Check table names match code
- Verify RLS policies are applied
- Check foreign key relationships

**Cron job not running**
- Verify `vercel.json` exists
- Add `CRON_SECRET` to environment variables
- Check Vercel Dashboard → Cron Jobs
- Review deployment logs

### Debug Mode

```typescript
// Add to API routes for debugging
console.log('Debug:', { user, data, error })
```

---

## 📚 Tech Stack Details

### Core Framework
- **Next.js 15.5.7**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type-safe JavaScript

### Backend & Database
- **Supabase**: PostgreSQL database + Auth + Storage
- **Row Level Security**: Database-level security
- **Server Actions**: Next.js server-side operations

### Encryption & Security
- **crypto-js**: AES-256 encryption library
- **bcrypt**: Password hashing (via Supabase)
- **HTTPOnly Cookies**: Secure session storage

### UI & Styling
- **TailwindCSS 3**: Utility-first CSS framework
- **Custom Components**: Reusable UI components
- **Responsive Design**: Mobile-first approach

### Additional Libraries
- **@supabase/ssr**: Server-side rendering support
- **@supabase/supabase-js**: Supabase JavaScript client

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Testing
npm run test         # Run test suite (if implemented)
```

---

## 🎯 Roadmap

### Completed Features
- ✅ Authentication & Authorization
- ✅ Role-based access control
- ✅ Entry CRUD operations
- ✅ AES-256 encryption
- ✅ File upload system
- ✅ Credential expiration tracking
- ✅ Dashboard alerts
- ✅ Search and filtering
- ✅ Export functionality
- ✅ Access logging

### Future Enhancements
- [ ] Email notifications for expiring credentials
- [ ] Multi-file uploads per entry
- [ ] File preview (PDF, images)
- [ ] Advanced search with filters
- [ ] Entry templates
- [ ] Bulk operations
- [ ] Activity dashboard
- [ ] API rate limiting
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub)
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Entry versioning
- [ ] Automated backups

---

## 🤝 Contributing

This project was built for the **Spellbound Cup Hackathon**. Feel free to:
- Fork and customize
- Report issues
- Suggest improvements
- Submit pull requests

---

## 📄 License

This project is open source and available under the **MIT License**.

---

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Supabase Team**: For the backend platform
- **TailwindCSS Team**: For the styling framework
- **Spellbound Cup**: For the hackathon opportunity

---

## 📞 Support & Contact

- **GitHub**: [ShubhamGupta2412/vaultboard](https://github.com/ShubhamGupta2412/vaultboard)
- **Issues**: Use GitHub Issues for bug reports
- **Documentation**: Check code comments for implementation details

---

## 🎓 Learning Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [AES Encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Built with ❤️ for Secure Knowledge Management**

**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 11, 2025  
**Hackathon**: Spellbound Cup

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!
