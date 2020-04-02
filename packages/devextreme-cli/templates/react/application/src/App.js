import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './App.scss';
import './dx-styles.scss';
import LoadPanel from 'devextreme-react/load-panel';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider, useAuth } from './contexts/auth';
import { useScreenSize } from './utils/media-query';
import AuthenticatedApp from './AuthenticatedApp';
import PublicApp from './PublicApp';

function App() {
  const { user, loading } = useAuth();
  const screenSize = useScreenSize();

  if (loading) {
    return <LoadPanel visible={true} />
  }

  return (
    <div className={`app ${screenSize}`}>
      {
        user ? <AuthenticatedApp /> : <PublicApp />
      }
    </div>
  );
}

export default function () {
  return (
    <Router>
      <AuthProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </AuthProvider>
    </Router>
  );
}
