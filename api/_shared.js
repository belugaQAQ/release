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
    console.error('DATABASE_URL 环境变量未设置');
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  console.log('尝试连接数据库:', process.env.DATABASE_URL ? '已配置' : '未配置');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('数据库连接成功');
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS changelog_data (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS beta_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS beta_changelog_data (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS echoes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        user VARCHAR(255) NOT NULL,
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('表初始化成功');
  } finally {
    await client.end();
  }
}

export async function readKeyRegistry() {
  console.log('读取密钥注册表...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT key_data FROM key_registry ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        console.log('找到密钥注册表数据');
        return result.rows[0].key_data;
      }
      console.log('密钥注册表为空，返回默认值');
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
  console.log('写入密钥注册表...');
  try {
    await initTables();
    const client = await getClient();
    try {
      await client.query('INSERT INTO key_registry (key_data) VALUES ($1)', [JSON.stringify(registry)]);
      console.log('密钥注册表写入成功');
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入密钥注册表失败:', error);
    throw error;
  }
}

export async function readLatestData() {
  console.log('读取最新数据...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT data FROM latest_data ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        console.log('找到最新数据');
        return result.rows[0].data;
      }
      console.log('最新数据为空');
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
  console.log('写入最新数据...');
  try {
    await initTables();
    const fullData = { ...data, releaseDate: new Date().toISOString() };
    const client = await getClient();
    try {
      await client.query('INSERT INTO latest_data (data) VALUES ($1)', [JSON.stringify(fullData)]);
      console.log('最新数据写入成功');
      return fullData;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入最新数据失败:', error);
    throw error;
  }
}

export async function readChangelog() {
  console.log('读取更新日志...');
  try {
    await initTables();
    const client = await getClient();
    try {
      const result = await client.query('SELECT content FROM changelog_data ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        console.log('找到更新日志');
        return result.rows[0].content;
      }
      console.log('更新日志为空');
      return null;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取更新日志失败:', error);
    return null;
  }
}

export async function writeChangelog(content) {
  console.log('写入更新日志...');
  try {
    await initTables();
    const client = await getClient();
    try {
      await client.query('INSERT INTO changelog_data (content) VALUES ($1)', [content]);
      console.log('更新日志写入成功');
      return content;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入更新日志失败:', error);
    throw error;
  }
}

export async function hashKey(masterKeyBase64) {
  return bcrypt.hash(masterKeyBase64, 12);
}

export async function readBetaData() {
  console.log('读取测试版本数据...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT data FROM beta_data ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        console.log('找到测试版本数据');
        return result.rows[0].data;
      }
      console.log('测试版本数据为空');
      return null;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取测试版本数据失败:', error);
    return null;
  }
}

export async function writeBetaData(data) {
  console.log('写入测试版本数据...');
  try {
    await initTables();
    const fullData = { ...data, releaseDate: new Date().toISOString() };
    const client = await getClient();
    try {
      await client.query('INSERT INTO beta_data (data) VALUES ($1)', [JSON.stringify(fullData)]);
      console.log('测试版本数据写入成功');
      return fullData;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入测试版本数据失败:', error);
    throw error;
  }
}

export async function readBetaChangelog() {
  console.log('读取测试版本更新日志...');
  try {
    await initTables();
    const client = await getClient();
    try {
      const result = await client.query('SELECT content FROM beta_changelog_data ORDER BY created_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        console.log('找到测试版本更新日志');
        return result.rows[0].content;
      }
      console.log('测试版本更新日志为空');
      return null;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取测试版本更新日志失败:', error);
    return null;
  }
}

export async function writeBetaChangelog(content) {
  console.log('写入测试版本更新日志...');
  try {
    await initTables();
    const client = await getClient();
    try {
      await client.query('INSERT INTO beta_changelog_data (content) VALUES ($1)', [content]);
      console.log('测试版本更新日志写入成功');
      return content;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入测试版本更新日志失败:', error);
    throw error;
  }
}

export async function readApprovedEchoes() {
  console.log('读取已审批回声洞...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT id, text, user FROM echoes WHERE approved = TRUE ORDER BY created_at DESC');
      console.log(`找到 ${result.rows.length} 条已审批回声洞`);
      return result.rows.map(row => ({ text: row.text, user: row.user }));
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取已审批回声洞失败:', error);
    return [];
  }
}

export async function writeEcho(text, user) {
  console.log('写入新回声洞...');
  try {
    await initTables();
    const client = await getClient();
    try {
      const result = await client.query(
        'INSERT INTO echoes (text, user, approved) VALUES ($1, $2, FALSE) RETURNING id',
        [text, user]
      );
      console.log('回声洞提交成功');
      return result.rows[0];
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('写入回声洞失败:', error);
    throw error;
  }
}

export async function readPendingEchoes() {
  console.log('读取待审批回声洞...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT id, text, user, created_at FROM echoes WHERE approved = FALSE ORDER BY created_at ASC');
      console.log(`找到 ${result.rows.length} 条待审批回声洞`);
      return result.rows;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取待审批回声洞失败:', error);
    return [];
  }
}

export async function approveEcho(id) {
  console.log('审批通过回声洞...');
  try {
    const client = await getClient();
    try {
      await client.query('UPDATE echoes SET approved = TRUE WHERE id = $1', [id]);
      console.log(`回声洞 ${id} 审批通过`);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('审批回声洞失败:', error);
    throw error;
  }
}

export async function rejectEcho(id) {
  console.log('拒绝并删除回声洞...');
  try {
    const client = await getClient();
    try {
      await client.query('DELETE FROM echoes WHERE id = $1', [id]);
      console.log(`回声洞 ${id} 已删除`);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('删除回声洞失败:', error);
    throw error;
  }
}