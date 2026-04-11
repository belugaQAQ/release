import React, { useState } from 'react';

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MarkdownField({ value, onChange, error }: MarkdownFieldProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="form-field">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <mdui-text-field
          label="更新日志 Markdown"
          value={value}
          onInput={(e: any) => onChange(e.target.value)}
          placeholder={`# 更新日志\n\n## 新增功能\n\n- 功能1\n- 功能2\n\n## 修复问题\n\n- 修复bug1`}
          rows={12}
          variant="filled"
          style={{ flex: 1 }}
        >
          <mdui-icon name="description" slot="icon"></mdui-icon>
        </mdui-text-field>
        
        <mdui-button
          variant="outlined"
          onClick={() => setShowPreview(!showPreview)}
          style={{ height: 'fit-content', alignSelf: 'flex-start', marginTop: '8px' }}
        >
          <mdui-icon name={showPreview ? 'edit_note' : 'preview'} slot="icon"></mdui-icon>
          {showPreview ? '编辑' : '预览'}
        </mdui-button>
      </div>

      {showPreview && (
        <div 
          className="markdown-preview"
          style={{ 
            padding: '16px', 
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '8px',
            minHeight: '200px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Roboto, sans-serif'
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ 
              __html: markdownToHtml(value) 
            }} 
          />
        </div>
      )}

      {error && (
        <p className="error-text">{error}</p>
      )}
    </div>
  );
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p>暂无内容</p>';
  
  let html = markdown
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

export default MarkdownField;