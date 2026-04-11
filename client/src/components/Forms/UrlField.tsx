import React from 'react';

interface UrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function UrlField({ value, onChange, error }: UrlFieldProps) {
  return (
    <mdui-text-field
      label="下载链接 (URL)"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      helper="完整的下载地址，包含协议（http/https）和域名"
      error={error || undefined}
      clearable
      variant="outlined"
    ></mdui-text-field>
  );
}

export default UrlField;
