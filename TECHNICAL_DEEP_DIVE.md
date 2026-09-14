# 🔧 VaultBoard - Advanced Technical Deep Dive

**Technical Architecture, Edge Computing, and Advanced Concepts Explained**

---

## 📋 TABLE OF CONTENTS

1. [Edge Functions Explained](#edge-functions-explained)
2. [Next.js 15 App Router Architecture](#nextjs-15-app-router-architecture)
3. [React Server Components vs Client Components](#react-server-components-vs-client-components)
4. [Supabase Architecture Deep Dive](#supabase-architecture-deep-dive)
5. [Encryption Implementation Details](#encryption-implementation-details)
6. [Row-Level Security (RLS) Internals](#row-level-security-internals)
7. [Middleware & Request Pipeline](#middleware--request-pipeline)
8. [Database Query Optimization](#database-query-optimization)
9. [Caching Strategies](#caching-strategies)
10. [Security Architecture Layers](#security-architecture-layers)
11. [Scalability & Performance](#scalability--performance)
12. [Advanced TypeScript Patterns](#advanced-typescript-patterns)

---

## 🌍 EDGE FUNCTIONS EXPLAINED

### **What Are Edge Functions?**

Edge functions are serverless functions that run on **edge servers** (geographically distributed servers close to users) instead of centralized servers.

### **Traditional Server Model:**
```
User (Mumbai) → Request → Server (US Virginia) → Response
└─ Latency: ~200-300ms
```

### **Edge Function Model:**
```
User (Mumbai) → Request → Edge Server (Mumbai) → Response
└─ Latency: ~20-50ms
```

---

### **How VaultBoard Uses Edge Functions:**

#### **1. Vercel Edge Network:**
When you deploy on Vercel, your API routes automatically become edge functions:

```typescript
// app/api/entries/route.ts
export async function GET(request: Request) {
  // This runs on the edge server closest to the user
  const supabase = await createClient()
  const { data } = await supabase.from('knowledge_entries').select('*')
  return Response.json(data)
}
```

**Benefits:**
- ✅ **Lower latency** - Runs near the user
- ✅ **Auto-scaling** - Spins up instances on demand
- ✅ **No cold starts** - Edge functions stay warm
- ✅ **Global distribution** - Deployed to 100+ regions

#### **2. Edge Middleware:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Runs at the EDGE before request reaches your app
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && protectedRoute) {
    return NextResponse.redirect('/auth/login')
  }
  
  return NextResponse.next()
}
```

**Key Point:** Authentication check happens at the edge = **faster redirects**

---

### **Edge vs Serverless vs Traditional:**

| Feature | Traditional Server | Serverless | Edge Functions |
|---------|-------------------|------------|----------------|
| **Location** | Fixed datacenter | Regional (AWS regions) | Global edge network |
| **Latency** | High (far from user) | Medium (~100ms) | Low (~20-50ms) |
| **Cold Start** | None (always on) | 100-500ms | Minimal (~10ms) |
| **Scaling** | Manual/Auto-scale | Auto-scale | Instant auto-scale |
| **Cost** | Fixed (even idle) | Pay per invoke | Pay per invoke |
| **Use Case** | Legacy apps | APIs, background jobs | User-facing APIs |

---

### **VaultBoard Edge Deployment:**

```
User Request
    ↓
Edge Middleware (Auth Check) ← Runs at CDN edge
    ↓
Edge API Route (if authenticated)
    ↓
Supabase Database (Postgres) ← Closest region
    ↓
Response via Edge CDN
```

**Why This Matters:**
- 🚀 Users in India get responses from Mumbai edge
- 🚀 Users in US get responses from US edge
- 🚀 Database queries still hit Supabase (Singapore/US)
- 🚀 Static assets (CSS, JS) cached at edge = instant load

---

### **Technical Implementation:**

#### **Edge Runtime vs Node.js Runtime:**

```typescript
// Edge Runtime (Default for API routes in Next.js 15)
export const runtime = 'edge' // Runs on Cloudflare/Vercel Edge

export async function GET() {
  // Limited Node.js APIs available
  // No fs, crypto (Node), child_process
  // But crypto Web API available
  return Response.json({ message: 'Edge!' })
}
```

```typescript
// Node.js Runtime (For complex operations)
export const runtime = 'nodejs'

export async function POST() {
  // Full Node.js APIs available
  // File system, crypto, native modules
  const crypto = require('crypto')
  return Response.json({ message: 'Node!' })
}
```

**VaultBoard Uses Edge Runtime Because:**
- ✅ Faster for auth checks
- ✅ Faster for database queries
- ✅ crypto-js works in edge runtime
- ✅ No file system needed (Supabase Storage)

---

## ⚛️ NEXT.JS 15 APP ROUTER ARCHITECTURE

### **App Router vs Pages Router:**

#### **Old Way (Pages Router):**
```typescript
// pages/dashboard.tsx
export default function Dashboard() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/entries').then(res => setData(res.json()))
  }, [])
  
  return <div>{data?.map(...)}</div>
}

// Everything client-side = slow initial load
```

#### **New Way (App Router - What VaultBoard Uses):**
```typescript
// app/dashboard/page.tsx
export default async function Dashboard() {
  const supabase = await createClient()
  const { data } = await supabase.from('knowledge_entries').select('*')
  
  return <div>{data.map(...)}</div>
}

// Server-rendered = instant load with data
```

---

### **Key Concepts:**

#### **1. File-Based Routing:**
```
app/
├── page.tsx              → /
├── dashboard/
│   └── page.tsx         → /dashboard
├── entries/
│   ├── page.tsx         → /entries
│   ├── new/page.tsx     → /entries/new
│   └── [id]/
│       ├── page.tsx     → /entries/123
│       └── edit/page.tsx → /entries/123/edit
└── api/
    └── upload/route.ts  → /api/upload
```

**No routing config needed!** File structure = routes.

---

#### **2. Layouts (Shared UI):**
```typescript
// app/layout.tsx - Wraps entire app
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header /> {/* Shows on all pages */}
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

**Benefits:**
- ✅ No component duplication
- ✅ Layout doesn't re-render on navigation
- ✅ Smooth transitions

---

#### **3. Loading & Error States:**
```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <Spinner />
}

// app/dashboard/error.tsx
export default function Error({ error, reset }) {
  return <ErrorBoundary error={error} retry={reset} />
}
```

**Automatic handling!** Next.js shows loading.tsx while page.tsx loads.

---

## ⚛️ REACT SERVER COMPONENTS VS CLIENT COMPONENTS

### **What's the Difference?**

#### **Server Components (Default in App Router):**
```typescript
// app/dashboard/page.tsx
// NO 'use client' directive = Server Component

export default async function Dashboard() {
  // This runs on the SERVER
  const supabase = await createClient()
  const { data } = await supabase.from('entries').select('*')
  
  // Can use async/await directly
  // Can access database directly
  // Can use environment variables safely
  
  return <div>{data.map(entry => <Card key={entry.id} {...entry} />)}</div>
}
```

**Characteristics:**
- ✅ Runs on server only
- ✅ Can be `async` functions
- ✅ Direct database access
- ✅ Zero JavaScript sent to client
- ✅ Can use Node.js APIs
- ❌ No useState, useEffect, event handlers
- ❌ No browser APIs

---

#### **Client Components:**
```typescript
// components/DeleteButton.tsx
'use client' // ← This makes it a client component

import { useState } from 'react'

export default function DeleteButton({ entryId }) {
  const [loading, setLoading] = useState(false)
  
  const handleDelete = async () => {
    setLoading(true)
    await fetch(`/api/entries/${entryId}`, { method: 'DELETE' })
    setLoading(false)
  }
  
  return (
    <button onClick={handleDelete}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

**Characteristics:**
- ✅ Runs in browser
- ✅ Can use hooks (useState, useEffect)
- ✅ Can handle user interactions
- ✅ Can use browser APIs
- ❌ Cannot be async
- ❌ Cannot access server APIs directly
- ❌ JavaScript sent to client

---

### **VaultBoard's Component Strategy:**

```typescript
// ✅ Server Component (Entry Detail Page)
export default async function EntryPage({ params }) {
  const { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('id', params.id)
    .single()
  
  return (
    <div>
      <h1>{entry.title}</h1>
      <p>{entry.content}</p>
      <DeleteButton entryId={entry.id} /> {/* ← Client Component */}
    </div>
  )
}

// ✅ Client Component (Interactive Button)
'use client'
function DeleteButton({ entryId }) {
  // Handles user interaction
}
```

**Why This Matters:**
- 📦 **Less JavaScript** - Only DeleteButton JS sent to client
- ⚡ **Faster Load** - Entry data pre-rendered on server
- 🔒 **More Secure** - Database queries never exposed to client

---

### **Data Flow:**

```
Server Component (Entry Page)
    ↓ [Fetches data from database]
    ↓ [Renders HTML with data]
    ↓
Client receives HTML + minimal JS
    ↓
Client Component (Delete Button) hydrates
    ↓ [User clicks delete]
    ↓
API request to /api/entries/[id]
    ↓ [Server deletes, returns response]
    ↓
Client refreshes or shows notification
```

---

## 🐘 SUPABASE ARCHITECTURE DEEP DIVE

### **What Is Supabase?**

Supabase = **PostgreSQL + Auth + Storage + Realtime** as a service

```
Supabase Stack:
┌─────────────────────────────────┐
│ API Layer (PostgREST)           │ ← Auto-generated REST API
├─────────────────────────────────┤
│ Auth (GoTrue)                   │ ← JWT-based authentication
├─────────────────────────────────┤
│ Storage (S3-compatible)         │ ← File storage with policies
├─────────────────────────────────┤
│ Realtime (Phoenix)              │ ← WebSocket subscriptions
├─────────────────────────────────┤
│ PostgreSQL 15                   │ ← Actual database
└─────────────────────────────────┘
```

---

### **How VaultBoard Uses Each Layer:**

#### **1. PostgreSQL Database:**

```sql
-- Tables with Row-Level Security
CREATE TABLE knowledge_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their entries
CREATE POLICY "Users view own entries"
ON knowledge_entries FOR SELECT
USING (auth.uid() = user_id);
```

**Key Features VaultBoard Uses:**
- ✅ **UUID Primary Keys** - Secure, non-sequential IDs
- ✅ **Foreign Keys** - Referential integrity
- ✅ **Timestamps** - Audit trails
- ✅ **JSONB Columns** - Could store metadata flexibly
- ✅ **Indexes** - Fast queries on user_id, category

---

#### **2. Supabase Auth:**

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepass',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepass',
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

**Under the Hood:**
1. Password hashed with **bcrypt** (10 rounds)
2. JWT token generated with user metadata
3. Token stored in HTTP-only cookie
4. Token refresh handled automatically
5. Token contains `user_id` for RLS policies

**Token Structure:**
```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "exp": 1735000000
}
```

---

#### **3. Supabase Storage:**

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${userId}/file.pdf`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('documents')
  .getPublicUrl(`${userId}/file.pdf`)
```

**Storage Architecture:**
```
Supabase Storage
    ↓
S3-Compatible Backend (AWS S3 or equivalent)
    ↓
Files stored with path: bucket/user_id/filename
    ↓
Access controlled by RLS policies on storage.objects table
```

**VaultBoard Storage Policy:**
```sql
-- Users upload to their own folder
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users view own files
CREATE POLICY "Users view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### **Supabase Client Architecture:**

```typescript
// Server-side (with cookies)
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(c => cookieStore.set(c)),
      }
    }
  )
}
```

**Why Cookies?**
- ✅ More secure than localStorage (HTTP-only)
- ✅ Automatically sent with requests
- ✅ Works with Server Components
- ✅ CSRF protection built-in

---

## 🔐 ENCRYPTION IMPLEMENTATION DETAILS

### **AES-256-CBC Explained:**

#### **What Each Part Means:**

**AES** = Advanced Encryption Standard  
**256** = Key size in bits (32 bytes = 32 characters)  
**CBC** = Cipher Block Chaining (encryption mode)

---

### **How It Works:**

```typescript
import CryptoJS from 'crypto-js'

// Encryption
export function encrypt(plainText: string): string {
  const key = process.env.ENCRYPTION_SECRET_KEY // 32 chars
  const encrypted = CryptoJS.AES.encrypt(plainText, key)
  return encrypted.toString() // Returns base64 ciphertext
}

// Decryption
export function decrypt(cipherText: string): string {
  const key = process.env.ENCRYPTION_SECRET_KEY
  const decrypted = CryptoJS.AES.decrypt(cipherText, key)
  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

---

### **Under the Hood:**

#### **Encryption Process:**

```
1. Plaintext: "AWS_KEY=AKIA1234567890"
   ↓
2. Convert to bytes: [65, 87, 83, 95, 75, 69, 89, ...]
   ↓
3. Derive key from passphrase using PBKDF2
   Key: [random 256-bit key]
   ↓
4. Generate random IV (Initialization Vector)
   IV: [random 128-bit vector]
   ↓
5. Encrypt with AES-256-CBC
   Each 16-byte block XORed with previous ciphertext
   ↓
6. Output: Base64(IV + Ciphertext)
   "U2FsdGVkX1+..." (random-looking string)
```

---

#### **Why CBC Mode?**

```
Block 1:  Plaintext XOR IV        → Encrypt → Ciphertext 1
Block 2:  Plaintext XOR Cipher 1  → Encrypt → Ciphertext 2
Block 3:  Plaintext XOR Cipher 2  → Encrypt → Ciphertext 3
```

**Benefits:**
- ✅ Same plaintext = different ciphertext (random IV)
- ✅ One bit change = completely different output
- ✅ Cannot decrypt without IV and key
- ✅ Industry standard (NIST approved)

---

### **VaultBoard's Encryption Flow:**

```typescript
// 1. User creates entry with encryption enabled
const entry = {
  title: "AWS Prod Creds",    // ← NOT encrypted (needed for search)
  content: "ACCESS_KEY=...",  // ← WILL BE encrypted
  is_encrypted: true
}

// 2. API route encrypts content
export async function POST(request: Request) {
  const { title, content, is_encrypted } = await request.json()
  
  const finalContent = is_encrypted 
    ? encrypt(content)  // ← Happens here
    : content
  
  await supabase.from('entries').insert({
    title,
    content: finalContent,  // ← Stored as ciphertext
    is_encrypted
  })
}

// 3. When reading, decrypt on server
export async function GET(request: Request) {
  const { data } = await supabase.from('entries').select('*')
  
  const decrypted = data.map(entry => ({
    ...entry,
    content: entry.is_encrypted 
      ? decrypt(entry.content)  // ← Decrypted here
      : entry.content
  }))
  
  return Response.json(decrypted)
}
```

---

### **Security Considerations:**

#### **What Happens in Different Attack Scenarios:**

**Scenario 1: Database Breach**
```
Attacker gets: "U2FsdGVkX1+vB3rT8y..." (ciphertext)
Attacker needs: Encryption key (stored in Vercel env vars)
Result: ❌ Cannot decrypt without key
```

**Scenario 2: SQL Injection**
```
Even if attacker runs: SELECT * FROM entries
They get: Encrypted content (useless without key)
Result: ❌ Still protected
```

**Scenario 3: Man-in-the-Middle**
```
HTTPS encrypts traffic in transit
Attacker intercepts: Encrypted HTTPS traffic
Result: ❌ Cannot read even with tools
```

**Scenario 3: Stolen Environment Variables**
```
Attacker gets: Encryption key
Attacker can: Decrypt all entries
Result: ⚠️ This is the weakest point
Mitigation: Use AWS Secrets Manager / HashiCorp Vault
```

---

### **Key Management Best Practices:**

```typescript
// ❌ BAD - Hardcoded
const key = "mysecretkey123456789012345678901"

// ❌ BAD - In code
const key = process.env.KEY || "defaultkey"

// ✅ GOOD - Environment variable
const key = process.env.ENCRYPTION_SECRET_KEY
if (!key) throw new Error('Missing encryption key')

// ✅ BETTER - Secrets manager
import { SecretsManager } from 'aws-sdk'
const key = await secretsManager.getSecretValue('encryption-key')

// ✅ BEST - Hardware Security Module (HSM)
const key = await hsm.getKey('vaultboard-encryption-key')
```

---

## 🔒 ROW-LEVEL SECURITY (RLS) INTERNALS

### **What Is RLS?**

Row-Level Security is **database-enforced access control**. Every query automatically includes the user's context.

---

### **How It Works:**

#### **Without RLS:**
```sql
-- User makes query
SELECT * FROM knowledge_entries WHERE category = 'credential';

-- Returns ALL entries (security hole!)
```

#### **With RLS:**
```sql
-- User makes same query
SELECT * FROM knowledge_entries WHERE category = 'credential';

-- PostgreSQL automatically adds:
-- AND user_id = auth.uid()

-- Returns ONLY user's entries (enforced by DB!)
```

---

### **VaultBoard's RLS Policies:**

#### **Policy 1: Members View Own Entries**
```sql
CREATE POLICY "members_view_own"
ON knowledge_entries
FOR SELECT
USING (auth.uid() = user_id);
```

**Translation:** 
- Applies to: `SELECT` queries
- Rule: Only if `auth.uid()` (current user) matches `user_id` (entry owner)

**Example:**
```typescript
// User A (id: abc-123) runs:
const { data } = await supabase.from('knowledge_entries').select('*')

// PostgreSQL executes:
SELECT * FROM knowledge_entries 
WHERE user_id = 'abc-123'  -- ← Automatically added!

// User A only sees their entries, even if they hack the query
```

---

#### **Policy 2: Managers View All**
```sql
CREATE POLICY "managers_view_all"
ON knowledge_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('manager', 'admin')
  )
);
```

**Translation:**
- Check if current user has 'manager' or 'admin' role
- If yes, allow seeing all entries

---

#### **Policy 3: Insert Own Entries**
```sql
CREATE POLICY "users_insert_own"
ON knowledge_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Translation:**
- When inserting, verify `user_id` matches `auth.uid()`
- Prevents users from inserting entries as someone else

---

### **How RLS Knows Current User:**

```typescript
// When you create Supabase client with JWT token:
const supabase = createServerClient(url, key, { cookies })

// Supabase extracts JWT from cookie
const token = cookies.get('sb-access-token')

// JWT contains:
{
  "sub": "abc-123",  // ← This becomes auth.uid()
  "role": "authenticated"
}

// Every query sent to Postgres includes:
SET LOCAL "request.jwt.claims" = '{"sub":"abc-123", ...}'

// RLS policies use auth.uid() which reads from this
```

---

### **Testing RLS Policies:**

```sql
-- Simulate being a specific user
SET request.jwt.claims = '{"sub":"user-123"}';

-- This query only returns user-123's entries
SELECT * FROM knowledge_entries;

-- Try to insert as different user (will fail)
INSERT INTO knowledge_entries (user_id, title)
VALUES ('different-user', 'Hacked!');
-- Error: RLS policy violation
```

---

### **Performance Impact:**

```sql
-- RLS adds WHERE clause to every query
-- Original: SELECT * FROM entries
-- With RLS: SELECT * FROM entries WHERE user_id = 'abc-123'

-- Solution: Index on user_id
CREATE INDEX idx_entries_user_id ON knowledge_entries(user_id);

-- Now queries are fast (uses index scan instead of full table scan)
```

**VaultBoard Indexes:**
```sql
CREATE INDEX idx_entries_user_id ON knowledge_entries(user_id);
CREATE INDEX idx_entries_category ON knowledge_entries(category);
CREATE INDEX idx_entries_created ON knowledge_entries(created_at DESC);
CREATE INDEX idx_access_logs_entry ON access_logs(entry_id);
```

---

## 🛣️ MIDDLEWARE & REQUEST PIPELINE

### **Request Flow in VaultBoard:**

```
1. User requests /dashboard
   ↓
2. Vercel Edge receives request
   ↓
3. Middleware runs (authentication check)
   ├─ Authenticated? → Continue to 4
   └─ Not authenticated? → Redirect to /auth/login
   ↓
4. Next.js Server Component renders
   ├─ Fetches data from Supabase
   ├─ Applies RLS policies
   └─ Returns HTML
   ↓
5. HTML sent to browser
   ↓
6. Client-side JavaScript hydrates interactive components
   ↓
7. User sees dashboard with data
```

---

### **Middleware Deep Dive:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Create response object (will be modified)
  let response = NextResponse.next()
  
  // 2. Create Supabase client with cookie handlers
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        // Set cookies on both request and response
        cookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      }
    }
  })
  
  // 3. Get current user (validates JWT token)
  const { data: { user } } = await supabase.auth.getUser()
  
  // 4. Check if route requires authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/entries')
  
  // 5. Redirect if needed
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // 6. Allow request to proceed
  return response
}

