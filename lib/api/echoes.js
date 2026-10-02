import { readApprovedEchoes, writeEcho } from './_shared.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const echoes = await readApprovedEchoes();
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).json(echoes);
    } catch (error) {
      console.error('获取回声洞列表失败:', error);
      return res.status(500).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const { text, user } = req.body;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请输入回声洞内容' });
      }

      if (!user || typeof user !== 'string' || user.trim() === '') {
        return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请输入投稿人称呼' });
      }

      const result = await writeEcho(text.trim(), user.trim());

      return res.status(200).json({ success: true, message: '投稿成功，等待审批', id: result.id });

    } catch (error) {
      console.error('提交回声洞失败:', error);
      return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '提交过程中发生错误' });
    }
  }

  return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 或 POST 请求' });
}
