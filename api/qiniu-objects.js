import qiniu from 'qiniu';
import { requireAdmin } from './_shared.js';

function config() {
  const { QINIU_ACCESS_KEY: accessKey, QINIU_SECRET_KEY: secretKey, QINIU_BUCKET: bucket, QINIU_PUBLIC_DOMAIN: domain } = process.env;
  if (!accessKey || !secretKey || !bucket || !domain) throw new Error('七牛环境变量未配置完整');
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  return { mac, bucket, domain: domain.replace(/\/$/, '') };
}

export default async function handler(req, res) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ success: false, message: auth.message });
    const { mac, bucket, domain } = config();
    const manager = new qiniu.rs.BucketManager(mac);
    if (req.method === 'GET') {
      const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : '';
      const marker = typeof req.query.marker === 'string' ? req.query.marker : '';
      const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
      const result = await new Promise((resolve, reject) => manager.listPrefix(bucket, { prefix, marker, limit, delimiter: '/' }, (error, body, info) => error ? reject(error) : resolve({ body, info })));
      const prefixes = result.body.commonPrefixes || [];
      const items = (result.body.items || []).filter(item => item.key !== prefix).map(item => {
        const isDirectory = String(item.key).endsWith('/') || item.mimeType === 'application/qiniu-object-manager';
        const trimmedKey = isDirectory ? item.key.replace(/\/$/, '') : item.key;
        return { type: isDirectory ? 'directory' : 'file', key: item.key, name: trimmedKey.slice(trimmedKey.lastIndexOf('/') + 1), size: Number(item.fsize || 0), hash: item.etag || '', mimeType: item.mimeType || '', updatedAt: item.putTime ? new Date(item.putTime / 10000).toISOString() : '', url: isDirectory ? '' : `${domain}/${encodeURI(item.key)}` };
      });
      const directories = prefixes.filter(key => key !== prefix).map(key => ({ type: 'directory', key, name: key.slice(0, -1).slice(key.slice(0, -1).lastIndexOf('/') + 1), size: 0, hash: '', mimeType: '', updatedAt: '', url: '' }));
      return res.status(200).json({ success: true, data: { items: [...directories, ...items], marker: result.body.marker || '', hasNext: Boolean(result.body.marker) } });
    }
    if (req.method === 'DELETE') {
      const key = typeof req.query.key === 'string' ? req.query.key : '';
      if (!key || key.includes('..') || key.startsWith('/')) return res.status(400).json({ success: false, message: '对象路径无效' });
      await new Promise((resolve, reject) => manager.delete(bucket, key, error => error ? reject(error) : resolve()));
      return res.status(200).json({ success: true, message: '对象已删除' });
    }
    return res.status(405).json({ success: false, message: '只允许 GET 或 DELETE 请求' });
  } catch (error) {
    console.error('七牛对象操作失败:', error);
    return res.status(500).json({ success: false, message: '七牛对象操作失败' });
  }
}
