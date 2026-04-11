import React from 'react';

interface Sha256FieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Sha256Field({ value, onChange, error }: Sha256FieldProps) {
  return (
    <mdui-text-field
      label="SHA256 哈希值"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      maxlength={64}
      helper="64位十六进制字符"
      error={error || undefined}
      clearable
      variant="outlined"
    ></mdui-text-field>
  );
}

export default Sha256Field;
