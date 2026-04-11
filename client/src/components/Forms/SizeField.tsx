import React from 'react';

interface SizeFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
}

export function SizeField({ value, onChange, error }: SizeFieldProps) {
  return (
    <mdui-text-field
      label="文件大小"
      type="number"
      value={String(value)}
      onChange={(e: any) => onChange(e.target.value)}
      helper="文件大小，单位：字节（正整数）"
      error={error || undefined}
      min={1}
      variant="outlined"
    ></mdui-text-field>
  );
}

export default SizeField;
