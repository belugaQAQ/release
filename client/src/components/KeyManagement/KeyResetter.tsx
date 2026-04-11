import React, { useState } from 'react';
import api from '../../utils/api';

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
      alert('请输入重置原因');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reset-key', {
        reason: resetReason,
        force: false,
      }, {
        headers: {
          'Authorization': `Bearer ${JSON.stringify(currentKey)}`,
        },
      });

      if (response.success) {
        alert('密钥重置成功！正在准备下载新密钥...');
        
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

        onResetComplete(response.data.newKeyFile);
        setShowConfirmDialog(false);
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
        style={{ color: '#B3261E' }}
      >
        🔄 重置密钥
      </mdui-button>

      <mdui-dialog
        headline="⚠️ 确认重置密钥"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <div style={{ padding: '24px' }}>
          <mdui-alert variant="danger" style={{ marginBottom: '16px' }}>
            <strong>警告：</strong>此操作将使当前密钥<strong>立即失效</strong>！
          </mdui-alert>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              请输入重置原因（必填）：
            </label>
            <mdui-text-field
              value={resetReason}
              onChange={(e: any) => setResetReason(e.target.value)}
              placeholder="例如：密钥丢失 / 怀疑泄露 / 定期轮换"
              rows={3}
            ></mdui-text-field>
          </div>

          <div
            style={{
              backgroundColor: '#FFF8F8',
              border: '1px solid #F28B82',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            <strong>📋 重置后的影响：</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
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
              style={{ backgroundColor: '#B3261E' }}
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
