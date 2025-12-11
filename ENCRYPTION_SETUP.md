# Encryption Setup Guide

## Overview
VaultBoard now encrypts all sensitive content before storing it in the database using AES-256 encryption. This protects your data even if the database is compromised.

## Setup Steps

### 1. Generate Encryption Key

Generate a strong 32+ character random encryption key:

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Or use an online tool:**
- https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

### 2. Add to Environment Variables

Add the generated key to your `.env.local` file:

```env
ENCRYPTION_SECRET_KEY=your-generated-32-character-key-here
```

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### Encryption
- When creating/updating entries marked as `is_sensitive: true`
- Content is encrypted using AES-256 before saving to database
- Only the encrypted ciphertext is stored

### Decryption
- When fetching entries, sensitive content is automatically decrypted
- Decryption only happens for authorized users (based on role)
- Failed decryption (wrong key) returns original text (for legacy data)

### Security Features
1. **End-to-End Encryption**: Data encrypted before leaving the application
2. **Key Security**: Encryption key stored only in environment variables (never in code/database)
3. **Backward Compatible**: Works with existing unencrypted data
4. **Selective Encryption**: Only sensitive entries are encrypted

## What Gets Encrypted

- ✅ Entry content (when `is_sensitive = true`)
- ❌ Entry titles (always visible for search)
- ❌ Tags (needed for filtering)
- ❌ Metadata (categories, classifications, dates)

## Important Security Notes

⚠️ **CRITICAL**:
1. **Never commit** `.env.local` to version control
2. **Backup your encryption key** securely (losing it means losing all encrypted data)
3. **Use different keys** for development and production
4. **Rotate keys periodically** in production

## Production Deployment

For production environments:

1. Set `ENCRYPTION_SECRET_KEY` as an environment variable in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables  
   - **Railway**: Variables tab
   - **AWS/Heroku**: Platform-specific configuration

2. Ensure the key is at least 32 characters long

3. The application will throw an error if the key is missing in production

## Migrating Existing Data

If you have existing unencrypted sensitive entries:

1. The system will recognize they're not encrypted (backward compatible)
2. On next update, they will be automatically encrypted
3. Or run a migration script to encrypt all existing sensitive entries

## Testing Encryption

1. Create an entry and mark it as "Sensitive"
2. Check the database - the content should be encrypted (looks like gibberish)
3. View the entry in the app - it should be decrypted and readable
4. Export the entry - it should export the decrypted content

## Troubleshooting

**Error: "ENCRYPTION_SECRET_KEY must be set"**
- Add the key to your `.env.local` file
- Restart the development server

**Decryption fails / showing encrypted text**
- Check if the encryption key is correct
- Verify the key hasn't changed
- Check for typos in the `.env.local` file

**Data still visible in database**
- Check if `is_sensitive` flag is set to `true`
- Verify the encryption code is running (check console logs)
