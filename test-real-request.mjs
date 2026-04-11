import http from 'node:http';
import fs from 'fs/promises';

async function testUpdate() {
  // 读取实际的密钥文件
  const keyFileContent = await fs.readFile('auth_key_key_20260411_fb973ac8cd73.json', 'utf-8');
  const keyFile = JSON.parse(keyFileContent);

  const updateData = {
    version: '1.0.0.1',
    url: 'https://github.com/StickyHomeworks/StickyHomeworks/releases/download/v1.0.1/StickyHomeworks.zip',
    size: 5242880,
    changelog: 'Test update from frontend',
    sha256: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  };

  const data = JSON.stringify({ data: updateData });

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

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, response });
        } catch {
          resolve({ status: res.statusCode, response: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

testUpdate().then(console.log).catch(console.error);