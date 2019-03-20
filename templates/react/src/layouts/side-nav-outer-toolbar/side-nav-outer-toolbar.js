import Drawer from 'devextreme-react/ui/drawer';
import ScrollView from 'devextreme-react/ui/scroll-view';
import React from 'react';
import { withRouter } from 'react-router';
import { Header, SideNavigationMenu, Footer } from '../../components';
import './side-nav-outer-toolbar.scss';
import { sizes, subscibe, unsibscribe } from '../../utils/media-query';

class SideNavOuterToolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpened: sizes()['screen-large'],
      temporaryMenuOpened: false,
      ...this.drawerConfig
    };
  }

  render() {
    const { menuItems, title, location } = this.props;
    const {
      menuOpened,
      menuMode,
      shaderEnabled,
      menuRevealMode,
      minMenuSize
    } = this.state;

    const menu = () => (
      <SideNavigationMenu
        items={menuItems}
        compactMode={!menuOpened}
        selectedItem={location.pathname}
        className={'dx-swatch-additional'}
        selectedItemChanged={this.navigationChanged}
        openMenu={this.navigationClick}
      />
    );

    return (
      <div className={'side-nav-outer-toolbar'}>
        <Header
          className={'layout-header'}
          menuToggleEnabled
          toggleMenu={() =>
            this.setState({ menuOpened: !this.state.menuOpened })
          }
          title={title}
        />

        <Drawer
          className={'layout-body'}
          position={'before'}
          closeOnOutsideClick={this.closeDrawer}
          openedStateMode={menuMode}
          revealMode={menuRevealMode}
          minSize={minMenuSize}
          shading={shaderEnabled}
          opened={menuOpened}
          component={menu}
        >
          <ScrollView className={'with-footer'}>
            <div className={'content'}>
              {React.Children.map(this.props.children, item => {
                return item.type !== Footer && item;
              })}
            </div>
            <div className={'content-block'}>
              {React.Children.map(this.props.children, item => {
                return item.type === Footer && item;
              })}
            </div>
          </ScrollView>
        </Drawer>
      </div>
    );
  }

  componentDidMount() {
    subscibe(this.updateDrawer);
  }

  componentWillUnmount() {
    unsibscribe(this.updateDrawer);
  }

  closeDrawer = () => {
    if (!this.state.shaderEnabled) {
      return false;
    }

    this.setState({ menuOpened: false });
    return true;
  }

  updateDrawer = () => {
    this.setState({ ...this.drawerConfig });
  };

  get drawerConfig() {
    const isXSmall = sizes()['screen-x-small'];
    const isLarge = sizes()['screen-large'];

    return {
      menuMode: isLarge ? 'shrink' : 'overlap',
      menuRevealMode: isXSmall ? 'slide' : 'expand',
      minMenuSize: isXSmall ? 0 : 60,
      shaderEnabled: !isLarge
    };
  }

  get hideMenuAfterNavigation() {
    const { menuMode, temporaryMenuOpened } = this.state;
    return menuMode === 'overlap' || temporaryMenuOpened;
  }

  navigationChanged = event => {
    const path = event.itemData.path;
    const pointerEvent = event.event;

    if (path && this.state.menuOpened) {
      if (event.node.selected) {
        pointerEvent.preventDefault();
      } else {
        this.props.history.push(path);
      }

      if (this.hideMenuAfterNavigation) {
        this.setState({
          menuOpened: false,
          temporaryMenuOpened: false
        });
        pointerEvent.stopPropagation();
      }
    } else {
      pointerEvent.preventDefault();
    }
  };

  navigationClick = () => {
    this.setState(({ menuOpened }) => {
      return !menuOpened
        ? {
          temporaryMenuOpened: true,
          menuOpened: true
        }
        : {};
    });
  };
}

export default withRouter(SideNavOuterToolbar);
