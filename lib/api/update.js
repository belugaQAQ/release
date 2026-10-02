import { writeLatestData, writeBetaData } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 POST 请求' });
  }

  try {
    const { authorization } = req.headers;
    const { data, beta } = req.body;

    console.log('=== Update Request Debug ===');
    console.log('Headers:', { authorization: !!authorization });
    console.log('Body:', req.body);
    console.log('Data:', data);
    console.log('Beta:', beta);
    console.log('Data Type:', typeof data);
    console.log('============================');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请提供有效的更新数据' });
    }

    const requiredFields = ['version', 'url', 'size', 'changelog', 'sha256'];
    const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: `缺少必要字段: ${missingFields.join(', ')}` });
    }

    const writeFn = beta ? writeBetaData : writeLatestData;
    const result = await writeFn({
      version: String(data.version),
      url: String(data.url),
      size: Number(data.size),
      changelog: String(data.changelog),
      sha256: String(data.sha256),
    });

    const mode = beta ? '测试版本' : '正式版本';
    return res.status(200).json({ success: true, message: `${mode}数据更新成功`, data: result });

  } catch (error) {
    console.error('数据更新失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'INTERNAL_ERROR', 
      message: '数据更新过程中发生错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}