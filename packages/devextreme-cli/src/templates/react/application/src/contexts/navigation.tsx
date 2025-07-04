import React, { useState, createContext } from 'react';
<%=#isTypeScript%>import type { NavigationContextType } from '../types';<%=/isTypeScript%>


const NavigationContext = createContext<%=#isTypeScript%><NavigationContextType><%=/isTypeScript%>({}<%=#isTypeScript%> as NavigationContextType<%=/isTypeScript%>);

function NavigationProvider(props<%=#isTypeScript%>: React.PropsWithChildren<unknown><%=/isTypeScript%>) {
  const [navigationData, setNavigationData] = useState({ currentPath: '' });

  return (
    <NavigationContext.Provider
      value={{ navigationData, setNavigationData }}
      {...props}
    />
  );
}

export {
  NavigationProvider,
  NavigationContext,
}
