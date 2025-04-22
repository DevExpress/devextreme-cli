'use client'

import LoadPanel from 'devextreme-react/load-panel';
import { AuthProvider, useAuth } from '@/contexts/auth';
import { ThemeProvider } from "@/theme";

function Page({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadPanel visible={true} />;
  }

  return children;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <title>NextJs Dx App</title>
      <body className="dx-viewport">
        <ThemeProvider>
          <AuthProvider>
            <div className='app'>
              <Page>{children}</Page>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