// 7. Configure which routes middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}
```

---

### **Why Middleware is Powerful:**

#### **1. Runs Before Page Loads:**
```
Without Middleware:
User → Page loads → JS checks auth → Redirect (flash of content)

With Middleware:
User → Middleware checks auth → Redirect (no flash, instant)
```

#### **2. Runs at the Edge:**
```
Traditional: User → Origin Server (US) → Check → Redirect (300ms)
Edge: User → Edge Server (Mumbai) → Check → Redirect (50ms)
```

#### **3. Protects All Routes:**
```typescript
// Instead of adding auth check to every page:
export default async function Dashboard() {
  const user = await getUser()
  if (!user) redirect('/login') // Repeated everywhere
  // ...
}

// Middleware handles it once:
// If user not authenticated, they never reach the page
```

---

### **Middleware Matcher Explained:**

```typescript
export const config = {
  matcher: [
    // Run on all routes except:
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)',
  ]
}
```

**What this regex means:**
- `(?!...)` = Negative lookahead (exclude these)
- `_next/static` = Don't run on static assets
- `_next/image` = Don't run on Next.js image optimization
- `favicon.ico` = Don't run on favicon
- `.*\\.(?:svg|png|jpg)$` = Don't run on image files

**Why?** Middleware on images would slow down every image load.

---

## 📊 DATABASE QUERY OPTIMIZATION

### **VaultBoard's Query Patterns:**

#### **1. Fetching User Entries:**

```typescript
// ❌ Bad - No filtering, loads everything
const { data } = await supabase
  .from('knowledge_entries')
  .select('*')

