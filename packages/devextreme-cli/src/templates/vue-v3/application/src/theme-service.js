import { ref } from 'vue';

class ThemeService {
  themes = ['light', 'dark']
  themeClassNamePrefix = 'dx-swatch-';
  currentTheme = ref('');
  isDark = ref(false);

  constructor() {
    if (!document.body.className.includes(this.themeClassNamePrefix)) {
      this.currentTheme.value = this.themes[0];

      document.body.classList.add(this.themeClassNamePrefix + this.currentTheme.value);
    }
  }

  switchAppTheme() {
    const prevTheme = this.currentTheme.value;
    const isCurrentThemeDark = prevTheme === 'dark';

    this.currentTheme.value =  this.themes[prevTheme === this.themes[0] ? 1 : 0];

    document.body.classList.replace(
      this.themeClassNamePrefix + prevTheme,
      this.themeClassNamePrefix + this.currentTheme.value
    );

    const additionalClassNamePrefix = this.themeClassNamePrefix + 'additional';
    const additionalClassNamePostfix = isCurrentThemeDark ? '-' + prevTheme : '';
    const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

    document.body
      .querySelector(`.${additionalClassName}`)?.classList
      .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

    this.isDark.value = this.currentTheme.value === 'dark';
  }
}

export const themeService = new ThemeService();
