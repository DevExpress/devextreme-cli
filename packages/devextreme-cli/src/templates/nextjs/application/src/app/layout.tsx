'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LoadPanel from 'devextreme-react/load-panel';
import { AuthProvider, useAuth} from '../contexts/auth';
import { NavigationProvider } from '../contexts/navigation';
import { useScreenSizeClass } from '../utils/media-query';
import { ThemeContext, useThemeContext} from "../theme";
import Content from "../Content";

function Page({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadPanel visible={true} />;
  } else if (user) {
    return <Content>{children}</Content>;
  }

  return children;
}

export default function RootLayout({ children }) {
  const screenSizeClass = useScreenSizeClass();
  const themeContext = useThemeContext();

  const pathname  = usePathname ();
  const router = useRouter();

  useEffect(() => {
    if(pathname === '/') {
      router.push('/pages/home')
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body class="dx-viewport">
        <ThemeContext.Provider value={themeContext}>
          <AuthProvider>
            <NavigationProvider>
              <div className={`app ${screenSizeClass}`}>
                <Page key={pathname}>{children}</Page>
              </div>
            </NavigationProvider>
          </AuthProvider>
        </ThemeContext.Provider>
        </body>
    </html>
  );
}
