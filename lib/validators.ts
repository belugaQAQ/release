export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface UpdateDataValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateVersion(version: string): ValidationResult {
  const pattern = /^\d+\.\d+\.\d+\.\d+$/;
  if (!pattern.test(version)) {
    return {
      valid: false,
      error: '版本号格式不正确，应为 x.x.x.x（例如：1.0.0.0）',
    };
  }
  return { valid: true };
}

export function validateUrl(url: string): ValidationResult {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: 'URL 必须以 http:// 或 https:// 开头',
      };
    }
    if (!parsedUrl.hostname) {
      return {
        valid: false,
        error: 'URL 必须包含有效的域名',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: '请输入有效的 URL 地址',
    };
  }
}

export function validateSize(size: number): ValidationResult {
  if (!Number.isInteger(size) || size <= 0) {
    return {
      valid: false,
      error: '文件大小必须为正整数（单位：字节）',
    };
  }
  return { valid: true };
}

export function validateChangelog(changelog: string): ValidationResult {
  if (!changelog || changelog.trim().length === 0) {
    return {
      valid: false,
      error: '变更日志不能为空',
    };
  }
  return { valid: true };
}

export function validateSha256(sha256: string): ValidationResult {
  const pattern = /^[a-fA-F0-9]{64}$/;
  if (!pattern.test(sha256)) {
    return {
      valid: false,
      error: 'SHA256 必须为64位十六进制字符',
    };
  }
  return { valid: true };
}

export function validateUpdateData(data: any): UpdateDataValidationResult {
  const errors: Record<string, string> = {};

  const versionResult = validateVersion(data.version);
  if (!versionResult.valid) errors.version = versionResult.error!;

  const urlResult = validateUrl(data.url);
  if (!urlResult.valid) errors.url = urlResult.error!;

  const sizeResult = validateSize(data.size);
  if (!sizeResult.valid) errors.size = sizeResult.error!;

  const changelogResult = validateChangelog(data.changelog);
  if (!changelogResult.valid) errors.changelog = changelogResult.error!;

  const sha256Result = validateSha256(data.sha256);
  if (!sha256Result.valid) errors.sha256 = sha256Result.error!;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
