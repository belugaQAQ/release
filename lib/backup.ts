import fs from 'fs/promises';
import path from 'path';
import { LatestData } from './fileManager';

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 5;

export class BackupManager {
  static async createBackup(data: LatestData): Promise<string> {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 15);
    const filename = `latest.${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    await this.cleanupOldBackups();

    console.log(`✅ 备份已创建: ${filename}`);
    return filePath;
  }

  static async listBackups(): Promise<Array<{ filename: string; date: Date; size: number }>> {
    try {
      const files = await fs.readdir(BACKUP_DIR);
      const backups = [];

      for (const file of files) {
        if (file.startsWith('latest.') && file.endsWith('.json')) {
          const filePath = path.join(BACKUP_DIR, file);
          const stat = await fs.stat(filePath);
          backups.push({
            filename: file,
            date: stat.mtime,
            size: stat.size,
          });
        }
      }

      return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      return [];
    }
  }

  static async restoreFromBackup(filename: string): Promise<LatestData> {
    const filePath = path.join(BACKUP_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private static async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > MAX_BACKUPS) {
        const toDelete = backups.slice(MAX_BACKUPS);
        
        for (const backup of toDelete) {
          const filePath = path.join(BACKUP_DIR, backup.filename);
          await fs.unlink(filePath);
          console.log(`🗑️ 已删除旧备份: ${backup.filename}`);
        }
      }
    } catch (error) {
      console.error('清理备份失败:', error);
    }
  }
}
