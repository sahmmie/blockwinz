import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoutes from './ProtectedRoutes';
import useAuth from '@/hooks/useAuth';
import useAccountStore from '@/hooks/userAccount';

const showLoginModal = vi.fn();
const useWalletQuery = vi.fn();

vi.mock('@/shared/utils/authModalHandler', () => ({
  showLoginModal: () => showLoginModal(),
}));

vi.mock('@/hooks/useWalletState', () => ({
  useWalletQuery: (...args: unknown[]) => useWalletQuery(...args),
}));

describe('ProtectedRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.setState({
      token: null,
      isAuthenticated: false,
      hasBootstrapped: true,
      isBootstrapping: false,
    });
    useAccountStore.setState({
      userData: null,
      fetchProfileData: vi.fn().mockResolvedValue(null),
      setAccountData: vi.fn(),
    });
  });

  it('does not render protected content when there is no token', async () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path='/protected' element={<div>Private Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Private Page')).not.toBeInTheDocument();
    await waitFor(() => expect(showLoginModal).toHaveBeenCalled());
  });

  it('renders protected content when bootstrapped and authenticated', async () => {
    const fetchProfileData = vi.fn().mockResolvedValue({ _id: 'user-1' });
    useAuth.setState({
      token: 'token',
      isAuthenticated: true,
      hasBootstrapped: true,
      isBootstrapping: false,
    });
    useAccountStore.setState({
      userData: null,
      fetchProfileData,
      setAccountData: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path='/protected' element={<div>Private Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Private Page')).toBeInTheDocument();
    await waitFor(() => expect(fetchProfileData).toHaveBeenCalled());
  });
});
