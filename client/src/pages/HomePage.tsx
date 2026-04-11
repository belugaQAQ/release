import React, { useEffect, useState } from 'react';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { KeyImporter } from '../components/KeyManagement/KeyImporter';
import { KeyDownloader } from '../components/KeyManagement/KeyDownloader';
import api from '../utils/api';

export function HomePage() {
  const { isAuthenticated, isLoading, verifyKey, checkExistingSession } = useKeyAuth();
  const [showDownloader, setShowDownloader] = useState(false);
  const [keyFileData, setKeyFileData] = useState<object | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkForExistingKey();
  }, []);

  const checkForExistingKey = async () => {
    const hasSession = checkExistingSession();
    if (!hasSession) {
      await checkIfKeyExistsOnServer();
    }
  };

  const checkIfKeyExistsOnServer = async () => {
    try {
      const response = await api.get('/verify-key', {
        headers: { 'X-Check-Only': 'true' },
      });
      if (response.hasExistingKey) {
        setShowDownloader(true);
      }
    } catch {
      setGenerating(true);
      await generateNewKey();
    }
  };

  const generateNewKey = async () => {
    try {
      const response = await api.post('/generate-key');
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
    const success = await verifyKey(keyData);
    if (success) {
      window.location.href = '/edit';
    }
  };

  const handleDownloadComplete = () => {
    setShowDownloader(false);
    window.location.href = '/edit';
  };

  if (isLoading || generating) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <mdui-circular-progress></mdui-circular-progress>
        <p style={{ marginTop: '16px', color: '#666' }}>
          {generating ? '正在生成密钥...' : '正在验证...'}
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <mdui-icon name="check_circle" size="64" style={{ color: '#056E33' }}></mdui-icon>
        <h2 style={{ marginTop: '16px', color: '#056E33' }}>✅ 认证成功</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>正在跳转到编辑页面...</p>
        {setTimeout(() => (window.location.href = '/edit'), 1000)}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#6750A4' }}>
        🔐 StickyHomeworks 更新管理器
      </h1>

      {showDownloader && keyFileData ? (
        <KeyDownloader
          keyFileData={keyFileData}
          onDownloadComplete={handleDownloadComplete}
        />
      ) : (
        <>
          <div
            style={{
              backgroundColor: '#F3EDF7',
              border: '1px solid #D0BCFF',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#4F378B' }}>
              <strong>欢迎使用！</strong> 为了保障数据安全，您需要使用密钥文件进行身份验证。
              {showDownloader
                ? ' 系统已为您生成新的密钥文件，请立即下载保存。'
                : ' 请上传您的密钥文件以继续。'}
            </p>
          </div>

          <KeyImporter onImportSuccess={handleImportSuccess} />
        </>
      )}
    </div>
  );
}

export default HomePage;
