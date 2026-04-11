import { readLatestData } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 请求' });
  }

  try {
    const data = await readLatestData();
    if (!data) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: '暂无更新数据' });
    }
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '读取数据过程中发生错误' });
  }
}