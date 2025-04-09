import appInfo from '@/app-info';
import { Footer } from '@/components';

export default function Content({children}) {
  return (
    <SideNavBarLayout title={appInfo.title}>
      {children || ''}
      <Footer>
        Copyright © 2011-{new Date().getFullYear()} {appInfo.title} Inc.
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </Footer>
    </SideNavBarLayout>
  );
}
