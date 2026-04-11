import http from 'node:http';

// 模拟前端提交的数据格式
const keyFile = {
  meta: {
    version: '1.0',
    keyId: 'key_20260411_fb973ac8cd73',
    createdAt: '2026-04-11T02:37:41.317Z',
    purpose: 'StickyHomeworks Update Manager Authentication'
  },
  crypto: {
    algorithm: 'AES-256-GCM',
    iv: 'T5+EAmGjorHc7nvODa0x6g==',
    encryptedSeed: 'sIl6Th2WeYhsRdivTXBmWL+o0IKxBZHffkfYll9CMO0+18ASLXw6oTpHoizwSk4WTC7wqqzINKz5aPF4QdW+GA==',
    authTag: 'HqYeWEjXYWJSMN6fNYx2sQ=='
  },
  security: {
    expiresAt: null,
    maxUsageCount: -1,
    currentUsageCount: 0
  }
};

const data = JSON.stringify({
  data: {
    version: '3.0.0.0',
    url: 'https://github.com/example/app/releases/download/v3.0.0/app.zip',
    size: 3145728,
    changelog: 'Version 3.0 release\n- Major improvements',
    sha256: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  }
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': `Bearer ${JSON.stringify(keyFile)}`
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();