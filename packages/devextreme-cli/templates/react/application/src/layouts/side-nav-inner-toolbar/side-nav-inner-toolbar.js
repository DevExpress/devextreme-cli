import Button from 'devextreme-react/button';
import Drawer from 'devextreme-react/drawer';
import ScrollView from 'devextreme-react/scroll-view';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import React, { useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router';
import { Header, SideNavigationMenu, Footer } from '../../components';
import './side-nav-inner-toolbar.scss';
import { useScreenSize, ScreenSize } from '../../utils/media-query';
import { Template } from 'devextreme-react/core/template';
import { useMenuPatch } from '../../utils/patches';

export default function (props) {
  const scrollViewRef = useRef();
  const history = useHistory();
  const screenSize = useScreenSize();
  const [menuStatus, setMenuStatus] = useState(
    screenSize === ScreenSize.Large ? MenuStatus.Opened : MenuStatus.Closed
  );
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const toggleMenu = useCallback(({ event }) => {
    if (menuStatus === MenuStatus.Closed) {
      setMenuStatus(MenuStatus.Opened);
    } else {
      setMenuStatus(MenuStatus.Closed);
    }
    event.stopPropagation();
  }, [menuStatus]);
  const onMenuClick = useCallback(() => {
    if (menuStatus === MenuStatus.Closed) {
      setMenuStatus(MenuStatus.TemporaryOpened);
    }
  }, [menuStatus]);
  const onOutsideClick = useCallback(() => {
    if (menuStatus === MenuStatus.Closed || screenSize === ScreenSize.Large) {
      return false;
    }
    setMenuStatus(MenuStatus.Closed);
    return true;
  }, [menuStatus, screenSize]);

  const onNavigationChanged = useCallback(({ itemData: { path }, event, node }) => {
    if (menuStatus === MenuStatus.Closed || !path || node.selected) {
      event.preventDefault();
      return;
    }

    history.push(path);
    scrollViewRef.current.instance.scrollTo(0);

    if (screenSize !== screenSize.Large || menuStatus === MenuStatus.TemporaryOpened) {
      setMenuStatus(MenuStatus.Closed);
      event.stopPropagation();
    }
  }, [history, menuStatus, screenSize]);

  return (
    <div className={'side-nav-inner-toolbar'}>
      <Drawer
        className={'drawer' + patchCssClass}
        position={'before'}
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={screenSize === ScreenSize.Large ? 'shrink' : 'overlap'}
        revealMode={screenSize === ScreenSize.XSmall ? 'slide' : 'expand'}
        minSize={screenSize === ScreenSize.XSmall ? 0 : 60}
        maxSize={250}
        shading={screenSize === ScreenSize.Large ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template={'menu'}
      >
        <div className={'container'}>
          <Header
            menuToggleEnabled={screenSize === ScreenSize.XSmall}
            toggleMenu={toggleMenu}
          />
          <ScrollView ref={scrollViewRef} className={'layout-body with-footer'}>
            <div className={'content'}>
              {React.Children.map(props.children, item => {
                return item.type !== Footer && item;
              })}
            </div>
            <div className={'content-block'}>
              {React.Children.map(props.children, item => {
                return item.type === Footer && item;
              })}
            </div>
          </ScrollView>
        </div>
        <Template name={'menu'}>
          <SideNavigationMenu
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={onMenuClick}
            onMenuReady={onMenuReady}
          >
            <Toolbar id={'navigation-header'}>
              {
                screenSize !== ScreenSize.XSmall &&
                <Item
                  location={'before'}
                  cssClass={'menu-button'}
                >
                  <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
                </Item>
              }
              <Item location={'before'} cssClass={'header-title'} text={props.title} />
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
