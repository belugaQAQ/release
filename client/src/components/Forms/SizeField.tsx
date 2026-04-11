import React from 'react';

interface SizeFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
}

export function SizeField({ value, onChange, error }: SizeFieldProps) {
  return (
    <div className="form-field">
      <mdui-text-field
        label="文件大小 (字节)"
        type="number"
        value={String(value)}
        onInput={(e: any) => onChange(e.target.value)}
        helper="文件大小，单位：字节（正整数）"
        variant="filled"
        icon="storage"
        error={error || undefined}
      ></mdui-text-field>
    </div>
  );
}

export default SizeField;
