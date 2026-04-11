import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Client } from '@neondatabase/serverless';

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

async function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

async function initTables() {
  const client = await getClient();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS key_registry (
        id SERIAL PRIMARY KEY,
        key_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS latest_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    await client.end();
  }
}

export async function readKeyRegistry() {
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT key_data FROM key_registry ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        return result.rows[0].key_data;
      }
      return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取密钥注册表失败:', error);
    return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
  }
}

export async function writeKeyRegistry(registry) {
  try {
    await initTables();
    const client = await getClient();
    try {
      await client.query('INSERT INTO key_registry (key_data) VALUES ($1)', [registry]);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入密钥注册表失败:', error);
    throw error;
  }
}

export async function readLatestData() {
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT data FROM latest_data ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        return result.rows[0].data;
      }
      return null;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取最新数据失败:', error);
    return null;
  }
}

export async function writeLatestData(data) {
  try {
    await initTables();
    const fullData = { ...data, releaseDate: new Date().toISOString() };
    const client = await getClient();
    try {
      await client.query('INSERT INTO latest_data (data) VALUES ($1)', [fullData]);
      return fullData;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入最新数据失败:', error);
    throw error;
  }
}

export async function hashKey(masterKeyBase64) {
  return bcrypt.hash(masterKeyBase64, 12);
}