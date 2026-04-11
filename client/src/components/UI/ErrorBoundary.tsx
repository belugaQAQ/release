import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              backgroundColor: '#FFF8F8',
              borderRadius: '8px',
              margin: '24px',
            }}
          >
            <h2 style={{ color: '#B3261E', marginBottom: '16px' }}>
              ⚠️ 出错了
            </h2>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <mdui-button
              variant="filled"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              重试
            </mdui-button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

