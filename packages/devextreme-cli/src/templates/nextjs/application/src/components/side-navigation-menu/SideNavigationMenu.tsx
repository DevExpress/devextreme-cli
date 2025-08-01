'use client'
import React, { useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { TreeView<%=#isTypeScript%>, TreeViewRef<%=/isTypeScript%> } from 'devextreme-react/tree-view';
import * as events from 'devextreme-react/common/core/events';
import { navigation } from '@/app-navigation';
import { usePathname } from 'next/navigation';
import { useScreenSize } from '@/utils/media-query';
import './SideNavigationMenu.scss';
<%=#isTypeScript%>import type { SideNavigationMenuProps } from '@/types';
<%=/isTypeScript%>import { ThemeContext } from '@/theme';

export default function SideNavigationMenu(props<%=#isTypeScript%>: React.PropsWithChildren<SideNavigationMenuProps><%=/isTypeScript%>) {
  const {
    children,
    selectedItemChanged,
    openMenu,
    compactMode,
    onMenuReady
  } = props;

  const theme = useContext(ThemeContext);
  const { isLarge } = useScreenSize();
  function normalizePath () {
    return navigation.map((item) => (
      { ...item, expanded: isLarge, path: item.path && !(/^\//.test(item.path)) ? `/${item.path}` : item.path }
    ))
  }

  const items = useMemo(
    normalizePath,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const pathname = usePathname();

  const treeViewRef = useRef<%=#isTypeScript%><TreeViewRef><%=/isTypeScript%>(null);
  const wrapperRef = useRef<%=#isTypeScript%><HTMLDivElement><%=/isTypeScript%>(null);
  const getWrapperRef = useCallback((element<%=#isTypeScript%>: HTMLDivElement<%=/isTypeScript%>) => {
    const prevElement = wrapperRef.current;
    if (prevElement) {
      events.off(prevElement, 'dxclick');
    }

    wrapperRef.current = element;
    events.on(element, 'dxclick', (e<%=#isTypeScript%>: React.PointerEvent<%=/isTypeScript%>) => {
      openMenu(e);
    });
  }, [openMenu]);

  useEffect(() => {
    const treeView = treeViewRef.current && treeViewRef.current.instance();
    if (!treeView) {
      return;
    }

    if (pathname !== undefined) {
      treeView.selectItem(pathname);
      treeView.expandItem(pathname);
    }

    if (compactMode) {
      treeView.collapseAll();
    }
  }, [pathname, compactMode]);

  return (
    <div
      className={`dx-swatch-additional${theme?.isDark() ? '-dark' : ''} side-navigation-menu`}
      ref={getWrapperRef}
    >
      {children}
      <div className={'menu-container'}>
        <TreeView
          ref={treeViewRef}
          items={items}
          keyExpr={'path'}
          selectionMode={'single'}
          focusStateEnabled={false}
          expandEvent={'click'}
          onItemClick={selectedItemChanged}
          onContentReady={onMenuReady}
          width={'100%'}
        />
      </div>
    </div>
  );
}
