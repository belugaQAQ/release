import React, { useState } from 'react';
import { submitEcho } from '../utils/api';

export function EchoSubmitPage() {
  const [text, setText] = useState('');
  const [user, setUser] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) {
      setError('请输入回声洞内容');
      return;
    }

    if (!user.trim()) {
      setError('请输入投稿人称呼');
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitEcho(text, user);
      if (response.success) {
        setSubmitSuccess(true);
        setText('');
        setUser('');
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-without-nav" style={{ minHeight: '100vh', paddingBottom: '24px' }}>
      <div className="page-content" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
        <div className="greeting-card">
          <div className="greeting-text">
            <mdui-icon name="forum" style={{ fontSize: '28px' }}></mdui-icon>
            回声洞
          </div>
          <div className="greeting-subtext">在这里说出你的想法，投稿后将等待审批</div>
        </div>

        {submitSuccess && (
          <mdui-snackbar open>
            <mdui-icon slot="icon" name="check_circle"></mdui-icon>
            投稿成功！等待审批中~
          </mdui-snackbar>
        )}

        {error && (
          <mdui-snackbar open type="error">
            <mdui-icon slot="icon" name="error"></mdui-icon>
            {error}
          </mdui-snackbar>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-section-divider">
              <span>回声洞内容</span>
            </div>

            <div className="form-field">
              <mdui-text-field
                label="回声洞主内容"
                variant="outlined"
                rows={4}
                multiline
                value={text}
                onInput={(e: any) => setText(e.target.value)}
                required
              >
              </mdui-text-field>
            </div>

            <div className="form-field">
              <mdui-text-field
                label="投稿人称呼"
                variant="outlined"
                value={user}
                onInput={(e: any) => setUser(e.target.value)}
                required
              >
              </mdui-text-field>
            </div>

            <div className="action-area">
              <mdui-button
                type="submit"
                variant="filled"
                fullWidth
                loading={submitting}
                disabled={submitting}
              >
                <mdui-icon name="send" slot="icon"></mdui-icon>
                提交投稿
              </mdui-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EchoSubmitPage;
