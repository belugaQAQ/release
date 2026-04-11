import crypto from 'crypto';

export interface KeyPair {
  masterKey: Buffer;
  iv: Buffer;
}

export interface EncryptedData {
  encryptedSeed: string;
  authTag: string;
  iv: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  static generateKeyPair(): KeyPair {
    return {
      masterKey: crypto.randomBytes(this.KEY_LENGTH),
      iv: crypto.randomBytes(this.IV_LENGTH),
    };
  }

  static encrypt(plaintext: string, keyPair: KeyPair): EncryptedData {
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      keyPair.masterKey,
      keyPair.iv
    );

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag().toString('base64');

    return {
      encryptedSeed: encrypted,
      authTag,
      iv: keyPair.iv.toString('base64'),
    };
  }

  static decrypt(encryptedData: EncryptedData, masterKey: Buffer): string {
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      masterKey,
      Buffer.from(encryptedData.iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

    let decrypted = decipher.update(encryptedData.encryptedSeed, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static generateKeyId(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(6).toString('hex');
    return `key_${timestamp}_${random}`;
  }

  static generateSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
