import React from 'react';

interface Sha256FieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Sha256Field({ value, onChange, error }: Sha256FieldProps) {
  return (
    <div className="form-field">
      <mdui-text-field
        label="SHA256 哈希值"
        value={value}
        onInput={(e: any) => onChange(e.target.value)}
        maxlength={64}
        counter
        helper="64位十六进制字符"
        clearable
        variant="filled"
        icon="fingerprint"
        error={error || undefined}
      ></mdui-text-field>
    </div>
  );
}

export default Sha256Field;
