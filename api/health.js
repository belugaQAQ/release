export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: '只允许 GET 请求' });
  }
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}