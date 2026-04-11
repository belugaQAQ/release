import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/Layout/AppBar';
import { Navigation } from '../components/Layout/Navigation';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { getLatestData } from '../utils/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

interface LatestData {
  version: string;
  url: string;
  size: number;
  changelog: string;
  sha256: string;
  releaseDate: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function getDateString(): string {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p>暂无更新日志</p>';
  
  let html = markdown
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

export function HomePage() {
  const { logout } = useKeyAuth();
  const navigate = useNavigate();
  const [latestData, setLatestData] = useState<LatestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getLatestData();
      const data = (response as any).data || response;
      if (data && data.version) {
        setLatestData(data as LatestData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleEdit = () => {
    navigate('/edit');
  };

  return (
    <div className="page-with-nav">
      <AppBar
        title="首页"
        actions={
          <mdui-button-icon icon="logout" onClick={handleLogout}></mdui-button-icon>
        }
      />

      <div className="page-content">
        <div className="greeting-card">
          <div className="greeting-text">
            <mdui-icon name="waving_hand" style={{ fontSize: '28px' }}></mdui-icon>
            {getGreetingTime()}，管理员
          </div>
          <div className="greeting-subtext">今天是 {getDateString()}</div>
        </div>

        {loading ? (
          <LoadingSpinner message="正在加载数据..." />
        ) : latestData ? (
          <>
            <div className="data-section">
              <div className="data-section-header">
                <span className="data-section-title">
                  <mdui-icon name="info" style={{ color: 'var(--md-sys-color-primary)' }}></mdui-icon>
                  当前版本信息
                </span>
                <span className="version-chip">v{latestData.version}</span>
              </div>

              <div className="data-item">
                <span className="data-label">版本号 (Version)</span>
                <span className="data-value">{latestData.version}</span>
              </div>

              <div className="data-item">
                <span className="data-label">下载链接 (URL)</span>
                <span className="data-value data-value--url">{latestData.url}</span>
              </div>

              <div className="data-item">
                <span className="data-label">文件大小 (Size)</span>
                <span className="data-value">
                  {formatFileSize(latestData.size)} ({latestData.size.toLocaleString()} 字节)
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">SHA256 校验值</span>
                <span className="data-value data-value--code">{latestData.sha256}</span>
              </div>

              <div className="data-item">
                <span className="data-label">发布时间 (Release Date)</span>
                <span className="data-value">{formatDate(latestData.releaseDate)}</span>
              </div>
            </div>

            <div className="data-section changelog-section">
              <div className="data-section-header">
                <span className="data-section-title">
                  <mdui-icon name="file_text" style={{ color: 'var(--md-sys-color-primary)' }}></mdui-icon>
                  更新日志 (Changelog)
                </span>
              </div>
              <div 
                className="changelog-content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(latestData.changelog) }}
              />
            </div>

            <div className="action-area">
              <mdui-button variant="filled" fullWidth onClick={handleEdit}>
                <mdui-icon name="edit" slot="icon"></mdui-icon>
                编辑更新信息
              </mdui-button>
              <mdui-button variant="outlined" fullWidth onClick={loadData}>
                <mdui-icon name="refresh" slot="icon"></mdui-icon>
                刷新数据
              </mdui-button>
            </div>
          </>
        ) : (
          <div className="data-section">
            <div className="data-section-header">
              <span className="data-section-title">
                <mdui-icon name="info" style={{ color: 'var(--md-sys-color-primary)' }}></mdui-icon>
                当前版本信息
              </span>
            </div>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center', padding: '24px' }}>
              暂无数据，请先编辑更新信息
            </p>
            <div className="action-area">
              <mdui-button variant="filled" fullWidth onClick={handleEdit}>
                <mdui-icon name="edit" slot="icon"></mdui-icon>
                编辑更新信息
              </mdui-button>
            </div>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}

export default HomePage;