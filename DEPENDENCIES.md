# 📦 VaultBoard Dependencies

Complete list of all dependencies, their versions, and purposes.

## System Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Operating System**: Windows, macOS, or Linux

## Installation

```bash
npm install
```

---

## Production Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.5.7 | React framework with App Router, server components, and routing |
| `react` | ^19.0.0 | JavaScript library for building user interfaces |
| `react-dom` | ^19.0.0 | React package for working with the DOM |

### Backend & Database
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.87.1 | Supabase JavaScript client for database, auth, and storage |
| `@supabase/ssr` | ^0.5.2 | Supabase server-side rendering support for Next.js |

### Security & Encryption
| Package | Version | Purpose |
|---------|---------|---------|
| `crypto-js` | ^4.2.0 | AES-256 encryption library for sensitive data |

### Styling & Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwind-merge` | ^3.4.0 | Utility for merging Tailwind CSS classes |
| `clsx` | ^2.1.1 | Utility for constructing className strings conditionally |

---

## Development Dependencies

### TypeScript & Type Definitions
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.0.0 | TypeScript compiler for type-safe JavaScript |
| `@types/node` | ^20.0.0 | Type definitions for Node.js |
| `@types/react` | ^18.2.0 | Type definitions for React |
| `@types/react-dom` | ^18.2.0 | Type definitions for React DOM |
| `@types/crypto-js` | ^4.2.2 | Type definitions for crypto-js |

### CSS Processing
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `postcss` | ^8.4.0 | CSS transformation tool |
| `autoprefixer` | ^10.4.0 | PostCSS plugin to add vendor prefixes |

---

## Dependency Details

### 🔐 Authentication & Database
**@supabase/supabase-js** and **@supabase/ssr**
- PostgreSQL database with Row-Level Security
- Built-in authentication (email/password)
- File storage with access policies
- Real-time subscriptions
- Server-side rendering support

### 🔒 Encryption
**crypto-js**
- AES-256-CBC encryption algorithm
- Encrypts sensitive content before database storage
- Decrypts on-demand for authorized users
- Environment-based encryption keys

### 🎨 Styling
**tailwindcss**, **postcss**, **autoprefixer**
- Utility-first CSS framework
- JIT (Just-In-Time) compilation
- Responsive design utilities
- Custom component classes

### 🛠️ Utilities
**tailwind-merge**
- Intelligently merges Tailwind classes
- Removes duplicate utilities
- Handles conditional classes

**clsx**
- Constructs className strings
- Handles conditional rendering
- Lightweight and fast

---

## External Services

### Supabase (Required)
- **Website**: https://supabase.com
- **Free Tier**: Yes (25,000 MAU)
- **Services Used**:
  - PostgreSQL Database
  - Authentication
  - Storage (for file uploads)
  - Row-Level Security

### Vercel (Optional - for deployment)
- **Website**: https://vercel.com
- **Free Tier**: Yes
- **Features Used**:
  - Next.js hosting
  - Cron jobs (credential expiration checks)
  - Environment variables
  - Automatic deployments

---

## Security Considerations

### Dependency Security
All dependencies are regularly updated to patch security vulnerabilities.

**Check for updates:**
```bash
npm outdated
```

**Update dependencies:**
```bash
npm update
```

**Audit dependencies:**
```bash
npm audit
npm audit fix
```

### Critical Security Packages
- `crypto-js`: Used for AES-256 encryption
- `@supabase/supabase-js`: Handles authentication and database security
- All Supabase operations use Row-Level Security (RLS)

---

## Environment Variables Required

These are **NOT** npm packages but required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENCRYPTION_SECRET_KEY=your_32_character_key
CRON_SECRET=your_cron_secret
```

See `.env.example` for details.

---

## Package Lock File

The `package-lock.json` file ensures consistent installations across environments.

**Important:**
- ✅ Commit `package-lock.json` to version control
- ✅ Use `npm ci` for production builds
- ✅ Use `npm install` for development

---

## Troubleshooting

### Issue: Installation fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Type errors after install
```bash
# Rebuild TypeScript cache
npm run type-check
```

### Issue: Version conflicts
```bash
# Check for conflicts
npm ls

# Force resolution (use carefully)
npm install --legacy-peer-deps
```

---

## Alternative Package Managers

### Using Yarn
```bash
yarn install
yarn dev
yarn build
```

### Using pnpm
```bash
pnpm install
pnpm dev
pnpm build
```

---

## Python Equivalent (for reference)

If this were a Python project, the equivalent would be:

**requirements.txt:**
```
nextjs==15.5.7
supabase-py==2.87.1
cryptography==41.0.0
```

**environment.yml (Conda):**
```yaml
name: vaultboard
channels:
  - defaults
dependencies:
  - nodejs=18
  - npm=9
```

---

## Docker Support (Optional)

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Version History

### v2.0.0 (Current)
- Next.js 15.5.7
- React 19
- Supabase 2.87.1
- TypeScript 5
- Full feature set with encryption and file uploads

### v1.0.0 (Initial)
- Next.js 15.0.0
- React 18
- Basic authentication only

---

## License

All dependencies are open source with permissive licenses (MIT, Apache 2.0, BSD).

**Check licenses:**
```bash
npm list --depth=0
```

---

## Support

For dependency-related issues:
1. Check package documentation
2. Search GitHub issues
3. Consult npm registry page
4. Ask in community forums

**Useful links:**
- npm: https://www.npmjs.com
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TailwindCSS: https://tailwindcss.com/docs
