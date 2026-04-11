import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'logs', 'audit.jsonl');

interface AuditLogEntry {
  action: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(
    action: string,
    details: any,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const entry: AuditLogEntry = {
      action,
      details,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    try {
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(LOG_FILE, logLine, 'utf-8');
      console.log(`📝 审计日志: [${action}]`);
    } catch (error) {
      console.error('❌ 写入审计日志失败:', error);
    }
  }

  static async query(filters?: {
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      const content = await fs.readFile(LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      let entries: AuditLogEntry[] = lines.map((line) => JSON.parse(line));

      if (filters?.action) {
        entries = entries.filter((e) => e.action === filters.action);
      }

      if (filters?.startDate) {
        entries = entries.filter((e) => e.timestamp >= filters.startDate!);
      }

      if (filters?.endDate) {
        entries = entries.filter((e) => e.timestamp <= filters.endDate!);
      }

      if (filters?.limit) {
        entries = entries.slice(0, filters.limit);
      }

      return entries.reverse();
    } catch (error) {
      console.error('查询审计日志失败:', error);
      return [];
    }
  }
}
