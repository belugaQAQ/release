import { VercelRequest, VercelResponse } from '@vercel/node';
import { writeLatestData } from './_shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 POST 请求' });
  }

  try {
    const { authorization } = req.headers;
    const { data } = req.body;

    console.log('=== Update Request Debug ===');
    console.log('Headers:', { authorization: !!authorization });
    console.log('Body:', req.body);
    console.log('Data:', data);
    console.log('Data Type:', typeof data);
    console.log('============================');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请提供有效的更新数据' });
    }

    const result = await writeLatestData({
      version: data.version,
      url: data.url,
      size: Number(data.size),
      changelog: data.changelog,
      sha256: data.sha256,
    });

    return res.status(200).json({ success: true, message: '数据更新成功', data: result });

  } catch (error) {
    console.error('数据更新失败:', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '数据更新过程中发生错误' });
  }
}