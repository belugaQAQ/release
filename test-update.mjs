import http from 'node:http';

const data = JSON.stringify({
  data: {
    version: '1.0.0.0',
    url: 'https://example.com/app.zip',
    size: 1024,
    changelog: 'test update',
    sha256: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer test'
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