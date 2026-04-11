import { NextApiRequest, NextApiResponse } from 'next';
import { EncryptionService } from '../lib/encryption';
import { FileManager } from '../lib/fileManager';
import bcrypt from 'bcryptjs';
import { AuditLogger } from '../lib/auditLogger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 POST 请求',
    });
  }

  try {
    const keyPair = EncryptionService.generateKeyPair();
    const keyId = EncryptionService.generateKeyId();
    const seed = EncryptionService.generateSeed();

    const encryptedData = EncryptionService.encrypt(seed, keyPair);

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
    
    const registry = await FileManager.readKeyRegistry();
    registry.keys.push({
      keyId,
      keyHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usageCount: 0,
      status: 'active',
    });
    registry.metadata.totalKeys += 1;
    
    await FileManager.writeKeyRegistry(registry);

    await AuditLogger.log('KEY_GENERATE', { keyId }, {
      ipAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

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
