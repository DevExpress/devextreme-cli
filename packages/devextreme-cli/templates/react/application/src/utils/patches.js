import { useState, useCallback } from 'react';
import { useScreenSize, ScreenSize } from './media-query';

export function useMenuPatch() {
  const screenSize = useScreenSize();
  const [enabled, setEnabled] = useState(
    screenSize !== ScreenSize.Large && screenSize !== ScreenSize.XSmall
  );
  const onMenuReady = useCallback(() => {
    if (!enabled) {
      return;
    }

    setTimeout(() => setEnabled(false));
  }, [enabled]);

  return [enabled ? ' pre-init-blink-fix' : '', onMenuReady];
}

export function menuPreInitPatch(component) {
  const { menuOpened, minMenuSize } = component.state;
  component.state.preInitCssFix = true;
  return {
    get cssClass() {
      if (menuOpened || minMenuSize === 0) {
        return "";
      }

      return (component.state.preInitCssFix ? " pre-init-blink-fix" : "");
    },

    onReady() {
      if (menuOpened) {
        return;
      }

      setTimeout(() => {
        component.setState({ preInitCssFix: false });
      });
    }
  };
}
