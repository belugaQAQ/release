import React from 'react';

interface AppBarProps {
  title: string;
  actions?: React.ReactNode;
}

export function AppBar({ title, actions }: AppBarProps) {
  return (
    <div className="top-bar-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <mdui-top-app-bar  variant="medium" scroll-behavior="shrink elevate">
        <mdui-top-app-bar-title>{title}</mdui-top-app-bar-title>
        <div style={{ flexGrow: 1 }}></div>
        <div className="appbar-actions">{actions}</div>
      </mdui-top-app-bar>
    </div>
  );
}

export default AppBar;
