import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateKeyPair, encrypt, generateKeyId, generateSeed, readKeyRegistry, writeKeyRegistry, hashKey } from './_shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 POST 请求' });
  }

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

    const keyHash = await hashKey(keyPair.masterKey.toString('base64'));
    
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
}