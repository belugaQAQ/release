import React, { useState } from 'react';
import { resetKey } from '../../utils/api';

interface KeyResetterProps {
  currentKey: any;
  onResetComplete: (newKey: any) => void;
}

export function KeyResetter({ currentKey, onResetComplete }: KeyResetterProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmReset = async () => {
    if (!resetReason.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await resetKey(resetReason);

      if (response.success && response.data?.newKeyFile) {
        const newKeyBlob = new Blob(
          [JSON.stringify(response.data.newKeyFile, null, 2)],
          { type: 'application/json' }
        );
        const url = URL.createObjectURL(newKeyBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auth_key_reset_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);

        localStorage.setItem('keyFile', JSON.stringify(response.data.newKeyFile));
        onResetComplete(response.data.newKeyFile);
        setShowConfirmDialog(false);
        setResetReason('');
      } else {
        alert(response.message || '重置失败');
      }
    } catch (error: any) {
      alert(error.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <mdui-button
        variant="text"
        onClick={handleResetClick}
        style={{ color: 'var(--md-sys-color-error)' }}
      >
        <mdui-icon name="key" slot="icon"></mdui-icon>
        重置密钥
      </mdui-button>

      <mdui-dialog
        headline="确认重置密钥"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <div style={{ padding: '24px' }}>
          <div className="data-section" style={{ borderColor: 'var(--md-sys-color-error)', marginBottom: '16px' }}>
            <p style={{ color: 'var(--md-sys-color-error)', fontWeight: 500 }}>
              此操作将使当前密钥立即失效！
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <mdui-text-field
              label="重置原因（必填）"
              value={resetReason}
              onInput={(e: any) => setResetReason(e.target.value)}
              placeholder="例如：密钥丢失 / 怀疑泄露 / 定期轮换"
              rows={3}
              variant="filled"
            ></mdui-text-field>
          </div>

          <div className="data-section">
            <p style={{ fontWeight: 500, marginBottom: '8px' }}>重置后的影响：</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: 'var(--md-sys-color-on-surface-variant)' }}>
              <li>当前密钥将立即失效</li>
              <li>系统将生成全新的密钥文件</li>
              <li>您需要重新下载并保存新密钥</li>
              <li>旧密钥的所有会话将被终止</li>
            </ul>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              justifyContent: 'flex-end',
            }}
          >
            <mdui-button
              variant="text"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              取消
            </mdui-button>

            <mdui-button
              variant="filled"
              onClick={handleConfirmReset}
              loading={loading}
              disabled={loading || !resetReason.trim()}
              style={{ '--md-button-container-color': 'var(--md-sys-color-error)' } as any}
            >
              {loading ? '重置中...' : '确认重置'}
            </mdui-button>
          </div>
        </div>
      </mdui-dialog>
    </div>
  );
}

export default KeyResetter;