import React, { useState, useCallback, useRef } from 'react';

interface KeyImporterProps {
  onImportSuccess: (data: any) => void;
}

export function KeyImporter({ onImportSuccess }: KeyImporterProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        setErrorMessage('请选择 .json 格式的密钥文件');
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const text = await file.text();
        const keyData = JSON.parse(text);

        if (!keyData.meta?.keyId || !keyData.crypto?.encryptedSeed) {
          throw new Error('密钥文件结构不完整');
        }

        onImportSuccess(keyData);
      } catch (error: any) {
        setErrorMessage(error.message || '文件解析失败喵~，请重试');
      } finally {
        setLoading(false);
      }
    },
    [onImportSuccess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  return (
    <div
      className={`upload-zone ${dragOver ? 'upload-zone--active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      tabIndex={0}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
        style={{ display: 'none' }}
      />

      {loading ? (
        <mdui-circular-progress></mdui-circular-progress>
      ) : (
        <>
          <div className="upload-icon-wrapper">
            <mdui-icon name="cloud_upload" style={{ fontSize: '52px' }}></mdui-icon>
          </div>
          <div className="upload-text">点击或拖放上传密钥文件</div>
          <div className="upload-hint">支持 .json 格式</div>
        </>
      )}

      {errorMessage && (
        <mdui-linear-progress style={{ marginTop: '16px' }}></mdui-linear-progress>
      )}
      {errorMessage && (
        <p style={{ color: 'var(--md-sys-color-error)', fontSize: '13px', marginTop: '8px' }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default KeyImporter;
