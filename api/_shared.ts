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

export function encrypt(plaintext: string, keyPair: { masterKey: Buffer; iv: Buffer }) {
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

export interface KeyRecord {
  keyId: string;
  keyHash: string;
  createdAt: string;
  expiresAt: string | null;
  usageCount: number;
  status: string;
}

export interface KeyRegistry {
  keys: KeyRecord[];
  metadata: {
    totalKeys: number;
    lastRotated: string;
    totalResets: number;
  };
}

export async function readKeyRegistry(): Promise<KeyRegistry> {
  try {
    const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
    }
    throw error;
  }
}

export async function writeKeyRegistry(registry: KeyRegistry) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
  await fs.writeFile(filePath, JSON.stringify(registry, null, 2), 'utf-8');
}

const LATEST_FILE = path.join(DATA_DIR, 'latest.json');

export interface LatestData {
  version: string;
  url: string;
  size: number;
  changelog: string;
  sha256: string;
  releaseDate?: string;
}

export async function readLatestData(): Promise<LatestData | null> {
  try {
    const content = await fs.readFile(LATEST_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function writeLatestData(data: Omit<LatestData, 'releaseDate'>): Promise<LatestData> {
  await ensureDataDir();
  const fullData: LatestData = { ...data, releaseDate: new Date().toISOString() };
  await fs.writeFile(LATEST_FILE, JSON.stringify(fullData, null, 2), 'utf-8');
  return fullData;
}

export async function hashKey(masterKeyBase64: string): Promise<string> {
  return bcrypt.hash(masterKeyBase64, 12);
}