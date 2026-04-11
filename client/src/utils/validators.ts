import { VALIDATION_RULES } from './constants';

export interface FieldValidation {
  valid: boolean;
  error?: string;
}

export function validateVersion(value: string): FieldValidation {
  if (!VALIDATION_RULES.VERSION_PATTERN.test(value)) {
    return {
      valid: false,
      error: '版本号格式不正确，应为 x.x.x.x（例如：1.0.0.0）',
    };
  }
  return { valid: true };
}

export function validateUrl(value: string): FieldValidation {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'URL 必须以 http:// 或 https:// 开头' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: '请输入有效的 URL 地址' };
  }
}

export function validateSize(value: string | number): FieldValidation {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return { valid: false, error: '必须为正整数（单位：字节）' };
  }
  return { valid: true };
}

export function validateChangelog(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: '变更日志不能为空' };
  }
  return { valid: true };
}

export function validateSha256(value: string): FieldValidation {
  if (!VALIDATION_RULES.SHA256_PATTERN.test(value)) {
    return { valid: false, error: 'SHA256 必须为64位十六进制字符' };
  }
  return { valid: true };
}
