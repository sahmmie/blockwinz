import useAuth from '@/hooks/useAuth';
import { FunctionComponent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {}

const Logout: FunctionComponent<LogoutProps> = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setToken(null);
    navigate('/login', { replace: true, state: { from: location.pathname } });
  }, []);

  return <></>;
};

export default Logout;
