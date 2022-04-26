import { HomePage, TasksPage, ProfilePage } from './pages';
import { withNavigationWatcher } from './contexts/navigation';

const routes = [<%=^empty%>
    {
        path: '/tasks',
        element: TasksPage
    },
    {
        path: '/profile',
        element: ProfilePage
    },
    {
        path: '/home',
        element: HomePage
    }
<%=/empty%>];

export default routes.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
