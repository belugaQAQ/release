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
import { getLatestData, getChangelog, updateLatestData, updateChangelog, getBetaVersion, getBetaChangelog, updateBetaData, updateBetaChangelog } from '../utils/api';

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
  const [showChangelogPreview, setShowChangelogPreview] = useState(false);
  const [submittingVersion, setSubmittingVersion] = useState(false);
  const [submittingChangelog, setSubmittingChangelog] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [changelogSuccess, setChangelogSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<'latest' | 'beta'>('latest');

  const [betaValues, setBetaValues] = useState({
    version: '',
    url: '',
    size: '',
    changelog: '',
    sha256: '',
  });
  const [betaChangelogContent, setBetaChangelogContent] = useState('');
  const [showBetaChangelogPreview, setShowBetaChangelogPreview] = useState(false);
  const [betaSubmittingVersion, setBetaSubmittingVersion] = useState(false);
  const [betaSubmittingChangelog, setBetaSubmittingChangelog] = useState(false);
  const [betaSubmitSuccess, setBetaSubmitSuccess] = useState(false);
  const [betaChangelogSuccess, setBetaChangelogSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentData();
    }
  }, [isAuthenticated]);

  const loadCurrentData = async () => {
    setLoading(true);
    try {
      const [latestResponse, changelogText, betaResponse, betaChangelogText] = await Promise.all([
        getLatestData(),
        getChangelog(),
        getBetaVersion(),
        getBetaChangelog(),
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

      const betaData = (betaResponse as any).data || betaResponse;
      if (betaData && betaData.version && !betaData.version.includes('0.0.0.0')) {
        setBetaValues({
          version: betaData.version || '',
          url: betaData.url || '',
          size: betaData.size || '',
          changelog: betaData.changelog || '',
          sha256: betaData.sha256 || '',
        });
      }

      setBetaChangelogContent(betaChangelogText);
    } catch (error) {
      console.error('加载数据失败了喵:', error); 
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
      console.error('提交失败了喵:', error); 
      alert(error.message || '提交失败喵~，请重试');
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
      console.error('更新日志提交失败了喵:', error); 
      alert(error.message || '提交失败喵~，请重试');
    } finally {
      setSubmittingChangelog(false);
    }
  };

  const handleBetaSubmitVersion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    setBetaSubmittingVersion(true);

    try {
      const response = await updateBetaData(
        {
          version: betaValues.version,
          url: betaValues.url,
          size: Number(betaValues.size),
          changelog: betaValues.changelog,
          sha256: betaValues.sha256,
        },
        keyData
      );

      if (response.success) {
        setBetaSubmitSuccess(true);
        setTimeout(() => setBetaSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('提交失败了喵:', error); 
      alert(error.message || '提交失败喵~，请重试');
    } finally {
      setBetaSubmittingVersion(false);
    }
  };

  const handleBetaSubmitChangelog = async () => {
    if (!isAuthenticated) {
      return;
    }

    setBetaSubmittingChangelog(true);

    try {
      const response = await updateBetaChangelog(betaChangelogContent, keyData);

      if (response.success) {
        setBetaChangelogSuccess(true);
        setTimeout(() => setBetaChangelogSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('更新日志提交失败了喵:', error); 
      alert(error.message || '提交失败喵~，请重试');
    } finally {
      setBetaSubmittingChangelog(false);
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
      <AppBar 
        title="编辑更新信息" 
        actions={
          <div className="mode-switch">
            <mdui-button 
              variant={editMode === 'latest' ? 'filled' : 'outlined'} 
              size="small"
              onClick={() => setEditMode('latest')}
            >
              正式版本
            </mdui-button>
            <mdui-button 
              variant={editMode === 'beta' ? 'filled' : 'outlined'} 
              size="small"
              onClick={() => setEditMode('beta')}
            >
              测试版本
            </mdui-button>
          </div>
        }
      />

      <div className="page-content">
        {editMode === 'latest' ? (
          <>
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
                <div className="form-section-divider">
                  <span>版本数据</span>
                </div>
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
            <br />
            <br />
            <br />
            <div className="form-fields">
              <div className="form-section-divider">
                <span>更新日志 Markdown</span>
              </div>

              <MarkdownField
                value={changelogContent}
                onChange={setChangelogContent}
                showPreview={showChangelogPreview}
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
                <mdui-button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowChangelogPreview(!showChangelogPreview)}
                >
                  <mdui-icon name={showChangelogPreview ? 'edit_note' : 'preview'} slot="icon"></mdui-icon>
                  {showChangelogPreview ? '隐藏预览' : '预览'}
                </mdui-button>
              </div>
            </div>
          </>
        ) : (
          <>
            {betaSubmitSuccess && (
              <mdui-snackbar open>
                <mdui-icon slot="icon" name="check_circle"></mdui-icon>
                测试版本数据更新成功！
              </mdui-snackbar>
            )}

            {betaChangelogSuccess && (
              <mdui-snackbar open>
                <mdui-icon slot="icon" name="check_circle"></mdui-icon>
                测试版本更新日志更新成功！
              </mdui-snackbar>
            )}

            <form onSubmit={handleBetaSubmitVersion}>
              <div className="form-fields">
                <div className="form-section-divider beta-divider">
                  <span>测试版本数据</span>
                </div>
                <VersionField
                  value={betaValues.version}
                  onChange={(v) => setBetaValues(prev => ({ ...prev, version: v }))}
                  error=""
                />

                <UrlField
                  value={betaValues.url}
                  onChange={(v) => setBetaValues(prev => ({ ...prev, url: v }))}
                  error=""
                />

                <SizeField
                  value={betaValues.size}
                  onChange={(v) => setBetaValues(prev => ({ ...prev, size: v }))}
                  error=""
                />

                <ChangelogField
                  value={betaValues.changelog}
                  onChange={(v) => setBetaValues(prev => ({ ...prev, changelog: v }))}
                  error=""
                />

                <Sha256Field
                  value={betaValues.sha256}
                  onChange={(v) => setBetaValues(prev => ({ ...prev, sha256: v }))}
                  error=""
                />

                <div className="action-area">
                  <mdui-button
                    type="submit"
                    variant="filled"
                    fullWidth
                    loading={betaSubmittingVersion}
                    disabled={betaSubmittingVersion}
                  >
                    <mdui-icon name="save" slot="icon"></mdui-icon>
                    提交测试版本数据
                  </mdui-button>
                </div>
              </div>
            </form>
            <br />
            <br />
            <br />
            <div className="form-fields">
              <div className="form-section-divider beta-divider">
                <span>测试版本更新日志 Markdown</span>
              </div>

              <MarkdownField
                value={betaChangelogContent}
                onChange={setBetaChangelogContent}
                showPreview={showBetaChangelogPreview}
              />

              <div className="action-area">
                <mdui-button
                  variant="filled"
                  fullWidth
                  loading={betaSubmittingChangelog}
                  disabled={betaSubmittingChangelog}
                  onClick={handleBetaSubmitChangelog}
                >
                  <mdui-icon name="save" slot="icon"></mdui-icon>
                  保存测试版本更新日志
                </mdui-button>
                <mdui-button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowBetaChangelogPreview(!showBetaChangelogPreview)}
                >
                  <mdui-icon name={showBetaChangelogPreview ? 'edit_note' : 'preview'} slot="icon"></mdui-icon>
                  {showBetaChangelogPreview ? '隐藏预览' : '预览'}
                </mdui-button>
              </div>
            </div>
          </>
        )}

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