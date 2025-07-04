import { useContext } from 'react';
import { AuthContext } from './auth';

const useAuth = () => useContext(AuthContext);

export {
  useAuth
}
