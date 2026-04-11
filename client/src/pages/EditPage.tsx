import React, { useEffect, useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { AppBar } from '../components/Layout/AppBar';
import { Navigation } from '../components/Layout/Navigation';
import { VersionField } from '../components/Forms/VersionField';
import { UrlField } from '../components/Forms/UrlField';
import { SizeField } from '../components/Forms/SizeField';
import { ChangelogField } from '../components/Forms/ChangelogField';
import { Sha256Field } from '../components/Forms/Sha256Field';
import { MarkdownField } from '../components/Forms/MarkdownField';
import { KeyResetter } from '../components/KeyManagement/KeyResetter';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { getLatestData, getChangelog, updateLatestData, updateChangelog } from '../utils/api';

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
  const { isAuthenticated, keyData, logout } = useKeyAuth();
  const [changelogContent, setChangelogContent] = useState('');
  const [submittingVersion, setSubmittingVersion] = useState(false);
  const [submittingChangelog, setSubmittingChangelog] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [changelogSuccess, setChangelogSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentData();
    }
  }, [isAuthenticated]);

  const loadCurrentData = async () => {
    setLoading(true);
    try {
      const [latestResponse, changelogText] = await Promise.all([
        getLatestData(),
        getChangelog(),
      ]);
      
      const data = (latestResponse as any).data || latestResponse;
      if (data && data.version) {
        updateField('version', data.version);
        updateField('url', data.url);
        updateField('size', data.size);
        updateField('changelog', data.changelog);
        updateField('sha256', data.sha256);
      }
      
      setChangelogContent(changelogText);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVersion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !isAuthenticated) {
      return;
    }

    setSubmittingVersion(true);

    try {
      const response = await updateLatestData(
        {
          version: values.version,
          url: values.url,
          size: Number(values.size),
          changelog: values.changelog,
          sha256: values.sha256,
        },
        keyData
      );

      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      alert(error.message || '提交失败，请重试');
    } finally {
      setSubmittingVersion(false);
    }
  };

  const handleSubmitChangelog = async () => {
    if (!isAuthenticated) {
      return;
    }

    setSubmittingChangelog(true);

    try {
      const response = await updateChangelog(changelogContent, keyData);

      if (response.success) {
        setChangelogSuccess(true);
        setTimeout(() => setChangelogSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('更新日志提交失败:', error);
      alert(error.message || '提交失败，请重试');
    } finally {
      setSubmittingChangelog(false);
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
    <div className="page-with-nav">
      <AppBar title="编辑更新信息" />

      <div className="page-content">
        {submitSuccess && (
          <mdui-snackbar open>
            <mdui-icon slot="icon" name="check_circle"></mdui-icon>
            版本数据更新成功！
          </mdui-snackbar>
        )}

        {changelogSuccess && (
          <mdui-snackbar open>
            <mdui-icon slot="icon" name="check_circle"></mdui-icon>
            更新日志更新成功！
          </mdui-snackbar>
        )}

        <form onSubmit={handleSubmitVersion}>
          <div className="form-fields">
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

            <div className="action-area">
              <mdui-button
                type="submit"
                variant="filled"
                fullWidth
                loading={submittingVersion}
                disabled={!isFormValid || submittingVersion}
              >
                <mdui-icon name="save" slot="icon"></mdui-icon>
                提交版本数据
              </mdui-button>
              <mdui-button
                variant="text"
                fullWidth
                onClick={() => resetForm()}
              >
                重置表单
              </mdui-button>
            </div>
          </div>
        </form>

        <div className="form-fields">
          <div className="form-section-divider">
            <span>更新日志 Markdown</span>
          </div>

          <MarkdownField
            value={changelogContent}
            onChange={setChangelogContent}
          />

          <div className="action-area">
            <mdui-button
              variant="filled"
              fullWidth
              loading={submittingChangelog}
              disabled={submittingChangelog}
              onClick={handleSubmitChangelog}
            >
              <mdui-icon name="save" slot="icon"></mdui-icon>
              保存更新日志
            </mdui-button>
          </div>
        </div>

        <div className="key-reset-area">
          <KeyResetter currentKey={keyData} onResetComplete={handleReset} />
        </div>

        {loading && <LoadingSpinner message="正在加载数据..." />}
      </div>

      <Navigation />
    </div>
  );
}

export default EditPage;