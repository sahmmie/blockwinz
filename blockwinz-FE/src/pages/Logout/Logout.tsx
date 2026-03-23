import useAuth from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { FunctionComponent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {}

const Logout: FunctionComponent<LogoutProps> = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const t = useAuth.getState().token;
      if (t) {
        try {
          await axiosInstance.get('/authentication/logout');
        } catch {
          /* still clear client state */
        }
      }
      setToken(null);
      navigate('/login', { replace: true, state: { from: location.pathname } });
    };
    void run();
  }, [navigate, setToken]);

  return <></>;
};

export default Logout;
