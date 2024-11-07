import React, { useCallback } from 'react';
import Button from 'devextreme-react/button';
import {useThemeContext} from '../../theme';

export const ThemeSwitcher = () => {
  const themeContext = useThemeContext();

  const onButtonClick = useCallback(() => {
    themeContext?.switchTheme();
  }, []);

  return <div>
    <Button
      className='theme-button'
      stylingMode='text'
      icon={`${themeContext?.theme !== 'dark' ? 'sun' : 'moon'}`}
      onClick={onButtonClick} />
  </div>;
};
