import React from 'react';
import { Switch, Route<%=^empty%>, Redirect<%=/empty%> } from 'react-router-dom';
import appInfo from './app-info';
import routes from './app-routes';
import { <%=layout%> as SideNavBarLayout } from './layouts';
import { Footer } from './components';

export default function() {
  return (
    <SideNavBarLayout title={appInfo.title}>
      <Switch>
        {routes.map(({ path, component }) => (
          <Route
            exact
            key={path}
            path={path}
            component={component}
          />
        ))}<%=^empty%>
        <Redirect to={'/home'} /><%=/empty%>
      </Switch>
      <Footer>
        Copyright © 2011-{new Date().getFullYear()} {appInfo.title} Inc.
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </Footer>
    </SideNavBarLayout>
  );
}
