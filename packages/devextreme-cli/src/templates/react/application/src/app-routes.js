import { HomePage, TasksPage, ProfilePage } from './pages';

const routes = [
  {
    path: '/tasks',
    element: <TasksPage />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/home',
    element: <HomePage />
  }
];

export default routes;
