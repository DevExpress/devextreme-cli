import React, { useState, useEffect, createContext, useContext } from 'react';
import getUser from '../api/get-user';

function AuthProvider(props) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve user data on initial load
    const result = getUser();
    if (result.isOk) {
      setUser(result.data);
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }} {...props} />
  );
}

const AuthContext = createContext({});
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth }
