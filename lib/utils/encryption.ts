/**
 * Encryption Utility Functions
 * 
 * Provides AES-256 encryption/decryption for sensitive data
 * Uses environment variable for encryption key
 */

import CryptoJS from 'crypto-js'

/**
 * Get encryption key from environment variable
 * Falls back to a default key if not set (NOT RECOMMENDED for production)
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_SECRET_KEY
  
  if (!key) {
    // Only use default in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_SECRET_KEY must be set in production environment')
    }
    
    // Development fallback key (32 characters for AES-256)
    return 'dev-fallback-key-32chars-long!'
  }
  
  return key
}

/**
 * Encrypt sensitive text using AES-256
 * 
 * @param plainText - The text to encrypt
 * @returns Encrypted text (base64 encoded)
 */
export function encryptText(plainText: string): string {
  if (!plainText) return ''
  
  try {
    const key = getEncryptionKey()
    const encrypted = CryptoJS.AES.encrypt(plainText, key).toString()
    return encrypted
  } catch (error) {
    throw new Error('Failed to encrypt text')
  }
}

/**
 * Decrypt encrypted text
 * 
 * @param encryptedText - The encrypted text (base64 encoded)
 * @returns Decrypted plain text
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return ''
  
  try {
    const key = getEncryptionKey()
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key)
    const plainText = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!plainText) {
      throw new Error('Decryption failed - invalid key or corrupted data')
    }
    
    return plainText
  } catch (error) {
    throw new Error('Failed to decrypt text')
  }
}

/**
 * Check if a string appears to be encrypted
 * 
 * @param text - Text to check
 * @returns true if text looks encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false
  
  // AES encrypted strings are base64 and typically contain '=' padding
  // and have a specific pattern
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/
  return base64Pattern.test(text) && text.length > 40
}

/**
 * Encrypt only if marked as sensitive
 * 
 * @param text - Text to conditionally encrypt
 * @param isSensitive - Whether the text should be encrypted
 * @returns Encrypted text if sensitive, original text otherwise
 */
export function conditionalEncrypt(text: string, isSensitive: boolean): string {
  if (!isSensitive) return text
  return encryptText(text)
}

/**
 * Decrypt only if needed
 * 
 * @param text - Text to conditionally decrypt
 * @param isSensitive - Whether the text is encrypted
 * @returns Decrypted text if sensitive, original text otherwise
 */
export function conditionalDecrypt(text: string, isSensitive: boolean): string {
  if (!isSensitive) return text
  
  // Check if actually encrypted before attempting decryption
  if (!isEncrypted(text)) return text
  
  try {
    return decryptText(text)
  } catch {
    // If decryption fails, return original (might be legacy unencrypted data)
    return text
  }
}
