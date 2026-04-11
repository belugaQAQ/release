import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Check-Only'],
}));
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  await fs.mkdir(path.join(DATA_DIR, 'backups'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'keys'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'logs'), { recursive: true });
}

function generateKeyPair() {
  return {
    masterKey: crypto.randomBytes(32),
    iv: crypto.randomBytes(16),
  };
}

function encrypt(plaintext, keyPair) {
  const cipher = crypto.createCipheriv('aes-256-gcm', keyPair.masterKey, keyPair.iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  return { encryptedSeed: encrypted, authTag, iv: keyPair.iv.toString('base64') };
}

function generateKeyId() {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(6).toString('hex');
  return `key_${timestamp}_${random}`;
}

function generateSeed() {
  return crypto.randomBytes(32).toString('hex');
}

async function readKeyRegistry() {
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

async function writeKeyRegistry(registry) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
  await fs.writeFile(filePath, JSON.stringify(registry, null, 2), 'utf-8');
}

app.post('/api/generate-key', async (req, res) => {
  try {
    const keyPair = generateKeyPair();
    const keyId = generateKeyId();
    const seed = generateSeed();
    const encryptedData = encrypt(seed, keyPair);

    const keyFile = {
      meta: {
        version: '1.0',
        keyId,
        createdAt: new Date().toISOString(),
        purpose: 'StickyHomeworks Update Manager Authentication',
      },
      crypto: {
        algorithm: 'AES-256-GCM',
        iv: encryptedData.iv,
        encryptedSeed: encryptedData.encryptedSeed,
        authTag: encryptedData.authTag,
      },
      security: {
        expiresAt: null,
        maxUsageCount: -1,
        currentUsageCount: 0,
      },
    };

    const keyHash = await bcrypt.hash(keyPair.masterKey.toString('base64'), 12);
    
    const registry = await readKeyRegistry();
    registry.keys.push({
      keyId,
      keyHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usageCount: 0,
      status: 'active',
    });
    registry.metadata.totalKeys += 1;
    
    await writeKeyRegistry(registry);

    return res.status(200).json({
      success: true,
      message: '密钥生成成功',
      data: keyFile,
    });

  } catch (error) {
    console.error('密钥生成失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '密钥生成过程中发生错误',
    });
  }
});

app.get('/api/verify-key', async (req, res) => {
  try {
    const registry = await readKeyRegistry();
    const hasExistingKey = registry.keys.length > 0;
    
    return res.status(200).json({ hasExistingKey });
  } catch (error) {
    console.error('检查密钥失败:', error);
    return res.status(500).json({ hasExistingKey: false });
  }
});

app.post('/api/verify-key', async (req, res) => {
  try {
    const { keyFile } = req.body;

    if (!keyFile || typeof keyFile !== 'object') {
      return res.status(400).json({ success: false, error: '请提供有效的密钥文件' });
    }

    const { meta } = keyFile;

    if (!meta?.keyId) {
      return res.status(400).json({ success: false, error: '密钥文件格式无效或已损坏' });
    }

    const registry = await readKeyRegistry();
    const keyRecord = registry.keys.find((k) => k.keyId === meta.keyId);

    if (!keyRecord) {
      return res.status(401).json({ success: false, error: '密钥不存在或已被撤销' });
    }

    if (keyRecord.status !== 'active') {
      return res.status(401).json({ success: false, error: '密钥已被禁用或已过期' });
    }

    keyRecord.usageCount += 1;
    await writeKeyRegistry(registry);

    return res.status(200).json({ success: true, data: { valid: true, keyId: meta.keyId, message: '密钥验证成功' } });

  } catch (error) {
    console.error('密钥验证失败:', error);
    return res.status(500).json({ success: false, error: '验证过程发生错误' });
  }
});

const LATEST_FILE = path.join(DATA_DIR, 'latest.json');

async function readLatestData() {
  try {
    const content = await fs.readFile(LATEST_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeLatestData(data) {
  await ensureDataDir();
  const fullData = { ...data, releaseDate: new Date().toISOString() };
  await fs.writeFile(LATEST_FILE, JSON.stringify(fullData, null, 2), 'utf-8');
  return fullData;
}

app.get('/api/latest.json', async (req, res) => {
  try {
    const data = await readLatestData();
    if (!data) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: '暂无更新数据' });
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.status(200).json(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '读取数据过程中发生错误' });
  }
});

app.post('/api/update', async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { data } = req.body;

    console.log('=== Update Request Debug ===');
    console.log('Headers:', { authorization: !!authorization });
    console.log('Body:', req.body);
    console.log('Data:', data);
    console.log('Data Type:', typeof data);
    console.log('============================');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请提供有效的更新数据' });
    }

    const result = await writeLatestData({
      version: data.version,
      url: data.url,
      size: Number(data.size),
      changelog: data.changelog,
      sha256: data.sha256,
    });

    return res.status(200).json({ success: true, message: '数据更新成功', data: result });

  } catch (error) {
    console.error('数据更新失败:', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '数据更新过程中发生错误' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API server running on http://127.0.0.1:${PORT}`);
});