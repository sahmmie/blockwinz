import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAccountStore from '../hooks/userAccount';
import { useWalletQuery } from '@/hooks/useWalletState';
import { showLoginModal } from '@/shared/utils/authModalHandler';

const ProtectedRoutes = () => {
  const { setToken, token } = useAuth();
  const { fetchProfileData } = useAccountStore();
  const navigate = useNavigate();
  useWalletQuery();

  useEffect(() => {
    if (!token) {
      showLoginModal();
      return;
    }
    fetchProfileData().catch(error => {
      if (error.response?.status === 401) {
        setToken(null);
        showLoginModal();
      }
    });
  }, [token, navigate, setToken, fetchProfileData]);

  return <Outlet />;
};

export default ProtectedRoutes;
