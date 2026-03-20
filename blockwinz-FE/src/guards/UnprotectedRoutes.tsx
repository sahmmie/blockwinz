import {  Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Authentication from '@/pages/Auth/Authentication';

const UnprotectedRoutes = () => {
  const { token } = useAuth();

  return !token ? <Authentication/> : <Navigate to="/" />;
};

export default UnprotectedRoutes;
