import qiniu from 'qiniu';
import { requireAdmin } from './_shared.js';

const VERSION = /^\d+\.\d+\.\d+\.\d+$/;
const EXTENSIONS = new Set(['zip', '7z', 'exe', 'msi', 'dmg', 'tar', 'gz']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: '只允许 POST 请求' });
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ success: false, message: auth.message });
    const { version, beta = false, extension = 'zip', key: requestedKey } = req.body || {};
    if (requestedKey && (typeof requestedKey !== 'string' || !requestedKey || requestedKey.includes('..') || requestedKey.startsWith('/') || requestedKey.endsWith('/'))) return res.status(400).json({ success: false, message: '对象路径无效' });
    if (requestedKey && !requestedKey.includes('/')) return res.status(400).json({ success: false, message: '对象路径无效' });
    if (!requestedKey && !VERSION.test(String(version || ''))) return res.status(400).json({ success: false, message: '版本号格式无效' });
    if (typeof beta !== 'boolean') return res.status(400).json({ success: false, message: '发布通道无效' });
    if (!EXTENSIONS.has(String(extension).toLowerCase())) return res.status(400).json({ success: false, message: '不支持的文件类型' });

    const { QINIU_ACCESS_KEY: accessKey, QINIU_SECRET_KEY: secretKey, QINIU_BUCKET: bucket, QINIU_PUBLIC_DOMAIN: domain, QINIU_UPLOAD_URL: uploadUrl } = process.env;
    if (!accessKey || !secretKey || !bucket || !domain || !uploadUrl) throw new Error('七牛环境变量未配置完整');
    const key = requestedKey || `releases/${beta ? 'beta' : 'stable'}/${version}/app.${String(extension).toLowerCase()}`;
    const deadline = Math.floor(Date.now() / 1000) + 15 * 60;
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const policy = new qiniu.rs.PutPolicy({
      scope: `${bucket}:${key}`, 
      deadline,
      fsizeLimit: 2 * 1024 * 1024 * 1024,
      insertOnly: 1,
      returnBody: JSON.stringify({ key: '$(key)', hash: '$(etag)', size: '$(fsize)' }),
    });
    return res.status(200).json({ success: true, data: { uploadToken: policy.uploadToken(mac), uploadUrl, key, domain: domain.replace(/\/$/, ''), expiresIn: 900 } });
  } catch (error) {
    console.error('生成七牛上传凭证失败:', error);
    return res.status(500).json({ success: false, message: '生成上传凭证失败' });
  }
}
