import { NextApiRequest, NextApiResponse, NextFunction } from 'next';
import { FileManager } from '../lib/fileManager';

declare global {
  namespace Express {
    interface Request {
      authenticatedKey?: string;
    }
  }
}

export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '缺少认证令牌',
      });
      return;
    }

    let keyData;
    try {
      keyData = JSON.parse(authHeader.slice(7));
    } catch {
      res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '令牌格式无效',
      });
      return;
    }

    const keyId = keyData.meta?.keyId;
    if (!keyId) {
      res.status(400).json({
        success: false,
        error: 'INVALID_KEY',
        message: '密钥文件无效',
      });
      return;
    }

    const registry = await FileManager.readKeyRegistry();
    const keyRecord = registry.keys.find((k: any) => k.keyId === keyId);

    if (!keyRecord || keyRecord.status !== 'active') {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '密钥无效或已过期',
      });
      return;
    }

    (req as any).authenticatedKey = keyId;
    next();

  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: '认证过程出错',
    });
  }
}
