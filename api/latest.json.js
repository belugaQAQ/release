import { readLatestData } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 请求' });
  }

  try {
    const data = await readLatestData();
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    if (!data) {
      return res.status(200).json({
        version: "0.0.0.0",
        url: "",
        size: 0,
        changelog: "",
        sha256: "",
        releaseDate: new Date().toISOString()
      });
    }
    
    return res.status(200).json({
      version: data.version,
      url: data.url,
      size: data.size,
      changelog: data.changelog,
      sha256: data.sha256,
      releaseDate: data.releaseDate
    });
  } catch (error) {
    console.error('读取数据失败:', error);
    return res.status(500).json({
      version: "0.0.0.0",
      url: "",
      size: 0,
      changelog: "",
      sha256: "",
      releaseDate: new Date().toISOString()
    });
  }
}