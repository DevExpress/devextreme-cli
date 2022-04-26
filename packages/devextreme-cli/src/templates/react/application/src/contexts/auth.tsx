import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getUser, signIn as sendSignInRequest } from '../api/auth';
<%=#isTypeScript%>import { IAuthProviderProps, IUser, IAuthContextType } from '../types';<%=/isTypeScript%>

function AuthProvider(props<%=#isTypeScript%>: IAuthProviderProps<%=/isTypeScript%>) {
  const [user, setUser] = useState<%=#isTypeScript%><IUser><%=/isTypeScript%>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      const result = await getUser();
      if (result.isOk) {
        setUser(result.data);
      }

      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) => {
    const result = await sendSignInRequest(email, password);
    if (result.isOk) {
      setUser(result.data);
    }

    return result;
  }, []);

  const signOut = useCallback(() => {
    setUser(undefined);
  }, []);


  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }} {...props} />
  );
}

const AuthContext = createContext<%=#isTypeScript%><IAuthContextType><%=/isTypeScript%>({ loading: false }<%=#isTypeScript%> as IAuthContextType<%=/isTypeScript%>);
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth }
