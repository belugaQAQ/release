import React from 'react';

interface ChangelogFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ChangelogField({ value, onChange, error }: ChangelogFieldProps) {
  return (
    <mdui-text-field
      label="变更日志"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      rows={4}
      error={error || undefined}
      variant="outlined"
    ></mdui-text-field>
  );
}

export default ChangelogField;
