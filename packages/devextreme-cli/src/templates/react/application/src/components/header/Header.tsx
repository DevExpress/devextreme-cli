import React from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import UserPanel from '../user-panel/UserPanel';
import './Header.scss';
import { Template } from 'devextreme-react/core/template';
import { ThemeSwitcher } from '../theme-switcher/ThemeSwitcher';
<%=#isTypeScript%>import type { HeaderProps } from '../../types';<%=/isTypeScript%>

export default function Header({ menuToggleEnabled, title, toggleMenu }<%=#isTypeScript%>: HeaderProps<%=/isTypeScript%>) {
  return (
    <header className={'header-component'}>
      <Toolbar className={'header-toolbar'}>
        <Item
          visible={menuToggleEnabled}
          location={'before'}
          widget={'dxButton'}
          cssClass={'menu-button'}
        >
          <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
        </Item>
        <Item
          location={'before'}
          cssClass={'header-title'}
          text={title}
          visible={!!title}
        />
        <Item
          location={'after'}
        >
          <ThemeSwitcher />
        </Item>
        <Item location='after' locateInMenu='auto' menuItemTemplate='userPanelTemplate'>
          <UserPanel menuMode='context' />
        </Item>
        <Template name='userPanelTemplate'>
          <UserPanel menuMode='list' />
        </Template>

      </Toolbar>
    </header>
)}
