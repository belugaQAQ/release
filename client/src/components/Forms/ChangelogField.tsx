import React from 'react';

interface ChangelogFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ChangelogField({ value, onChange, error }: ChangelogFieldProps) {
  return (
    <div className="form-field">
      <mdui-text-field
        label="更新日志"
        value={value}
        onInput={(e: any) => onChange(e.target.value)}
        rows={3}
        autosize
        variant="filled"
        icon="description"
        error={error || undefined}
        helper="支持多行文本"
      ></mdui-text-field>
    </div>
  );
}

export default ChangelogField;
