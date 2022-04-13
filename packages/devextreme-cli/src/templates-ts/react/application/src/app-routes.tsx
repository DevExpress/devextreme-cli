import { withNavigationWatcher } from './contexts/navigation';<%=^empty%>
import { HomePage, TasksPage, ProfilePage } from './pages';<%=/empty%>

const routes = [<%=^empty%>
  {
    path: '/tasks',
    component: TasksPage
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