// ✅ Good - RLS filters automatically
const { data } = await supabase
  .from('knowledge_entries')
  .select('*')
// Returns only user's entries due to RLS

// ✅ Better - Only select needed columns
const { data } = await supabase
  .from('knowledge_entries')
  .select('id, title, category, created_at')
  .order('created_at', { ascending: false })
  .limit(20)
```

---

#### **2. Joins for User Roles:**

```typescript
// ❌ Bad - Two queries (N+1 problem)
const { data: entries } = await supabase.from('entries').select('*')
for (const entry of entries) {
  const { data: user } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', entry.user_id)
    .single()
}

// ✅ Good - Single query with join
const { data } = await supabase
  .from('knowledge_entries')
  .select(`
    *,
    user_roles!inner(role, full_name, email)
  `)
```

**Explanation:**
- `user_roles!inner` = Inner join with user_roles table
- `(role, full_name, email)` = Columns to select from joined table
- Single query = one database round-trip

---

#### **3. Filtering by Category:**

```typescript
// With index on category column
const { data } = await supabase
  .from('knowledge_entries')
  .select('*')
  .eq('category', 'credential')
  .eq('user_id', userId)

// PostgreSQL uses index:
// Index Scan on idx_entries_user_category
```

---

### **Query Performance Monitoring:**

```sql
-- Enable query timing in Supabase dashboard
EXPLAIN ANALYZE
SELECT * FROM knowledge_entries
WHERE user_id = 'abc-123' AND category = 'credential';

