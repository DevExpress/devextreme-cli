import Drawer from 'devextreme-react/drawer';
import { ScrollView<%=#isTypeScript%>, type ScrollViewRef<%=/isTypeScript%> } from 'devextreme-react/scroll-view';
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, SideNavigationMenu, Footer } from '../../components';
import './side-nav-outer-toolbar.scss';
import { useScreenSize } from '../../utils/media-query';
import { Template } from 'devextreme-react/core/template';
import { useMenuPatch } from '../../utils/patches';
<%=#isTypeScript%>import type { ButtonTypes } from 'devextreme-react/button';<%=/isTypeScript%>
<%=#isTypeScript%>import type { TreeViewTypes } from 'devextreme-react/tree-view';<%=/isTypeScript%>
<%=#isTypeScript%>import type { SideNavToolbarProps } from '../../types';<%=/isTypeScript%>

export default function SideNavOuterToolbar({ title, children }<%=#isTypeScript%>: React.PropsWithChildren<SideNavToolbarProps><%=/isTypeScript%>) {
  const scrollViewRef = useRef<%=#isTypeScript%><ScrollViewRef><%=/isTypeScript%>(null);
  const navigate = useNavigate();
  const { isXSmall, isLarge } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const [menuStatus, setMenuStatus] = useState(
    isLarge ? MenuStatus.Opened : MenuStatus.Closed
  );

  const toggleMenu = useCallback(({ event }<%=#isTypeScript%>: ButtonTypes.ClickEvent<%=/isTypeScript%>) => {
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
    return menuStatus === MenuStatus.Closed ? true : false;
  }, [isLarge, menuStatus]);

  const onNavigationChanged = useCallback(({ itemData, event, node }<%=#isTypeScript%>: TreeViewTypes.ItemClickEvent<%=/isTypeScript%>) => {
    if (menuStatus === MenuStatus.Closed || !itemData<%=#isTypeScript%>?<%=/isTypeScript%>.path || node<%=#isTypeScript%>?<%=/isTypeScript%>.selected) {
      event<%=#isTypeScript%>?<%=/isTypeScript%>.preventDefault();
      return;
    }

    navigate(itemData.path);
    scrollViewRef.current<%=#isTypeScript%>?<%=/isTypeScript%>.instance().scrollTo(0);

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
        className={['drawer layout-body', patchCssClass].join(' ')}
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
          <ScrollView ref={scrollViewRef} className={'with-footer'}>
            <div className={'content'}>
              {React.Children.map(children, (item) => {
                if (<%=#isTypeScript%>React.isValidElement(item) && <%=/isTypeScript%>item.type !== Footer) {
                  return item;
                }
                return null;
              })}
            </div>
            <div className={'content-block'}>
              {React.Children.map(children, (item) => {
                if (<%=#isTypeScript%>React.isValidElement(item) && <%=/isTypeScript%>item.type === Footer) {
                  return item;
                }
                return null;
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
