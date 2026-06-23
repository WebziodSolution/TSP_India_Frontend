import { useState, useEffect } from 'react';

export const usePreferredTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => setTheme(mediaQuery.matches ? 'dark' : 'light');

    updateTheme(); // set initial value
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return theme;
};
