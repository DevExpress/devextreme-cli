import React, { useCallback, useMemo, useState } from 'react';

const themes = ['light', 'dark'];
const themeClassNamePrefix = 'dx-swatch-';
let currentTheme =  getNextTheme();

function getNextTheme(theme = '') {
  return themes[themes.indexOf(theme) + 1] || themes[0];
}

function getCurrentTheme() {
  return currentTheme;
}

function toggleTheme(prevTheme<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  const isCurrentThemeDark = prevTheme === 'dark';
  const newTheme = getNextTheme(prevTheme);

  document.getElementById('root')?.classList.replace(
    themeClassNamePrefix + prevTheme,
    themeClassNamePrefix + newTheme
  );

  const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
  const additionalClassNamePostfix = isCurrentThemeDark ? '-' + prevTheme : '';
  const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

  document.getElementById('root')?.querySelector(`.${additionalClassName}`)?.classList
    .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

  currentTheme = newTheme;

  return newTheme;
}

export function useThemeContext() {
  const [theme, setTheme] = useState(getCurrentTheme());
  const switchTheme = useCallback(() => setTheme((currentTheme) => toggleTheme(currentTheme)), []);
  const isDark = useCallback(()<%=#isTypeScript%>: boolean<%=/isTypeScript%> => {
    return currentTheme === 'dark';
  }, []);

  if (!document.getElementById('root')?.className.includes(themeClassNamePrefix)) {
    document.getElementById('root')?.classList.add(themeClassNamePrefix + theme);
  }

  return useMemo(()=> ({ theme, switchTheme, isDark }), [theme, switchTheme, isDark]);
}

export const ThemeContext = React.createContext<%=#isTypeScript%><ReturnType<typeof useThemeContext> | null><%=/isTypeScript%>(null);
