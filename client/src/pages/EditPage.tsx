import React, { useEffect, useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { useApi } from '../hooks/useApi';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { VersionField } from '../components/Forms/VersionField';
import { UrlField } from '../components/Forms/UrlField';
import { SizeField } from '../components/Forms/SizeField';
import { ChangelogField } from '../components/Forms/ChangelogField';
import { Sha256Field } from '../components/Forms/Sha256Field';
import { KeyResetter } from '../components/KeyManagement/KeyResetter';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import api from '../utils/api';

export interface LatestData {
  version: string;
  url: string;
  size: number;
  changelog: string;
  sha256: string;
  releaseDate: string;
}

export function EditPage() {
  const { values, errors, isFormValid, updateField, resetForm } = useFormValidation();
  const { execute: fetchLatest, data: latestData, loading: loadingLatest } = useApi<LatestData>();
  const { isAuthenticated, keyData, checkExistingSession, logout } = useKeyAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const hasSession = checkExistingSession();
    if (!hasSession) {
      window.location.href = '/';
      return;
    }

    loadCurrentData();
  }, []);

  const loadCurrentData = async () => {
    try {
      await fetchLatest('/latest.json');
      if (latestData) {
        updateField('version', latestData.version);
        updateField('url', latestData.url);
        updateField('size', latestData.size);
        updateField('changelog', latestData.changelog);
        updateField('sha256', latestData.sha256);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !isAuthenticated) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(
        '/update',
        {
          data: {
            version: values.version,
            url: values.url,
            size: Number(values.size),
            changelog: values.changelog,
            sha256: values.sha256,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${JSON.stringify(keyData)}`,
          },
        }
      );

      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      alert(error.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = (newKey: any) => {
    logout();
    sessionStorage.setItem('auth_key', JSON.stringify(newKey));
    window.location.reload();
  };

  if (!isAuthenticated) {
    return <LoadingSpinner message="正在验证身份..." fullscreen />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1 style={{ color: '#6750A4' }}>✏️ 编辑更新信息</h1>
        <KeyResetter currentKey={keyData} onResetComplete={handleReset} />
      </div>

      {submitSuccess && (
        <mdui-alert variant="success" style={{ marginBottom: '24px' }}>
          ✅ 数据更新成功！releaseDate: {new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
        </mdui-alert>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <VersionField
            value={values.version}
            onChange={(v) => updateField('version', v)}
            error={errors.version}
          />

          <UrlField
            value={values.url}
            onChange={(v) => updateField('url', v)}
            error={errors.url}
          />

          <SizeField
            value={values.size}
            onChange={(v) => updateField('size', v)}
            error={errors.size}
          />

          <ChangelogField
            value={values.changelog}
            onChange={(v) => updateField('changelog', v)}
            error={errors.changelog}
          />

          <Sha256Field
            value={values.sha256}
            onChange={(v) => updateField('sha256', v)}
            error={errors.sha256}
          />

          <mdui-button
            type="submit"
            variant="filled"
            fullWidth
            loading={submitting}
            disabled={!isFormValid || submitting}
            style={{ marginTop: '24px' }}
          >
            {submitting ? '提交中...' : '💾 提交更新'}
          </mdui-button>
        </div>
      </form>

      {loadingLatest && <LoadingSpinner message="正在加载数据..." />}
    </div>
  );
}

export default EditPage;
