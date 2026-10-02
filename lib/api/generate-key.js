import { generateKeyPair, encrypt, generateKeyId, generateSeed, readKeyRegistry, writeKeyRegistry, hashKey } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 POST 请求' });
  }

  try {
    const registry = await readKeyRegistry();
    
    const activeKeys = registry.keys.filter(k => k.status === 'active');
    if (activeKeys.length > 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'KEY_EXISTS', 
        message: '已经存在有效的密钥，请先重置密钥后再生成新密钥' 
      });
    }

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

    const keyHash = await hashKey(keyPair.masterKey.toString('base64'));
    
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
}