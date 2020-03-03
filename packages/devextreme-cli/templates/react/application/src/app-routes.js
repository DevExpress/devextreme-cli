<%=^empty%>import { HomePage, DisplayDataPage, ProfilePage } from './pages';

<%=/empty%>export default [<%=^empty%>
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
