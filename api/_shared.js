import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

export const DATA_DIR = path.join(process.cwd(), 'data');

export async function ensureDataDir() {
  await fs.mkdir(path.join(DATA_DIR, 'backups'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'keys'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'logs'), { recursive: true });
}

export function generateKeyPair() {
  return {
    masterKey: crypto.randomBytes(32),
    iv: crypto.randomBytes(16),
  };
}

export function encrypt(plaintext, keyPair) {
  const cipher = crypto.createCipheriv('aes-256-gcm', keyPair.masterKey, keyPair.iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  return { encryptedSeed: encrypted, authTag, iv: keyPair.iv.toString('base64') };
}

export function generateKeyId() {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(6).toString('hex');
  return `key_${timestamp}_${random}`;
}

export function generateSeed() {
  return crypto.randomBytes(32).toString('hex');
}

export async function readKeyRegistry() {
  try {
    const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
    }
    throw error;
  }
}

export async function writeKeyRegistry(registry) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
  await fs.writeFile(filePath, JSON.stringify(registry, null, 2), 'utf-8');
}

const LATEST_FILE = path.join(DATA_DIR, 'latest.json');

export async function readLatestData() {
  try {
    const content = await fs.readFile(LATEST_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function writeLatestData(data) {
  await ensureDataDir();
  const fullData = { ...data, releaseDate: new Date().toISOString() };
  await fs.writeFile(LATEST_FILE, JSON.stringify(fullData, null, 2), 'utf-8');
  return fullData;
}

export async function hashKey(masterKeyBase64) {
  return bcrypt.hash(masterKeyBase64, 12);
}