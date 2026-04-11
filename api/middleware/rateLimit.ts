import fs from 'fs/promises';
import path from 'path';

interface RateLimitEntry {
  count: number;
  lastReset: string;
}

const STORE_FILE = path.join(process.cwd(), 'data', 'rate_limits.json');
const LIMITS: Record<string, { maxAttempts: number; windowMs: number }> = {
  'reset-key': { maxAttempts: 3, windowMs: 24 * 60 * 60 * 1000 },
  'verify-key': { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
  'update-data': { maxAttempts: 30, windowMs: 60 * 60 * 1000 },
};

export async function rateLimitMiddleware(
  action: string,
  identifier: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = LIMITS[action] || { maxAttempts: 10, windowMs: 3600000 };
  const now = Date.now();

  let store: Record<string, RateLimitEntry> = {};
  try {
    const data = await fs.readFile(STORE_FILE, 'utf-8');
    store = JSON.parse(data);
  } catch {
  }

  const key = `${action}:${identifier}`;
  const entry = store[key];

  if (!entry || now - new Date(entry.lastReset).getTime() > config.windowMs) {
    store[key] = { count: 1, lastReset: new Date().toISOString() };
    await saveStore(store);
    return { allowed: true };
  }

  if (entry.count >= config.maxAttempts) {
    const retryAfter = Math.ceil(
      (config.windowMs - (now - new Date(entry.lastReset).getTime())) / 1000
    );
    return { allowed: false, retryAfter };
  }

  entry.count++;
  await saveStore(store);
  return { allowed: true };
}

async function saveStore(store: Record<string, RateLimitEntry>): Promise<void> {
  const dir = path.dirname(STORE_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}
