import { useAuth } from '@/context/Auth';

import Dashboard from '@/pages/Dashboard';
import Home from '@/pages/Home';

const Index = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Home />;
};

export default Index;