-- Output:
-- Index Scan using idx_entries_user_id (cost=0.29..8.31 rows=1 width=574)
-- Planning Time: 0.123 ms
-- Execution Time: 0.456 ms
```

**Good Query Metrics:**
- ✅ Uses index (not Seq Scan)
- ✅ Execution time < 10ms
- ✅ Returns only needed rows

---

## 🚀 SCALABILITY & PERFORMANCE

### **Current Architecture Scale:**

```
Free Tier Limits:
├─ Database: 500MB (~ 500,000 entries)
├─ Storage: 1GB (~ 10,000 documents)
├─ API Requests: Unlimited (but rate limited)
└─ Bandwidth: 5GB/month

Handles:
├─ Users: ~100-500 concurrent
├─ Entries: ~500,000 total
└─ Files: ~10,000 documents
```

---

### **Scaling Strategy:**

#### **Stage 1: 0-1,000 Users (Current)**
```
Vercel Hobby + Supabase Free
Cost: $0/month
```

#### **Stage 2: 1,000-10,000 Users**
```
Vercel Pro ($20) + Supabase Pro ($25)
Database: 8GB
Storage: 100GB
Cost: $45/month
```

#### **Stage 3: 10,000-100,000 Users**
```
Vercel Pro + Supabase Team ($599)
Database: 16GB
Storage: 250GB
Add: Redis caching layer
Cost: ~$650/month
```

#### **Stage 4: 100,000+ Users**
```
Self-hosted infrastructure:
- AWS EC2/EKS for app servers
- RDS PostgreSQL with read replicas
- S3 for file storage
- CloudFront CDN
- Redis Cluster for caching
Cost: $2,000-5,000/month
```

---

### **Performance Optimizations:**

#### **1. Database Indexes:**
```sql
-- Current indexes
CREATE INDEX idx_entries_user_id ON knowledge_entries(user_id);
CREATE INDEX idx_entries_category ON knowledge_entries(category);
CREATE INDEX idx_entries_expiry ON knowledge_entries(expiry_date)
  WHERE expiry_date IS NOT NULL;
