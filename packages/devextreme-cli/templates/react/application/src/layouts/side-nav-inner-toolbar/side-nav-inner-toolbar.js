import Button from 'devextreme-react/button';
import Drawer from 'devextreme-react/drawer';
import ScrollView from 'devextreme-react/scroll-view';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import React from 'react';
import { withRouter } from 'react-router';
import { Header, SideNavigationMenu, Footer } from '../../components';
import './side-nav-inner-toolbar.scss';
import { sizes, subscribe, unsubscribe } from '../../utils/media-query';
import { Template } from 'devextreme-react/core/template';
import { menuPreInitPatch } from '../../utils/patches';

class SideNavInnerToolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpened: sizes()['screen-large'],
      temporaryMenuOpened: false,
      ...this.drawerConfig
    };

    this.scrollViewRef = React.createRef();
    this.menuPatch = menuPreInitPatch(this);
  }

  render() {
    const { title } = this.props;
    const {
      menuOpened,
      menuMode,
      shaderEnabled,
      menuRevealMode,
      minMenuSize
    } = this.state;

    return (
      <div className={'side-nav-inner-toolbar'}>
        <Drawer
          className={'drawer' + this.menuPatch.cssClass}
          position={'before'}
          closeOnOutsideClick={this.closeDrawer}
          openedStateMode={menuMode}
          revealMode={menuRevealMode}
          minSize={minMenuSize}
          maxSize={250}
          shading={shaderEnabled}
          opened={menuOpened}
          template={'menu'}
        >
          <div className={'container'}>
            <Header
              menuToggleEnabled={minMenuSize === 0}
              toggleMenu={this.toggleMenu} />

            <ScrollView ref={this.scrollViewRef} className={'layout-body with-footer'}>
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
          </div>
          <Template name={'menu'}>
            <SideNavigationMenu
              compactMode={!menuOpened}
              selectedItemChanged={this.navigationChanged}
              openMenu={this.navigationClick}
              onMenuReady={this.menuPatch.onReady}
            >
              <Toolbar id={'navigation-header'}>
                {
                  minMenuSize !== 0 &&
                  <Item
                    location={'before'}
                    cssClass={'menu-button'}
                    widget={'dxButton'}
                  >
                    <Button icon="menu" stylingMode="text" onClick={this.toggleMenu} />
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

  componentDidMount() {
    subscribe(this.updateDrawer);
  }

  componentWillUnmount() {
    unsubscribe(this.updateDrawer);
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

  toggleMenu = ({ event }) => {
    this.setState(({ menuOpened }) => {
      return { menuOpened: !menuOpened };
    });
    event.stopPropagation();
  };

  get scrollView() {
    return this.scrollViewRef.current.instance;
  }

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
        this.scrollView.scrollTo(0);
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

export default withRouter(SideNavInnerToolbar);
