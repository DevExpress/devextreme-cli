import React, { useContext, useEffect } from 'react';
import { NavigationContext } from './navigation';

const useNavigation = () => useContext(NavigationContext);

function withNavigationWatcher(Component<%=#isTypeScript%>: React.ElementType<%=/isTypeScript%>, path<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  const WrappedComponent = function (props<%=#isTypeScript%>: Record<string, unknown><%=/isTypeScript%>) {
    const { setNavigationData } = useNavigation();

    useEffect(() => {
      setNavigationData<%=#isTypeScript%>!<%=/isTypeScript%>({ currentPath: path });
    }, [setNavigationData]);

    return <Component {...props} />;
  }
  return <WrappedComponent />;
}

export {
  useNavigation,
  withNavigationWatcher
}
