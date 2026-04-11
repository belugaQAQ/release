import { NextApiRequest, NextApiResponse } from 'next';
import { FileManager } from '../lib/fileManager';
import { validateUpdateData } from '../lib/validators';
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
    const { authorization } = req.headers;
    const { data } = req.body;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '缺少认证信息',
      });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '请提供有效的更新数据',
      });
    }

    const validation = validateUpdateData(data);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: validation.errors,
      });
    }

    const result = await FileManager.writeLatestData({
      version: data.version,
      url: data.url,
      size: Number(data.size),
      changelog: data.changelog,
      sha256: data.sha256,
    });

    await AuditLogger.log('DATA_UPDATE', {
      version: result.version,
      releaseDate: result.releaseDate,
    }, {
      ipAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    console.log(`✅ 数据更新成功: v${result.version}`);

    return res.status(200).json({
      success: true,
      message: '数据更新成功',
      data: result,
    });

  } catch (error) {
    console.error('数据更新失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '数据更新过程中发生错误',
    });
  }
}
