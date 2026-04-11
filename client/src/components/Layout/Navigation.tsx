import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: '首页' },
  { path: '/edit', icon: 'edit', label: '编辑' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentValue = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <mdui-navigation-bar
      value={currentValue}
      onChange={(e: any) => {
        const index = e.detail.value as number;
        navigate(navItems[index].path);
      }}
    >
      {navItems.map((item) => (
        <mdui-navigation-bar-item
          key={item.path}
          icon={item.icon}
        >
          {item.label}
        </mdui-navigation-bar-item>
      ))}
    </mdui-navigation-bar>
  );
}

export default Navigation;
