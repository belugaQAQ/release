import { readBetaChangelog } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 请求' });
  }

  try {
    const content = await readBetaChangelog();
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    if (!content) {
      return res.status(200).send('');
    }
    
    return res.status(200).send(content);
  } catch (error) {
    console.error('读取测试版本更新日志失败:', error);
    return res.status(500).send('');
  }
}