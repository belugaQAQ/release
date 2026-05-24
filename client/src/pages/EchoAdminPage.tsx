import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/Layout/AppBar';
import { Navigation } from '../components/Layout/Navigation';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { getPendingEchoes, approveEcho, rejectEcho } from '../utils/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

interface Echo {
  id: number;
  text: string;
  user: string;
  created_at: string;
}

export function EchoAdminPage() {
  const { logout, keyData } = useKeyAuth();
  const navigate = useNavigate();
  const [pendingEchoes, setPendingEchoes] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPendingEchoes();
  }, []);

  const loadPendingEchoes = async () => {
    setLoading(true);
    try {
      const response = await getPendingEchoes(keyData);
      if (response.success && response.data?.echoes) {
        setPendingEchoes(response.data.echoes);
      }
    } catch (error) {
      console.error('加载待审批回声洞失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await approveEcho(id, keyData);
      if (response.success) {
        setSuccessMessage('已同意该回声洞');
        setPendingEchoes(prev => prev.filter(echo => echo.id !== id));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || '操作失败');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await rejectEcho(id, keyData);
      if (response.success) {
        setSuccessMessage('已拒绝该回声洞');
        setPendingEchoes(prev => prev.filter(echo => echo.id !== id));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || '操作失败');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-with-nav">
      <AppBar
        title="回声洞审批"
        actions={
          <mdui-button-icon icon="logout" onClick={logout}></mdui-button-icon>
        }
      />

      <div className="page-content">
        <div className="greeting-card">
          <div className="greeting-text">
            <mdui-icon name="forum" style={{ fontSize: '28px' }}></mdui-icon>
            回声洞审批
          </div>
          <div className="greeting-subtext">共有 {pendingEchoes.length} 条待审批投稿</div>
        </div>

        {successMessage && (
          <mdui-snackbar open>
            <mdui-icon slot="icon" name="check_circle"></mdui-icon>
            {successMessage}
          </mdui-snackbar>
        )}

        {errorMessage && (
          <mdui-snackbar open type="error">
            <mdui-icon slot="icon" name="error"></mdui-icon>
            {errorMessage}
          </mdui-snackbar>
        )}

        {loading ? (
          <LoadingSpinner message="正在加载待审批回声洞..." />
        ) : pendingEchoes.length === 0 ? (
          <div className="data-section">
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center', padding: '24px' }}>
              暂无待审批的回声洞喵~
            </p>
          </div>
        ) : (
          pendingEchoes.map((echo) => (
            <div className="data-section" key={echo.id} style={{ marginBottom: '16px' }}>
              <div className="data-section-header">
                <span className="data-section-title">
                  <mdui-icon name="person" style={{ color: 'var(--md-sys-color-primary)' }}></mdui-icon>
                  {echo.user}
                </span>
                <span className="version-chip" style={{ fontSize: '12px' }}>
                  {formatDate(echo.created_at)}
                </span>
              </div>

              <div className="echo-content" style={{
                padding: '16px',
                background: 'rgba(var(--mdui-color-surface-variant), 0.3)',
                borderRadius: '8px',
                marginTop: '12px',
                marginBottom: '12px',
              }}>
                {echo.text}
              </div>

              <div className="action-area" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <mdui-button
                  variant="filled"
                  fullWidth
                  onClick={() => handleApprove(echo.id)}
                  loading={processingId === echo.id}
                  disabled={processingId !== null}
                >
                  <mdui-icon name="check" slot="icon"></mdui-icon>
                  同意
                </mdui-button>
                <mdui-button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => handleReject(echo.id)}
                  loading={processingId === echo.id}
                  disabled={processingId !== null}
                >
                  <mdui-icon name="close" slot="icon"></mdui-icon>
                  不同意
                </mdui-button>
              </div>
            </div>
          ))
        )}

        <div className="action-area">
          <mdui-button variant="outlined" fullWidth onClick={loadPendingEchoes}>
            <mdui-icon name="refresh" slot="icon"></mdui-icon>
            刷新列表
          </mdui-button>
        </div>
      </div>

      <Navigation />
    </div>
  );
}

export default EchoAdminPage;
