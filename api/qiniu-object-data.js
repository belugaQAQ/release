import crypto from 'node:crypto';
import { requireAdmin } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({success: false, message: '只允许 GET 请求'});
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({success: false, message: auth.message});
    const key = typeof req.query.key === 'string' ? req.query.key : '';
    const domain = (process.env.QINIU_PUBLIC_DOMAIN || '').replace(/\/$/, '');
    if (!key || !domain || key.includes('..') || key.startsWith('/') || key.endsWith('/')) return res.status(400).json({success: false, message: '对象路径无效'});
    const response = await fetch(`${domain}/${encodeURI(key)}`);
    if (!response.ok) return res.status(response.status).json({success: false, message: '无法读取对象内容'});
    const buffer = Buffer.from(await response.arrayBuffer());
    return res.status(200).json({success: true, data: {size: buffer.length, sha256: crypto.createHash('sha256').update(buffer).digest('hex')}});
  } catch (error) {
    console.error('读取对象摘要失败:', error);
    return res.status(500).json({success: false, message: '读取对象摘要失败'});
  }
}
