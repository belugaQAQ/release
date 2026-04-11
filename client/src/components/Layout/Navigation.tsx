import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: '首页' },
  { path: '/edit', icon: 'edit_note', label: '编辑' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement & { value: string }>(null);

  const currentItem = navItems.find((item) => item.path === location.pathname);
  const currentValue = currentItem?.path || '/';

  useEffect(() => {
    const navBar = navRef.current;
    if (!navBar) return;

    const handleChange = () => {
      const newValue = navBar.value;
      if (newValue && newValue !== location.pathname) {
        navigate(newValue);
      }
    };

    navBar.addEventListener('change', handleChange);
    return () => navBar.removeEventListener('change', handleChange);
  }, [navigate, location.pathname]);

  return (
    <mdui-navigation-bar ref={navRef} value={currentValue}>
      {navItems.map((item) => (
        <mdui-navigation-bar-item
          key={item.path}
          icon={item.icon}
          value={item.path}
        >
          {item.label}
        </mdui-navigation-bar-item>
      ))}
    </mdui-navigation-bar>
  );
}

export default Navigation;
