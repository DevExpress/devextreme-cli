import React, { useEffect } from 'react';
import { useNavigation } from './contexts/navigation';
<%=^empty%>import { HomePage, DisplayDataPage, ProfilePage } from './pages';

<%=/empty%>const routes = [<%=^empty%>
  {
    path: '/display-data',
    component: DisplayDataPage
  },
  {
    path: '/profile',
    component: ProfilePage
  },
  {
    path: '/home',
    component: HomePage
  }
<%=/empty%>];

export default routes.map(route => {
  return {
    ...route,
    component: withNavigationWatcher(route.component)
  };
});

function withNavigationWatcher(Component) {
  return function (props) {
    const { path } = props.match;
    const { setNavigationData } = useNavigation();

    useEffect(() => {
      setNavigationData({ currentPath: path });
    }, [path, setNavigationData]);

    return React.createElement(Component, props);
  }
}
