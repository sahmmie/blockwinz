import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoutes from '@/guards/ProtectedRoutes';
import usePageData from '@/hooks/usePageData';
import './App.css';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Logout from './pages/Logout/Logout';
import Chatwoot from '@/components/Chatwoot/Chatwoot';
import { APP_ENV, WAITLIST_LAUNCH_DATE } from './shared/constants/app.constant';
import PageNotFound from './pages/404/PageNotFound';
import { registerLoginModalOpener } from './shared/utils/authModalHandler';
import useModal from '@/hooks/useModal';
import RouteLoadingBar from './components/RouteLoadingBar/RouteLoadingBar';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import useAuth from '@/hooks/useAuth';

// Lazy load pages
const Home = lazy(() => import('@/pages/Home/Home'));
const Games = lazy(() => import('@/pages/Games/Games'));
const Favourites = lazy(() => import('@/pages/Favourites/Favourite'));
const Challenges = lazy(() => import('@/pages/Challenges/Challenge'));
const NewReleases = lazy(() => import('@/pages/NewReleases/NewRelease'));
const AccountSettings = lazy(
  () => import('@/pages/AccountSettings/AccountSettings'),
);
const BetHistory = lazy(() => import('@/pages/BetHistory/BetHistory'));
const Transactions = lazy(() => import('@/pages/Transaction/Transactions'));
const ProvablyFair = lazy(() => import('./pages/ProvablyFair/ProvablyFair'));
const ProfileDetails = lazy(() => import('./pages/Profile/ProfileDetails'));
const Vault = lazy(() => import('./pages/Vault/Vault'));
const Referral = lazy(() => import('./pages/Referrals/Referrals'));
const RewardLoyalty = lazy(() => import('./pages/RewardLoyalty/RewardLoyalty'));
const WaitlistPage = lazy(() => import('./pages/WaitlistPage'));
const Providers = lazy(() => import('./pages/Providers/Providers'));
const Affiliate = lazy(() => import('./pages/Affiliate/Affiliate'));
const Lobbies = lazy(() => import('./pages/Lobbies/Lobbies'));

// Lazy load house games
const CasinoGame = lazy(() => import('./casinoGames/CasinoGame'));
const Limbo = lazy(() => import('@/casinoGames/limbo/Limbo'));
const Dice = lazy(() => import('@/casinoGames/dice/Dice'));
const Tictactoe = lazy(() => import('@/casinoGames/tictactoes/Tictactoe'));
const Mines = lazy(() => import('@/casinoGames/mines/Mine'));
const Keno = lazy(() => import('@/casinoGames/keno/Keno'));
const Wheel = lazy(() => import('@/casinoGames/wheel/WheelGame'));
const PlinkoGame = lazy(() => import('@/casinoGames/plinko/pages/PlinkoGame'));
const CoinFlipGame = lazy(() => import('@/casinoGames/coinflip/CoinFlipGame'));

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useAuth
      .getState()
      .bootstrapSession()
      .finally(() => setReady(true));
  }, []);
  if (!ready) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
}

function App() {
  const { title } = usePageData();
  const isProd = APP_ENV === 'prod';
  const showProdWaitlist =
    isProd && Boolean(WAITLIST_LAUNCH_DATE?.trim());
  const { openModal } = useModal();

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    registerLoginModalOpener(openModal);
  }, [openModal]);

  if (showProdWaitlist) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <WaitlistPage />
      </Suspense>
    );
  }

  return (
    <SessionBootstrap>
      <RouteLoadingBar />
      <Suspense fallback={<LoadingScreen />}>
        <Chatwoot />
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/games' element={<Games />} />
            <Route path='/challenges' element={<Challenges />} />
            <Route path='/new-releases' element={<NewReleases />} />
            <Route path='/provably-fair' element={<ProvablyFair />} />
            <Route path='/verify-email' element={<VerifyEmail />} />
            <Route path='/terms' element={<TermsOfService />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/providers' element={<Providers />} />
            <Route path='/affiliate' element={<Affiliate />} />

            <Route element={<ProtectedRoutes />}>
              <Route path='' element={<AccountSettings />}>
                <Route element={<BetHistory />} path='/bet-history' />
                <Route element={<Transactions />} path='/transactions' />
                <Route
                  element={<RewardLoyalty />}
                  path='/rewards-and-loyalty'
                />
                <Route element={<Referral />} path='/referral' />
                <Route element={<Vault />} path='/vault' />
                <Route element={<ProfileDetails />} path='/profile' />
              </Route>
              <Route path='/favourites' element={<Favourites />} />
              <Route path='/lobbies' element={<Lobbies />} />
              <Route path='originals' element={<CasinoGame />}>
                <Route path='limbo' element={<Limbo />} />
                <Route path='dice' element={<Dice />} />
                <Route path='tictactoe' element={<Tictactoe />} />
                <Route path='mines' element={<Mines />} />
                <Route path='keno' element={<Keno />} />
                <Route path='plinko' element={<PlinkoGame />} />
                <Route path='wheel' element={<Wheel />} />
                <Route path='coin-flip' element={<CoinFlipGame />} />
              </Route>

              <Route path='multiplayer' element={<CasinoGame />}>
                <Route path='tictactoe' element={<Tictactoe />} />
              </Route>

              <Route path='logout' element={<Logout />} />
            </Route>

            <Route element={<PageNotFound />} path='*' />
          </Route>
        </Routes>
      </Suspense>
    </SessionBootstrap>
  );
}

export default App;
