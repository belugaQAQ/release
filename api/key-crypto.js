import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateKeyPair() {
  return { masterKey: crypto.randomBytes(32), iv: crypto.randomBytes(16) };
}

export function encrypt(plaintext, keyPair) {
  const cipher = crypto.createCipheriv('aes-256-gcm', keyPair.masterKey, keyPair.iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return { encryptedSeed: encrypted, authTag: cipher.getAuthTag().toString('base64'), iv: keyPair.iv.toString('base64') };
}

export function generateKeyId() {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `key_${timestamp}_${crypto.randomBytes(6).toString('hex')}`;
}

export function generateSeed() { return crypto.randomBytes(32).toString('hex'); }
export function hashKey(masterKeyBase64) { return bcrypt.hash(masterKeyBase64, 12); }
