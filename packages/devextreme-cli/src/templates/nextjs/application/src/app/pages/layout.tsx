'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth';
import appInfo from '@/app-info';
import { Footer } from '@/components';
import { <%=layout%> as SideNavBarLayout } from '@/layouts';

export default function Content({children}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