```

#### **2. Query Caching (Future):**
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getEntries(userId: string) {
  // Check cache first
  const cached = await redis.get(`entries:${userId}`)
  if (cached) return JSON.parse(cached)
  
  // Query database
  const { data } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
  
  // Cache for 5 minutes
  await redis.setex(`entries:${userId}`, 300, JSON.stringify(data))
  
  return data
}
```

#### **3. CDN Caching:**
```typescript
// Static assets cached at edge
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-url.com'],
    minimumCacheTTL: 60,
  }
}
```

#### **4. Connection Pooling:**
```typescript
// Supabase handles this automatically
// But for self-hosted:
import { Pool } from 'pg'

const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

---

## 📘 ADVANCED TYPESCRIPT PATTERNS

### **VaultBoard's TypeScript Usage:**

#### **1. Strict Type Safety:**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### **2. Database Types:**
```typescript
// Manually defined (or generate from Supabase)
export interface KnowledgeEntry {
  id: string
  user_id: string
  title: string
  content: string
  category: 'credential' | 'document' | 'best_practice' | 'policy'
  is_encrypted: boolean
  expiry_date: string | null
  file_url: string | null
  file_name: string | null
  created_at: string
  updated_at: string
}

// Usage
const entry: KnowledgeEntry = await fetchEntry(id)
// TypeScript knows all properties and types!
```

#### **3. API Response Types:**
```typescript
// Generic API response wrapper
interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code: string
  }
}

