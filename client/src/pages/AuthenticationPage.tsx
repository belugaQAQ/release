import React, { useEffect, useState } from 'react';
import { AppBar } from '../components/Layout/AppBar';
import { KeyImporter } from '../components/KeyManagement/KeyImporter';
import { KeyDownloader } from '../components/KeyManagement/KeyDownloader';
import { useKeyAuth } from '../hooks/useKeyAuth';
import api from '../utils/api';

export function AuthenticationPage() {
  const { isAuthenticated, isLoading, verifyKey } = useKeyAuth();
  const [showDownloader, setShowDownloader] = useState(false);
  const [keyFileData, setKeyFileData] = useState<object | null>(null);
  const [generating, setGenerating] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !checked) {
      checkIfKeyExistsOnServer();
      setChecked(true);
    }
  }, [isAuthenticated, checked]);

  const checkIfKeyExistsOnServer = async () => {
    try {
      const response = await api.get('/api/verify-key', {
        headers: { 'X-Check-Only': 'true' },
      } as any);
      if ((response as any).hasExistingKey) {
        setShowDownloader(true);
      } else {
        setGenerating(true);
        await generateNewKey();
      }
    } catch {
      setGenerating(true);
      await generateNewKey();
    }
  };

  const generateNewKey = async () => {
    try {
      const response = await api.post('/api/generate-key');
      if (response.success) {
        setKeyFileData(response.data);
        setShowDownloader(true);
      }
    } catch (error) {
      console.error('生成密钥失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleImportSuccess = async (keyData: any) => {
    await verifyKey(keyData);
  };

  const handleDownloadComplete = () => {
    setShowDownloader(false);
  };

  if (isLoading || generating) {
    return (
      <div className="auth-page">
        <AppBar title="身份验证" />
        <div className="auth-content">
          <mdui-circular-progress></mdui-circular-progress>
          <p className="auth-loading-text">
            {generating ? '正在生成密钥...' : '正在验证...'}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-page">
      <AppBar title="身份验证" />
      <div className="auth-content">
        <div className="auth-icon-container">
          <mdui-icon name="vpn_key" style={{ fontSize: '42px', color: 'var(--md-sys-color-primary)' }}></mdui-icon>
        </div>

        <div className="auth-title">身份验证</div>
        <div className="auth-subtitle">请上传您的密钥文件以继续访问系统</div>

        {showDownloader && keyFileData ? (
          <div className="auth-downloader">
            <KeyDownloader
              keyFileData={keyFileData}
              onDownloadComplete={handleDownloadComplete}
            />
          </div>
        ) : (
          <KeyImporter onImportSuccess={handleImportSuccess} />
        )}
      </div>
    </div>
  );
}

export default AuthenticationPage;
