import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({
  message = '加载中...',
  fullscreen = false,
}: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        <mdui-circular-progress></mdui-circular-progress>
        <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}
    >
      <mdui-circular-progress></mdui-circular-progress>
      <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
