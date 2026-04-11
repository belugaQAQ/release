import express from 'express';

const app = express();
const PORT = 3002;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/test', (req, res) => {
  console.log('Received:', req.body);
  res.json({ success: true, data: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});