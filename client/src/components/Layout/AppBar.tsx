import React from 'react';

interface AppBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function AppBar({ title = 'StickyHomeworks 更新管理器', onMenuClick }: AppBarProps) {
  return (
    <mdui-top-app-bar>
      <mdui-button-icon icon="menu" onClick={onMenuClick}></mdui-button-icon>
      <mdui-top-app-bar-title>{title}</mdui-top-app-bar-title>
      <div style={{ flexGrow: 1 }}></div>
      <mdui-button-icon icon="more_vert"></mdui-button-icon>
    </mdui-top-app-bar>
  );
}

export default AppBar;
