import { readKeyRegistry, writeKeyRegistry } from './_shared.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const registry = await readKeyRegistry();
      const hasExistingKey = registry.keys.length > 0;
      return res.status(200).json({ hasExistingKey });
    } catch (error) {
      console.error('检查密钥失败:', error);
      return res.status(500).json({ hasExistingKey: false });
    }
  }

  if (req.method === 'POST') {
    try {
      const { keyFile } = req.body;

      if (!keyFile || typeof keyFile !== 'object') {
        return res.status(400).json({ success: false, error: '请提供有效的密钥文件' });
      }

      const { meta } = keyFile;

      if (!meta?.keyId) {
        return res.status(400).json({ success: false, error: '密钥文件格式无效或已损坏' });
      }

      const registry = await readKeyRegistry();
      const keyRecord = registry.keys.find((k) => k.keyId === meta.keyId);

      if (!keyRecord) {
        return res.status(401).json({ success: false, error: '密钥不存在或已被撤销' });
      }

      if (keyRecord.status !== 'active') {
        return res.status(401).json({ success: false, error: '密钥已被禁用或已过期' });
      }

      keyRecord.usageCount += 1;
      await writeKeyRegistry(registry);

      return res.status(200).json({ success: true, data: { valid: true, keyId: meta.keyId, message: '密钥验证成功' } });

    } catch (error) {
      console.error('密钥验证失败:', error);
      return res.status(500).json({ success: false, error: '验证过程发生错误' });
    }
  }

  return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 或 POST 请求' });
}