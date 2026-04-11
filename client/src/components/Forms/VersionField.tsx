import React from 'react';

interface VersionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function VersionField({ value, onChange, error }: VersionFieldProps) {
  return (
    <mdui-text-field
      label="版本号"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      helper="格式: x.x.x.x（例如：0.2.0.0）"
      error={error || undefined}
      clearable
      variant="outlined"
    ></mdui-text-field>
  );
}

export default VersionField;
