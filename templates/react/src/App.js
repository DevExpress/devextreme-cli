import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import { navigation } from './app-navigation';
import appInfo from './app-info';
import routes from './app-routes';

import './App.scss';
import {
  // SideNavOuterToolbar,
  <%=layout%>,
  SingleCard
} from './layouts';
import { Footer, LoginForm } from './components';
import UserContext from './user-context';
import { sizes, subscibe, unsibscribe } from './utils/media-query';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: true,
      screenSizeClass: this.getScreenSizeClass()
    };
  }

  componentDidMount() {
    subscibe(this.screenSizeChanged);
  }

  componentWillUnmount() {
    unsibscribe(this.screenSizeChanged);
  }

  render() {
    const auth = {
      logOut: this.logOut,
      loggedIn: this.state.loggedIn
    };

    const LoginContainer = () => <LoginForm onLoginClick={this.logIn} />;

    const NotAuthPage = () => (
      <SingleCard>
        <Route path={'/'} component={LoginContainer} />
      </SingleCard>
    );

    const AuthPage = () => (
      <<%=layout%> menuItems={navigation} title={appInfo.title}>
        <Switch>
          {routes.map(item => (
            <Route
              exact
              key={item.path}
              path={item.path}
              component={item.component}
            />
          ))}
          <Redirect exact path={'/'} to={'/home'} />
        </Switch>
        <Footer>
          Copyright © 2011-2019 Developer Express Inc.
          <br />
          All trademarks or registered trademarks are property of their
          respective owners.
        </Footer>
      </<%=layout%>>
    );

    const classes = `app ${ this.state.screenSizeClass }`;
    return (
      <div className={classes}>
        <UserContext.Provider value={auth}>
          <Router>{auth.loggedIn ? <AuthPage /> : <NotAuthPage />}</Router>
        </UserContext.Provider>
      </div>
    );
  }

  getScreenSizeClass() {
    const screenSizes = sizes();
    return Object.keys(screenSizes).filter(cl => screenSizes[cl]).join(' ');
  }

  screenSizeChanged = () => {
    this.setState({
      screenSizeClass: this.getScreenSizeClass()
    });
  }

  logIn = () => {
    this.setState({ loggedIn: true });
  };

  logOut = () => {
    this.setState({ loggedIn: false });
  };
}

export default App;
