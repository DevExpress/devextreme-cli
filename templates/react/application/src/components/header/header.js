import React from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import UserPanel from '../user-panel/user-panel';
import './header.scss';
import { Template } from 'devextreme-react/core/template';

export default ({ menuToggleEnabled, title, toggleMenu, userMenuItems }) => (
  <header className={'header-component'}>
    <Toolbar className={'header-toolbar'}>
      <Item
        visible={menuToggleEnabled}
        location={'before'}
        widget={'dxButton'}
        cssClass={'menu-button'}
        options={{
          icon: 'menu',
          stylingMode: 'text',
          onClick: toggleMenu
        }}
      />
      <Item
        location={'before'}
        cssClass={'header-title'}
        text={title}
        visible={!!title}
      />
      <Item
        location={'after'}
        locateInMenu={'auto'}
        menuItemTemplate={'userPanelTemplate'}
      >
        <Button
          className={'user-button authorization'}
          width={170}
          height={'100%'}
          stylingMode={'text'}
        >
          <UserPanel menuItems={userMenuItems} menuMode={'context'} />
        </Button>
      </Item>
      <Template name={'userPanelTemplate'}>
        <UserPanel menuItems={userMenuItems} menuMode={'list'} />
      </Template>
    </Toolbar>
  </header>
);

