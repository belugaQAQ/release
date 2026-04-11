import React from 'react';

interface VersionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function VersionField({ value, onChange, error }: VersionFieldProps) {
  return (
    <div className="form-field">
      <mdui-text-field
        label="版本号"
        value={value}
        onInput={(e: any) => onChange(e.target.value)}
        helper="格式: x.x.x.x（例如：0.2.0.0）"
        clearable
        variant="filled"
        icon="tag"
        error={error || undefined}
      ></mdui-text-field>
    </div>
  );
}

export default VersionField;
