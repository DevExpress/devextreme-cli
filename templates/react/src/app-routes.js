import { HomePage, DisplayDataPage, ProfilePage } from './pages';

export default [
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
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
