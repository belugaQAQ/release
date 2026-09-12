import express from 'express';
import cors from 'cors';
import health from './api/health.js';
import latest from './api/latest.json.js';
import beta from './api/beta.json.js';
import update from './api/update.js';
import generateKey from './api/generate-key.js';
import verifyKey from './api/verify-key.js';
import resetKey from './api/reset-key.js';
import changelog from './api/changelog.md.js';
import betamd from './api/betamd.md.js';
import echoes from './api/echoes.js';
import echoesAdmin from './api/echoes-admin.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: ['http://localhost:5173','http://localhost:5174','http://localhost:3000'], methods:['GET','POST','OPTIONS'], allowedHeaders:['Content-Type','Authorization','X-Check-Only'] }));
app.use(express.json({ limit:'10mb' }));
const routes = {
  '/api/health': health, '/api/latest.json': latest, '/api/beta.json': beta,
  '/api/update': update, '/api/generate-key': generateKey, '/api/verify-key': verifyKey,
  '/api/reset-key': resetKey, '/api/changelog.md': changelog, '/api/betamd.md': betamd,
  '/api/echoes': echoes, '/api/echoes-admin': echoesAdmin,
};
for (const [route, handler] of Object.entries(routes)) app.all(route, (req,res) => handler(req,res));
app.listen(PORT, '127.0.0.1', () => console.log(`API server running on http://127.0.0.1:${PORT}`));
