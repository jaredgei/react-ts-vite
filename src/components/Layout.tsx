import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import ErrorBanner from '@/components/ErrorBanner';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';

const Layout = () => {
  const { loading } = useAuth();
  const { clearError } = useError();
  const { pathname } = useLocation();

  useEffect(() => clearError, [pathname, clearError]);

  return (
    <div className='app'>
      <Header />
      <ErrorBanner />
      <main className='page'>
        {loading ? (
          <div className='center'>
            <Spinner />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default Layout;
