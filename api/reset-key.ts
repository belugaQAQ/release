import { NextApiRequest, NextApiResponse } from 'next';
import { EncryptionService } from '../lib/encryption';
import { FileManager } from '../lib/fileManager';
import bcrypt from 'bcryptjs';
import { AuditLogger } from '../lib/auditLogger';

interface ResetRequestBody {
  reason?: string;
  force?: boolean;
}

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
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '需要提供当前有效密钥才能执行重置操作',
      });
    }

    let currentKeyData;
    try {
      currentKeyData = JSON.parse(authHeader.slice(7));
    } catch {
      return res.status(400).json({
        success: false,
        error: 'INVALID_KEY_FORMAT',
        message: '密钥格式无效',
      });
    }

    const currentKeyId = currentKeyData.meta?.keyId;
    if (!currentKeyId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_KEY',
        message: '密钥文件中缺少 keyId',
      });
    }

    const registry = await FileManager.readKeyRegistry();
    const currentKeyRecord = registry.keys.find(
      (k: any) => k.keyId === currentKeyId
    );

    if (!currentKeyRecord || currentKeyRecord.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '当前密钥无效或已过期',
      });
    }

    const body: ResetRequestBody = req.body || {};
    const { reason = '未指定原因' } = body;

    const newKeyPair = EncryptionService.generateKeyPair();
    const newKeyId = EncryptionService.generateKeyId();
    const seed = EncryptionService.generateSeed();
    const encryptedData = EncryptionService.encrypt(seed, newKeyPair);

    const newKeyFile = {
      meta: {
        version: '1.0',
        keyId: newKeyId,
        createdAt: new Date().toISOString(),
        purpose: 'StickyHomeworks Update Manager Authentication',
        resetFrom: currentKeyId,
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

    const oldKeyIndex = registry.keys.findIndex(
      (k: any) => k.keyId === currentKeyId
    );
    if (oldKeyIndex !== -1) {
      registry.keys[oldKeyIndex] = {
        ...registry.keys[oldKeyIndex],
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokeReason: reason,
        replacedBy: newKeyId,
      };
    }

    const newKeyHash = await bcrypt.hash(
      newKeyPair.masterKey.toString('base64'),
      12
    );
    registry.keys.push({
      keyId: newKeyId,
      keyHash: newKeyHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usageCount: 0,
      status: 'active',
    });

    registry.metadata.lastRotated = new Date().toISOString();
    registry.metadata.totalResets = (registry.metadata.totalResets || 0) + 1;

    await FileManager.writeKeyRegistry(registry);

    await AuditLogger.log(
      'KEY_RESET',
      {
        operatorKeyId: currentKeyId,
        oldKeyId: currentKeyId,
        newKeyId: newKeyId,
        reason,
      },
      {
        ipAddress: req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      }
    );

    console.log(`✅ 密钥重置成功: ${currentKeyId} -> ${newKeyId}`);

    return res.status(200).json({
      success: true,
      message: '密钥重置成功，请立即下载新密钥文件',
      data: {
        newKeyFile,
        resetInfo: {
          oldKeyId: currentKeyId,
          revokedAt: new Date().toISOString(),
          reason,
        },
      },
    });

  } catch (error) {
    console.error('密钥重置失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '密钥重置过程中发生错误',
    });
  }
}
