import { NextApiRequest, NextApiResponse } from 'next';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  console.error('API 错误:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  const response: any = {
    success: false,
    error: code,
  };

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    response.message = '服务器内部错误';
  } else {
    response.message = err.message || '未知错误';
  }

  res.status(statusCode).json(response);
}

export function createError(statusCode: number, code: string, message: string): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
