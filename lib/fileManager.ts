import fs from 'fs/promises';
import path from 'path';
import { BackupManager } from './backup';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface LatestData {
  version: string;
  url: string;
  size: number;
  changelog: string;
  sha256: string;
  releaseDate: string;
}

export class FileManager {
  static async ensureDataDir(): Promise<void> {
    await fs.mkdir(path.join(DATA_DIR, 'backups'), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'keys'), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'logs'), { recursive: true });
  }

  static async writeJsonSafe<T>(filePath: string, data: T): Promise<void> {
    const dir = path.dirname(filePath);
    const tmpPath = `${filePath}.tmp`;

    try {
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(tmpPath, jsonString, 'utf-8');

      const content = await fs.readFile(tmpPath, 'utf-8');
      JSON.parse(content);

      if (filePath.includes('latest.json')) {
        try {
          const existingData = await this.readLatestData();
          if (existingData) {
            await BackupManager.createBackup(existingData);
          }
        } catch (error) {
        }
      }

      await fs.rename(tmpPath, filePath);

    } catch (error) {
      try {
        await fs.unlink(tmpPath);
      } catch (e) {
      }
      throw error;
    }
  }

  static async readLatestData(): Promise<LatestData | null> {
    try {
      const filePath = path.join(DATA_DIR, 'latest.json');
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  static async writeLatestData(data: Omit<LatestData, 'releaseDate'>): Promise<LatestData> {
    await this.ensureDataDir();

    const fullData: LatestData = {
      ...data,
      releaseDate: new Date().toISOString(),
    };

    const filePath = path.join(DATA_DIR, 'latest.json');
    await this.writeJsonSafe(filePath, fullData);

    return fullData;
  }

  static async readKeyRegistry(): Promise<any> {
    try {
      const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
      }
      throw error;
    }
  }

  static async writeKeyRegistry(registry: any): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
    await this.writeJsonSafe(filePath, registry);
  }
}
