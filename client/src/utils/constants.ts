export const API_BASE_URL = '';

export const VALIDATION_RULES = {
  VERSION_PATTERN: /^\d+\.\d+\.\d+\.\d+$/,
  SHA256_PATTERN: /^[a-fA-F0-9]{64}$/,
  MIN_SIZE: 1,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败喵~，请检查网络后重试',
  UNAUTHORIZED: '认证失败喵~，请重新登录',
  VALIDATION_ERROR: '数据验证失败喵~，请检查输入',
  UNKNOWN_ERROR: '未知错误喵~，请联系管理员',
} as const;

export const CACHE_DURATION = {
  LATEST_DATA: 5 * 60 * 1000,
} as const;