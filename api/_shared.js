import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { kv } from '@vercel/kv';

const KEY_REGISTRY_KEY = 'stickyhomeworks_key_registry';
const LATEST_DATA_KEY = 'stickyhomeworks_latest_data';

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
    const data = await kv.get(KEY_REGISTRY_KEY);
    if (data) {
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
  } catch (error) {
    console.error('读取密钥注册表失败:', error);
    return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
  }
}

export async function writeKeyRegistry(registry) {
  try {
    await kv.set(KEY_REGISTRY_KEY, JSON.stringify(registry));
  } catch (error) {
    console.error('写入密钥注册表失败:', error);
    throw error;
  }
}

export async function readLatestData() {
  try {
    const data = await kv.get(LATEST_DATA_KEY);
    if (data) {
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (error) {
    console.error('读取最新数据失败:', error);
    return null;
  }
}

export async function writeLatestData(data) {
  try {
    const fullData = { ...data, releaseDate: new Date().toISOString() };
    await kv.set(LATEST_DATA_KEY, JSON.stringify(fullData));
    return fullData;
  } catch (error) {
    console.error('写入最新数据失败:', error);
    throw error;
  }
}

export async function hashKey(masterKeyBase64) {
  return bcrypt.hash(masterKeyBase64, 12);
}