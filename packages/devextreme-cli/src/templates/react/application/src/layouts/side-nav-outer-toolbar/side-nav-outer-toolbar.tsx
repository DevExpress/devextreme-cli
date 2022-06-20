import Drawer from 'devextreme-react/drawer';
import ScrollView from 'devextreme-react/scroll-view';
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Header, SideNavigationMenu, Footer } from '../../components';
import './side-nav-outer-toolbar.scss';
import { useScreenSize } from '../../utils/media-query';
import { Template } from 'devextreme-react/core/template';
import { useMenuPatch } from '../../utils/patches';
<%=#isTypeScript%>import { ClickEvent } from 'devextreme/ui/button';<%=/isTypeScript%>
<%=#isTypeScript%>import { ItemClickEvent } from 'devextreme/ui/tree_view';<%=/isTypeScript%>
<%=#isTypeScript%>import type { SideNavToolbarProps } from '../../types';<%=/isTypeScript%>

export default function SideNavOuterToolbar({ title, children }<%=#isTypeScript%>: React.PropsWithChildren<SideNavToolbarProps><%=/isTypeScript%>) {
  const scrollViewRef = useRef<%=#isTypeScript%><ScrollView><%=/isTypeScript%>(null);
  const navigate = useNavigate();
  const { isXSmall, isLarge } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const [menuStatus, setMenuStatus] = useState(
    isLarge ? MenuStatus.Opened : MenuStatus.Closed
  );

  const toggleMenu = useCallback(({ event }<%=#isTypeScript%>: ClickEvent<%=/isTypeScript%>) => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.Opened
        : MenuStatus.Closed
    );
    event<%=#isTypeScript%>?<%=/isTypeScript%>.stopPropagation();
  }, []);

  const temporaryOpenMenu = useCallback(() => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.TemporaryOpened
        : prevMenuStatus
    );
  }, []);

  const onOutsideClick = useCallback(() => {
    setMenuStatus(
      prevMenuStatus => prevMenuStatus !== MenuStatus.Closed && !isLarge
        ? MenuStatus.Closed
        : prevMenuStatus
    );
    return true;
  }, [isLarge]);

  const onNavigationChanged = useCallback(({ itemData, event, node }<%=#isTypeScript%>: ItemClickEvent<%=/isTypeScript%>) => {
    if (menuStatus === MenuStatus.Closed || !itemData<%=#isTypeScript%>?<%=/isTypeScript%>.path || node<%=#isTypeScript%>?<%=/isTypeScript%>.selected) {
      event<%=#isTypeScript%>?<%=/isTypeScript%>.preventDefault();
      return;
    }

    navigate(itemData.path);
    scrollViewRef.current<%=#isTypeScript%>?<%=/isTypeScript%>.instance.scrollTo(0);

    if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
      setMenuStatus(MenuStatus.Closed);
      event<%=#isTypeScript%>?<%=/isTypeScript%>.stopPropagation();
    }
  }, [navigate, menuStatus, isLarge]);

  return (
    <div className={'side-nav-outer-toolbar'}>
      <Header
        menuToggleEnabled
        toggleMenu={toggleMenu}
        title={title}
      />
      <Drawer
        className={['drawer', patchCssClass].join(' ')}
        position={'before'}
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge ? 'shrink' : 'overlap'}
        revealMode={isXSmall ? 'slide' : 'expand'}
        minSize={isXSmall ? 0 : 60}
        maxSize={250}
        shading={isLarge ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template={'menu'}
      >
        <div className={'container'}>
          <ScrollView ref={scrollViewRef} className={'layout-body with-footer'}>
            <div className={'content'}>
              {React.Children.map(children, (item<%=#isTypeScript%>: any<%=/isTypeScript%>) => {
                return item.type !== Footer && item;
              })}
            </div>
            <div className={'content-block'}>
              {React.Children.map(children, (item<%=#isTypeScript%>: any<%=/isTypeScript%>) => {
                return item.type === Footer && item;
              })}
            </div>
          </ScrollView>
        </div>
        <Template name={'menu'}>
          <SideNavigationMenu
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={temporaryOpenMenu}
            onMenuReady={onMenuReady}
          >
          </SideNavigationMenu>
        </Template>
      </Drawer>
    </div>
  );
}

const MenuStatus = {
  Closed: 1,
  Opened: 2,
  TemporaryOpened: 3
};
