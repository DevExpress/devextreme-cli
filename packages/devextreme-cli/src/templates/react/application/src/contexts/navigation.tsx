import React, { useState, createContext, useContext, useEffect } from 'react';
<%=#isTypeScript%>import { NavigationContextType } from '../types';<%=/isTypeScript%>

const NavigationContext = createContext<%=#isTypeScript%><NavigationContextType><%=/isTypeScript%>({}<%=#isTypeScript%> as NavigationContextType<%=/isTypeScript%>);
const useNavigation = () => useContext(NavigationContext);

function NavigationProvider(props<%=#isTypeScript%>: React.PropsWithChildren<any><%=/isTypeScript%>) {
  const [navigationData, setNavigationData] = useState({ currentPath: '' });

  return (
    <NavigationContext.Provider
      value={{ navigationData, setNavigationData }}
      {...props}
    />
  );
}

function withNavigationWatcher(Component<%=#isTypeScript%>: any<%=/isTypeScript%>, path<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  const WrappedComponent = function (props<%=#isTypeScript%>: any<%=/isTypeScript%>) {
    const { setNavigationData } = useNavigation();

    useEffect(() => {
      setNavigationData<%=#isTypeScript%>!<%=/isTypeScript%>({ currentPath: path });
    }, [path, setNavigationData]);

    return <Component  {...props} />;
  }
  return <WrappedComponent />;
}

export {
  NavigationProvider,
  useNavigation,
  withNavigationWatcher
}
