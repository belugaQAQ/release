import { Client } from '@neondatabase/serverless';
export { generateKeyPair, encrypt, generateKeyId, generateSeed, hashKey } from '../lib/backend/key-crypto.js';

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
        author VARCHAR(255) NOT NULL,
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('表初始化成功');
  } finally {
    await client.end();
  }
}

async function neonReadKeyRegistry() {
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

async function neonWriteKeyRegistry(registry) {
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

async function neonReadLatestData() {
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

async function neonWriteLatestData(data) {
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

async function neonReadChangelog() {
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

async function neonWriteChangelog(content) {
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


async function neonReadBetaData() {
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

async function neonWriteBetaData(data) {
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

async function neonReadBetaChangelog() {
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

async function neonWriteBetaChangelog(content) {
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

async function neonReadApprovedEchoes() {
  console.log('读取已审批回声洞...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT id, text, author FROM echoes WHERE approved = TRUE ORDER BY created_at DESC');
      console.log(`找到 ${result.rows.length} 条已审批回声洞`);
      return result.rows.map(row => ({ text: row.text, user: row.author }));
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取已审批回声洞失败:', error);
    return [];
  }
}

async function neonWriteEcho(text, author) {
  console.log('写入新回声洞...');
  try {
    await initTables();
    const client = await getClient();
    try {
      const result = await client.query(
        'INSERT INTO echoes (text, author, approved) VALUES ($1, $2, FALSE) RETURNING id',
        [text, author]
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

async function neonReadPendingEchoes() {
  console.log('读取待审批回声洞...');
  try {
    const client = await getClient();
    try {
      const result = await client.query('SELECT id, text, author, created_at FROM echoes WHERE approved = FALSE ORDER BY created_at ASC');
      console.log(`找到 ${result.rows.length} 条待审批回声洞`);
      return result.rows.map(row => ({ id: row.id, text: row.text, user: row.author, created_at: row.created_at }));
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('读取待审批回声洞失败:', error);
    return [];
  }
}

async function neonApproveEcho(id) {
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

async function neonRejectEcho(id) {
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
const fileStore = async () => import('../lib/backend/file-store.js');
const useFileStore = () => !process.env.DATABASE_URL;
export async function readKeyRegistry() { return useFileStore() ? (await fileStore()).readKeyRegistry() : neonReadKeyRegistry(); }
export async function writeKeyRegistry(v) { return useFileStore() ? (await fileStore()).writeKeyRegistry(v) : neonWriteKeyRegistry(v); }
export async function readLatestData() { return useFileStore() ? (await fileStore()).readLatestData() : neonReadLatestData(); }
export async function writeLatestData(v) { return useFileStore() ? (await fileStore()).writeLatestData(v) : neonWriteLatestData(v); }
export async function readChangelog() { return useFileStore() ? (await fileStore()).readChangelog() : neonReadChangelog(); }
export async function writeChangelog(v) { return useFileStore() ? (await fileStore()).writeChangelog(v) : neonWriteChangelog(v); }
export async function readBetaData() { return useFileStore() ? (await fileStore()).readBetaData() : neonReadBetaData(); }
export async function writeBetaData(v) { return useFileStore() ? (await fileStore()).writeBetaData(v) : neonWriteBetaData(v); }
export async function readBetaChangelog() { return useFileStore() ? (await fileStore()).readBetaChangelog() : neonReadBetaChangelog(); }
export async function writeBetaChangelog(v) { return useFileStore() ? (await fileStore()).writeBetaChangelog(v) : neonWriteBetaChangelog(v); }
export async function readApprovedEchoes() { return useFileStore() ? (await fileStore()).readApprovedEchoes() : neonReadApprovedEchoes(); }
export async function writeEcho(a,b) { return useFileStore() ? (await fileStore()).writeEcho(a,b) : neonWriteEcho(a,b); }
export async function readPendingEchoes() { return useFileStore() ? (await fileStore()).readPendingEchoes() : neonReadPendingEchoes(); }
export async function approveEcho(v) { return useFileStore() ? (await fileStore()).approveEcho(v) : neonApproveEcho(v); }
export async function rejectEcho(v) { return useFileStore() ? (await fileStore()).rejectEcho(v) : neonRejectEcho(v); }