import { readPendingEchoes, readApprovedEchoes, approveEcho, rejectEcho, deleteApprovedEcho } from './_shared.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { authorization } = req.headers;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: '缺少认证信息' });
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const approved = req.query.approved === 'true';
      const echoes = approved ? await readApprovedEchoes() : await readPendingEchoes();
      return res.status(200).json({ success: true, echoes });
    } catch (error) {
      console.error('获取待审批回声洞失败:', error);
      return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '获取数据失败' });
    }
  }

  if (req.method === 'POST' || req.method === 'DELETE') {
    try {
      const { authorization } = req.headers;
      const body = req.body || {};
      const id = body.id ?? req.query.id;
      const action = body.action ?? req.query.action;
      if (id === undefined || id === null || id === '') return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: '请提供回声洞 ID' });
      if (req.method === 'DELETE' || action === 'delete') {
        await deleteApprovedEcho(id);
        return res.status(200).json({ success: true, message: '已删除该回声洞' });
      }
      if (action === 'approve') await approveEcho(id); else await rejectEcho(id);
      return res.status(200).json({ success: true, message: action === 'approve' ? '已同意该回声洞' : '已拒绝该回声洞' });
    } catch (error) {
      console.error('审批回声洞失败:', error);
      return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: '审批过程中发生错误' });
    }
  }

  return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 或 POST 请求' });
}
