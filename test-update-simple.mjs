import http from 'node:http';

const data = JSON.stringify({
  data: {
    version: '2.0.0.0',
    url: 'https://github.com/example/app/releases/download/v2.0.0/app.zip',
    size: 2097152,
    changelog: 'Version 2.0 release\n- New features\n- Bug fixes',
    sha256: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678'
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