// Usage in API route
export async function GET(): Promise<ApiResponse<KnowledgeEntry[]>> {
  const { data, error } = await supabase.from('entries').select('*')
  
  if (error) {
    return { error: { message: error.message, code: 'DB_ERROR' } }
  }
  
  return { data }
}
```

#### **4. Form Validation Types:**
```typescript
// Zod schema for runtime validation
import { z } from 'zod'

const EntrySchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  content: z.string().min(1, 'Content required'),
  category: z.enum(['credential', 'document', 'best_practice', 'policy']),
  is_encrypted: z.boolean().default(false),
  expiry_date: z.string().datetime().optional(),
})

// TypeScript type inferred from schema
type EntryInput = z.infer<typeof EntrySchema>

// Usage
const validateEntry = (data: unknown): EntryInput => {
  return EntrySchema.parse(data) // Throws if invalid
}
```

---

## 🎯 TECHNICAL INTERVIEW QUESTIONS & ANSWERS

### **Q: Explain the difference between edge functions and serverless functions.**

**Answer:**
> *"Edge functions run on CDN edge nodes close to users (50+ locations), while traditional serverless runs in specific AWS regions (10-15 locations). Edge functions have lower latency (~20ms vs ~100ms) because they're geographically distributed. VaultBoard uses Vercel Edge Functions for middleware and API routes, which means auth checks happen at the edge before requests hit our origin server. This reduces latency and improves security."*

---

### **Q: How does Row-Level Security work at the database level?**

**Answer:**
> *"RLS is PostgreSQL's built-in access control. When enabled, every query automatically includes the user's context via the JWT token. Supabase passes `auth.uid()` to Postgres, which enforces policies at the query level. So when a user queries `SELECT * FROM entries`, Postgres rewrites it to `SELECT * FROM entries WHERE user_id = auth.uid()`. Even if someone hacks the API and modifies the query, the database enforces the restriction. It's defense-in-depth security."*

---

### **Q: Why did you choose AES-256-CBC over other encryption algorithms?**

**Answer:**
> *"AES-256 is the industry standard - used by banks, militaries, and governments. CBC mode means each block is XORed with the previous ciphertext, so identical plaintexts produce different ciphertexts due to random IVs. It's NIST-approved and battle-tested. Alternatives like ChaCha20 are great for mobile, but AES-256 has hardware acceleration on most CPUs, making it fast and secure. For VaultBoard, I prioritized compatibility and proven security over niche alternatives."*

---

### **Q: How would you optimize database queries for 100,000 concurrent users?**

**Answer:**
> *"Five strategies: First, add database read replicas to distribute SELECT queries. Second, implement Redis caching for frequently accessed data with 5-minute TTL. Third, use database connection pooling (PgBouncer) to handle concurrent connections efficiently. Fourth, add covering indexes on commonly queried columns. Fifth, implement pagination to limit result sets. For VaultBoard specifically, I'd cache user role checks in Redis since they rarely change, and use read replicas for dashboard queries while keeping writes on the primary database."*

---

### **Q: Explain how Next.js 15 Server Components improve performance compared to traditional React.**

**Answer:**
> *"Server Components render on the server and send HTML, not JavaScript. This means zero JavaScript for non-interactive components. In VaultBoard's dashboard, the entry list is a Server Component - it fetches data, renders HTML, and sends it to the client. Only interactive components like DeleteButton need JavaScript. This reduces bundle size by ~60% and improves Time to Interactive. Traditional React sends all components as JavaScript, which the browser must parse, compile, and execute before rendering anything."*

---

### **Q: How do you handle encryption key rotation without data loss?**

**Answer:**
> *"Great question! For v2, I'd implement dual-key decryption: First, add a `key_version` column to entries. When rotating keys, decrypt existing entries with the old key, re-encrypt with the new key, and update the version. For zero-downtime, support both keys temporarily - try decrypting with the new key, fallback to old key if it fails. Gradually re-encrypt all entries in a background job. Once complete, remove the old key. This is how AWS KMS and other enterprise systems handle key rotation."*

---

## 🎓 ADDITIONAL CONCEPTS TO MASTER

### **1. JWT (JSON Web Tokens):**
```
Structure: header.payload.signature
Example: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature

