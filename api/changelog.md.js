import { readLatestData, writeLatestData } from './_shared.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await readLatestData();
      if (!data) {
        return res.status(404).send('# 暂无更新日志');
      }
      
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).send(data.changelog || '# 暂无更新日志');
    } catch (error) {
      console.error('读取更新日志失败:', error);
      return res.status(500).send('# 读取更新日志失败');
    }
  }

  if (req.method === 'POST') {
    try {
      const { authorization } = req.headers;
      const { changelog } = req.body;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
      }

      if (typeof changelog !== 'string') {
        return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请提供有效的更新日志' });
      }

      const data = await readLatestData();
      if (!data) {
        return res.status(400).json({ success: false, error: 'NO_DATA', message: '请先创建版本数据' });
      }

      const result = await writeLatestData({
        version: data.version,
        url: data.url,
        size: data.size,
        changelog: changelog,
        sha256: data.sha256,
      });

      return res.status(200).json({ success: true, message: '更新日志更新成功', data: result });

    } catch (error) {
      console.error('更新日志更新失败:', error);
      return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '更新日志更新过程中发生错误' });
    }
  }

  return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 或 POST 请求' });
}