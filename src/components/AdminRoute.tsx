import { Outlet } from 'react-router';

import { useAuth } from '@/context/Auth';

import NotFound from '@/pages/NotFound';

// The server checks the role on every admin request; this only keeps its pages out of sight.
const AdminRoute = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Outlet /> : <NotFound />;
};

export default AdminRoute;
