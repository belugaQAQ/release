import { readPendingEchoes, approveEcho, rejectEcho } from './_shared.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { authorization } = req.headers;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
      }

      const echoes = await readPendingEchoes();
      return res.status(200).json({ success: true, echoes });
    } catch (error) {
      console.error('获取待审批回声洞失败:', error);
      return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '获取数据失败' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { authorization } = req.headers;
      const { id, action } = req.body;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
      }

      if (!id) {
        return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请提供回声洞 ID' });
      }

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请指定有效的操作（approve 或 reject）' });
      }

      if (action === 'approve') {
        await approveEcho(id);
        return res.status(200).json({ success: true, message: '已同意该回声洞' });
      } else {
        await rejectEcho(id);
        return res.status(200).json({ success: true, message: '已拒绝该回声洞' });
      }
    } catch (error) {
      console.error('审批回声洞失败:', error);
      return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '审批过程中发生错误' });
    }
  }

  return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 或 POST 请求' });
}
