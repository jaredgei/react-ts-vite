import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/context/Auth';

import { redirectTarget } from '@/utilities/navigation';

const GuestRoute = () => {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Navigate to={redirectTarget(location.state)} replace /> : <Outlet />;
};

export default GuestRoute;
