import { withNavigationWatcher } from './contexts/navigation';
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

routes.forEach(route => {
  route.component = withNavigationWatcher(route.component);
});

export default routes;
