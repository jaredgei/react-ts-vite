import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/context/Auth';

const GuestRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to='/' replace /> : <Outlet />;
};

export default GuestRoute;
