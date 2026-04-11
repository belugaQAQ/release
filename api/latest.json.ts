import { NextApiRequest, NextApiResponse } from 'next';
import { FileManager } from '../lib/fileManager';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 GET 请求',
    });
  }

  try {
    const data = await FileManager.readLatestData();

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '暂无更新数据',
      });
    }

    const etag = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');

    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"${etag}"`) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.setHeader('ETag', `"${etag}"`);

    return res.status(200).json(data);

  } catch (error) {
    console.error('读取数据失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '读取数据过程中发生错误',
    });
  }
}
