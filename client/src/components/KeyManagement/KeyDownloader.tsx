import React, { useState } from 'react';

interface KeyDownloaderProps {
  keyFileData: object;
  onDownloadComplete: () => void;
}

export function KeyDownloader({ keyFileData, onDownloadComplete }: KeyDownloaderProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const jsonString = JSON.stringify(keyFileData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `auth_key_${new Date().toISOString().slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        onDownloadComplete();
      }, 1500);

    } catch (error) {
      console.error('下载失败了喵:', error); 
      alert('下载失败喵~，请重试');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <mdui-dialog headline="重要：下载您的密钥文件" open>
      <div style={{ padding: '24px', maxWidth: '500px' }}>
        <div className="data-section" style={{ borderColor: 'var(--md-sys-color-primary)', marginBottom: '16px' }}>
          <p style={{ color: 'var(--md-sys-color-on-primary-container)', fontWeight: 500 }}>
            这是您唯一的密钥文件，请立即下载并保存到安全位置！
          </p>
        </div>

        <ul style={{ lineHeight: '1.8', color: 'var(--md-sys-color-on-surface-variant)', paddingLeft: '20px' }}>
          <li>文件将保存为 .json 格式</li>
          <li>请勿分享给他人</li>
          <li>建议备份到多个位置</li>
          <li>丢失后将无法恢复</li>
        </ul>

        <mdui-button
          fullWidth
          variant="filled"
          onClick={handleDownload}
          loading={downloading}
          disabled={downloading}
          style={{ marginTop: '20px' }}
        >
          <mdui-icon name="download" slot="icon"></mdui-icon>
          {downloading ? '正在生成...' : '下载密钥文件'}
        </mdui-button>
      </div>
    </mdui-dialog>
  );
}

export default KeyDownloader;
