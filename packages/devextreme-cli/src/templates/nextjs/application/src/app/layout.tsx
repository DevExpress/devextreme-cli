'use client'

import { usePathname } from 'next/navigation';
import LoadPanel from 'devextreme-react/load-panel';
import { AuthProvider, useAuth} from '@/contexts/auth';
import { NavigationProvider } from '@/contexts/navigation';
import { ThemeContext, useThemeContext} from "@/theme";

function Page({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadPanel visible={true} />;
  }

  return children;
}

export default function RootLayout({ children }) {
  const themeContext = useThemeContext();
  const pathname  = usePathname ();

  return (
    <html lang="en">
    <title>NextJs Dx App</title>
      <body className="dx-viewport">
        <ThemeContext.Provider value={themeContext}>
          <AuthProvider>
            <NavigationProvider>
              <div className='app'>
                <Page key={pathname}>{children}</Page>
              </div>
            </NavigationProvider>
          </AuthProvider>
        </ThemeContext.Provider>
        </body>
    </html>
  );
}
