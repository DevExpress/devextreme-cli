import React from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import UserPanel from '../user-panel/user-panel';
import UserContext from '../..//user-context';
import './header.scss';

const Header = ({ menuToggleEnabled, title, toggleMenu, logOut }) => {
  const userMenuItems = [
    {
      text: 'Profile',
      icon: 'user'
    },
    {
      text: 'Logout',
      icon: 'runner',
      onClick: logOut
    }
  ];

  const menutoggleComponent = menuToggleEnabled ? (
    <Item
      location={'before'}
      widget={'dxButton'}
      cssClass={'menu-button'}
      options={{
        icon: 'menu',
        stylingMode: 'text',
        onClick: toggleMenu
      }}
    />
  ) : (
    <></>
  );

  const titleComponent = title ? (
    <Item location={'before'} cssClass={'header-title'} text={title} />
  ) : (
    <></>
  );

  const userMenuComponent = () => (
    <UserPanel menuItems={userMenuItems} menuMode={'list'} />
  );

  return (
    <header className={'header-component'}>
      <Toolbar className={'header-toolbar'}>
        {menutoggleComponent}
        {titleComponent}
        <Item
          location={'after'}
          locateInMenu={'auto'}
          menuItemComponent={userMenuComponent}
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
      </Toolbar>
    </header>
  );
};

export default (props) => {
  return (
    <UserContext.Consumer>
      { value => <Header {...props} logOut={value.logOut} />}
    </UserContext.Consumer>
  );
};
