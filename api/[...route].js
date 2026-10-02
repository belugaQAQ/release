import { createRequire } from 'node:module';
import health from '../lib/api/health.js';
import latest from '../lib/api/latest.json.js';
import beta from '../lib/api/beta.json.js';
import update from '../lib/api/update.js';
import generateKey from '../lib/api/generate-key.js';
import verifyKey from '../lib/api/verify-key.js';
import resetKey from '../lib/api/reset-key.js';
import changelog from '../lib/api/changelog.md.js';
import betamd from '../lib/api/betamd.md.js';
import echoes from '../lib/api/echoes.js';
import echoesAdmin from '../lib/api/echoes-admin.js';
import qiniuUploadToken from '../lib/api/qiniu-upload-token.js';
import qiniuObjects from '../lib/api/qiniu-objects.js';
import qiniuObjectData from '../lib/api/qiniu-object-data.js';

const routes = {
  '/api/health': health, '/api/latest.json': latest, '/api/beta.json': beta,
  '/api/update': update, '/api/generate-key': generateKey, '/api/verify-key': verifyKey, '/api/reset-key': resetKey,
  '/api/changelog.md': changelog, '/api/betamd.md': betamd,
  '/api/qiniu/upload-token': qiniuUploadToken, '/api/qiniu/objects': qiniuObjects, '/api/qiniu/object-data': qiniuObjectData,
  '/api/echoes': echoes, '/api/echoes-admin': echoesAdmin,
};

export default async function handler(req, res) {
  const pathname = new URL(req.url, 'http://vercel.local').pathname;
  const route = routes[pathname];
  if (!route) return res.status(404).json({success: false, message: '接口不存在'});
  return route(req, res);
}