Header:   {"alg": "HS256", "typ": "JWT"}
Payload:  {"sub": "user-123", "role": "admin"}
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

**Why VaultBoard Uses JWT:**
- ✅ Stateless (no server-side sessions)
- ✅ Contains user_id for RLS
- ✅ Signed by Supabase (tamper-proof)
- ✅ Can be validated by any service

---

### **2. CORS (Cross-Origin Resource Sharing):**
```typescript
// Next.js API route
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  
  // Allow requests from your domain
  if (origin === 'https://vaultboard.vercel.app') {
    return new Response(JSON.stringify(data), {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}
```

---

### **3. Rate Limiting:**
```typescript
// Using Upstash Rate Limit (future enhancement)
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  // Continue...
}
```

---

## 🏆 YOU'RE NOW A TECHNICAL EXPERT!

You can now confidently discuss:
- ✅ Edge computing and serverless architecture
- ✅ Next.js 15 App Router internals
- ✅ React Server vs Client Components
- ✅ Supabase multi-layer architecture
- ✅ AES-256-CBC encryption details
- ✅ Row-Level Security implementation
- ✅ Middleware request pipeline
- ✅ Database query optimization
- ✅ Scalability strategies
- ✅ Advanced TypeScript patterns

**Go crush those technical interviews! 💪🚀**
