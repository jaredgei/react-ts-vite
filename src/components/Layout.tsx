import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import ErrorToast from '@/components/ErrorToast';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import VerifyEmailBanner from '@/components/VerifyEmailBanner';

const Layout = () => {
  const { loading, user } = useAuth();
  const { clearError } = useError();
  const { pathname } = useLocation();

  // Cleared on a change of path, not in a cleanup, which also runs whenever the layout remounts and would lose an error just shown.
  const visited = useRef(pathname);

  useEffect(() => {
    if (visited.current === pathname) return;
    visited.current = pathname;
    clearError();
  }, [pathname, clearError]);

  return (
    <div className='app'>
      <Header />
      <ErrorToast />
      <main className='page'>
        {loading ? (
          <Spinner />
        ) : (
          <>
            {user && !user.emailVerifiedAt && pathname !== '/verify-email' && <VerifyEmailBanner email={user.email} />}
            <Outlet />
          </>
        )}
      </main>
    </div>
  );
};

export default Layout;
