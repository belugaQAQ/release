import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import health from './lib/api/health.js';
import latest from './lib/api/latest.json.js';
import beta from './lib/api/beta.json.js';
import update from './lib/api/update.js';
import generateKey from './lib/api/generate-key.js';
import verifyKey from './lib/api/verify-key.js';
import resetKey from './lib/api/reset-key.js';
import changelog from './lib/api/changelog.md.js';
import betamd from './lib/api/betamd.md.js';
import echoes from './lib/api/echoes.js';
import echoesAdmin from './lib/api/echoes-admin.js';
import qiniuUploadToken from './lib/api/qiniu-upload-token.js';
import qiniuObjects from './lib/api/qiniu-objects.js';
import qiniuObjectData from './lib/api/qiniu-object-data.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: ['http://localhost:5173','http://localhost:5174','http://localhost:3000'], methods:['GET','POST','OPTIONS'], allowedHeaders:['Content-Type','Authorization','X-Check-Only'] }));
app.use(express.json({ limit:'10mb' }));
const routes = {
  '/api/health': health, '/api/latest.json': latest, '/api/beta.json': beta,
  '/api/update': update, '/api/generate-key': generateKey, '/api/verify-key': verifyKey, '/api/reset-key': resetKey,
  '/api/qiniu/upload-token': qiniuUploadToken, '/api/qiniu/objects': qiniuObjects, '/api/qiniu/object-data': qiniuObjectData, '/api/changelog.md': changelog, '/api/betamd.md': betamd, '/api/echoes': echoes, '/api/echoes-admin': echoesAdmin,
};
for (const [route, handler] of Object.entries(routes)) app.all(route, (req,res) => handler(req,res));
app.listen(PORT, '127.0.0.1', () => console.log(`API server running on http://127.0.0.1:${PORT}`));
