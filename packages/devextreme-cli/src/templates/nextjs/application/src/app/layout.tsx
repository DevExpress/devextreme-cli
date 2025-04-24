<%=#isTypeScript%>import type { PropsWithChildren } from 'react';
<%=/isTypeScript%>import { ThemeProvider } from "@/theme";

export default function RootLayout({ children }<%=#isTypeScript%>: PropsWithChildren<object><%=/isTypeScript%>) {
  return (
    <html lang="en">
    <title>NextJs Dx App</title>
      <body className="dx-viewport">
        <ThemeProvider>
          <div className='app'>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
