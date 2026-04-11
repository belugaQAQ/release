import { NextApiRequest, NextApiResponse } from 'next';
import { FileManager } from '../lib/fileManager';
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
    const { keyFile } = req.body;

    if (!keyFile || typeof keyFile !== 'object') {
      return res.status(400).json({
        valid: false,
        error: '请提供有效的密钥文件',
      });
    }

    const { meta, crypto: cryptoData } = keyFile;

    if (!meta?.keyId || !cryptoData?.encryptedSeed || !cryptoData?.iv || !cryptoData?.authTag) {
      return res.status(400).json({
        valid: false,
        error: '密钥文件格式无效或已损坏',
      });
    }

    const registry = await FileManager.readKeyRegistry();
    const keyRecord = registry.keys.find((k: any) => k.keyId === meta.keyId);

    if (!keyRecord) {
      await AuditLogger.log('AUTH_FAILURE', {
        reason: 'KEY_NOT_FOUND',
        keyId: meta.keyId,
      }, {
        ipAddress: req.socket?.remoteAddress,
      });

      return res.status(401).json({
        valid: false,
        error: '密钥不存在或已被撤销',
      });
    }

    if (keyRecord.status !== 'active') {
      return res.status(401).json({
        valid: false,
        error: '密钥已被禁用或已过期',
      });
    }

    if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
      return res.status(401).json({
        valid: false,
        error: '密钥已过期',
      });
    }

    keyRecord.usageCount += 1;
    await FileManager.writeKeyRegistry(registry);

    await AuditLogger.log('KEY_VERIFY', {
      keyId: meta.keyId,
      usageCount: keyRecord.usageCount,
    }, {
      ipAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      valid: true,
      keyId: meta.keyId,
      message: '密钥验证成功',
    });

  } catch (error) {
    console.error('密钥验证失败:', error);
    return res.status(500).json({
      valid: false,
      error: '验证过程发生错误',
    });
  }
}
