<%=#isTypeScript%>import type { PropsWithChildren } from 'react';
<%=/isTypeScript%>import appInfo from '@/app-info';
import { Footer } from '@/components';
import { <%=layout%> as SideNavBarLayout } from '@/layouts';

export default function Content({children}<%=#isTypeScript%>: PropsWithChildren<object><%=/isTypeScript%>) {
  return (
    <SideNavBarLayout title={appInfo.title}>
      {children}
      <Footer>
        Copyright © 2011-{new Date().getFullYear()} {appInfo.title} Inc.
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </Footer>
    </SideNavBarLayout>
  );
}
