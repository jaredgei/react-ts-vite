import { Outlet } from 'react-router';

import { useAuth } from '@/context/Auth';

import Error from '@/components/Error';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';

const Layout = () => {
  const { loading } = useAuth();

  return (
    <div className='app'>
      <Header />
      <Error />
      <div className='page'>
        {loading ? (
          <div className='loadingContainer'>
            <Spinner />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default Layout;
