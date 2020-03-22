import React, { createContext, useEffect, useContext } from 'react';

export const NavigationContext = createContext();

export function withNavigationWatcher(WrappedComponent) {
  return function (props) {
    const { path } = props.match;
    const { setNavigationData } = useContext(NavigationContext);
    
    useEffect(() => {
      setNavigationData({ currentPath: path });
    }, [path, setNavigationData]);

    return <WrappedComponent {...props} />
  }
}
