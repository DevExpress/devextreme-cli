import React, { useState, createContext, useContext } from 'react';

interface INavigationData {
  currentPath: string;
}

type INavigationContextType = {
  setNavigationData?: ({ currentPath }: INavigationData) => void;
  navigationData: { currentPath: string };
}

const NavigationContext = createContext<INavigationContextType>({} as INavigationContextType);
const useNavigation = () => useContext(NavigationContext);

type NavigationProviderType = {
  children: React.ReactNode;
}

function NavigationProvider(props: NavigationProviderType) {
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
  useNavigation,
}
