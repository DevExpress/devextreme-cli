import { Injectable } from '@angular/core';

const themes = ['light', 'dark'] as const;
const themeClassNamePrefix = 'dx-swatch-';

type Theme = typeof themes[number];

function getNextTheme(theme?: Theme) {
  return (theme && themes[themes.indexOf(theme) + 1]) || themes[0];
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  currentTheme: Theme = getNextTheme();

  constructor() {
    if (!document.body.className.includes(themeClassNamePrefix)) {
      document.body.classList.add(themeClassNamePrefix + this.currentTheme);
    }
  }

  switchTheme() {
    const currentTheme = this.currentTheme;
    const newTheme = getNextTheme(this.currentTheme);
    const isCurrentThemeDark = currentTheme === 'dark';

    document.body.classList.replace(
      themeClassNamePrefix + currentTheme,
      themeClassNamePrefix + newTheme
    );

    const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
    const additionalClassNamePostfix = isCurrentThemeDark ? '-' + currentTheme : '';
    const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

    document.body
      .querySelector(`.${additionalClassName}`)?.classList
      .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

    this.currentTheme = newTheme;
  }
}
