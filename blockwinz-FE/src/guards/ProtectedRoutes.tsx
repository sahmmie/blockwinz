import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAccountStore from '../hooks/userAccount';
import { useWalletQuery } from '@/hooks/useWalletState';
import { showLoginModal } from '@/shared/utils/authModalHandler';

const ProtectedRoutes = () => {
  const { setToken, token, hasBootstrapped, isBootstrapping } = useAuth();
  const { fetchProfileData } = useAccountStore();
  const navigate = useNavigate();
  useWalletQuery(Boolean(token));

  useEffect(() => {
    if (!hasBootstrapped || isBootstrapping) {
      return;
    }
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
  }, [fetchProfileData, hasBootstrapped, isBootstrapping, navigate, setToken, token]);

  if (!hasBootstrapped || isBootstrapping) {
    return null;
  }

  if (!token) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
