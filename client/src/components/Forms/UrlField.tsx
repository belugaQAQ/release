import React from 'react';

interface UrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function UrlField({ value, onChange, error }: UrlFieldProps) {
  return (
    <div className="form-field">
      <mdui-text-field
        label="下载链接 (URL)"
        type="url"
        value={value}
        onInput={(e: any) => onChange(e.target.value)}
        helper="完整的下载地址，包含协议（http/https）和域名"
        clearable
        variant="filled"
        icon="link"
        error={error || undefined}
      ></mdui-text-field>
    </div>
  );
}

export default UrlField;
