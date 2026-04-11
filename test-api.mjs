import http from 'node:http';

const keyFile = {
  "meta": {
    "version": "1.0",
    "keyId": "key_20260411_fb973ac8cd73",
    "createdAt": "2026-04-11T02:37:41.317Z",
    "purpose": "StickyHomeworks Update Manager Authentication"
  },
  "crypto": {
    "algorithm": "AES-256-GCM",
    "iv": "T5+EAmGjorHc7nvODa0x6g==",
    "encryptedSeed": "sIl6Th2WeYhsRdivTXBmWL+o0IKxBZHffkfYll9CMO0+18ASLXw6oTpHoizwSk4WTC7wqqzINKz5aPF4QdW+GA==",
    "authTag": "HqYeWEjXYWJSMN6fNYx2sQ=="
  },
  "security": {
    "expiresAt": null,
    "maxUsageCount": -1,
    "currentUsageCount": 0
  }
};

const data = JSON.stringify({ keyFile });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/verify-key',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
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

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(data);
req.end();