'use client'
import Button from 'devextreme-react/button';
import Drawer from 'devextreme-react/drawer';
import { ScrollView<%=#isTypeScript%>, ScrollViewRef<%=/isTypeScript%> } from 'devextreme-react/scroll-view';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header, SideNavigationMenu, Footer } from '@/components';
import './side-nav-inner-toolbar.scss';
import { useScreenSize } from '@/utils/media-query';
import { Template } from 'devextreme-react/core/template';
<%=#isTypeScript%>import type { TreeViewTypes } from 'devextreme-react/tree-view';
import type { SideNavToolbarProps } from '@/types';
import type { ButtonTypes } from 'devextreme-react/button';
<%=/isTypeScript%>
export default function SideNavInnerToolbar({ title, children }<%=#isTypeScript%>: React.PropsWithChildren<SideNavToolbarProps><%=/isTypeScript%>) {
  const scrollViewRef = useRef<%=#isTypeScript%><ScrollViewRef><%=/isTypeScript%>(null);
  const router = useRouter();
  const { isXSmall, isLarge } = useScreenSize();
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

    router.push(itemData.path);
    scrollViewRef.current<%=#isTypeScript%>?<%=/isTypeScript%>.instance().scrollTo(0);

    if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
      setMenuStatus(MenuStatus.Closed);
      event<%=#isTypeScript%>?<%=/isTypeScript%>.stopPropagation();
    }
  }, [router, menuStatus, isLarge]);

  return (
    <div className={'side-nav-inner-toolbar'}>
      <Drawer
        className={'drawer'}
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
          <Header
            menuToggleEnabled={isXSmall}
            toggleMenu={toggleMenu}
          />
          <ScrollView ref={scrollViewRef} className={'layout-body with-footer'}>
            <div className={'content'}>
              {React.Children.map(children, (item) => {
                if (<%=#isTypeScript%>React.isValidElement(item) && <%=/isTypeScript%>item.type !== "footer") {
                  return item;
                }
                return null;
              })}
            </div>
            <div className={'content-block'}>
              {React.Children.map(children, (item) => {
                if (<%=#isTypeScript%>React.isValidElement(item) && <%=/isTypeScript%>item.type === "footer") {
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
          >
            <Toolbar id={'navigation-header'}>
              {
                !isXSmall &&
                <Item
                  location={'before'}
                  cssClass={'menu-button'}
                >
                  <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
                </Item>
              }
              <Item location={'before'} cssClass={'header-title'} text={title} />
            </Toolbar>
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

