import React, { Component } from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import appInfo from './app-info';
import { navigation } from './app-navigation';
import routes from './app-routes';
import './App.scss';
import './dx-styles.scss';
import { Footer, LoginForm } from './components';
import {
  <%=layout%>,
  SingleCard
} from './layouts';
import UserContext from './user-context';
import { sizes, subscibe, unsibscribe } from './utils/media-query';

const LoginContainer = ({ logIn }) => <LoginForm onLoginClick={logIn} />;

const NotAuthPage = (props) => (
  <SingleCard>
    <Route render={() => <LoginContainer {...props} />} />
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
      ))}<%=^empty%>
      <Redirect to={'/home'} /><%=/empty%>
    </Switch>
    <Footer>
      Copyright © 2011-2019 Developer Express Inc.
      <br />
      All trademarks or registered trademarks are property of their
      respective owners.
    </Footer>
  </<%=layout%>>
);

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

    const classes = `app ${this.state.screenSizeClass}`;
    return (
      <div className={classes}>
        <UserContext.Provider value={auth}>
          <Router>{auth.loggedIn ? <AuthPage /> : <NotAuthPage logIn={this.logIn} />}</Router>
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
