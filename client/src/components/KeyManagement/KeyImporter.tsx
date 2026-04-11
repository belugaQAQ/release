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
        setErrorMessage(error.message || '文件解析失败');
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: `3px dashed ${dragOver ? '#6750A4' : '#ccc'}`,
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center',
        backgroundColor: dragOver ? '#F3EDF7' : '#fafafa',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
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
          <mdui-icon name="cloud_upload" size="64" style={{ color: dragOver ? '#6750A4' : '#999' }}></mdui-icon>

          <h3 style={{ marginTop: '16px', color: '#333' }}>
            {dragOver ? '释放以上传密钥文件' : '拖放密钥文件到这里'}
          </h3>

          <p style={{ color: '#666', marginTop: '8px' }}>
            或者{' '}
            <span style={{ color: '#6750A4', fontWeight: 'bold' }}>点击选择文件</span>
          </p>

          <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
            支持 .json 格式的密钥文件
          </p>

          {errorMessage && (
            <mdui-alert variant="danger" style={{ marginTop: '16px' }}>
              ❌ {errorMessage}
            </mdui-alert>
          )}
        </>
      )}
    </div>
  );
}

export default KeyImporter;
