import 'scss/App.scss';

import { createBrowserRouter, Navigate, Outlet, RouteObject, RouterProvider } from 'react-router-dom';

import { useAuth } from 'context/Auth';

import Dashboard from 'pages/Dashboard';
import Home from 'pages/Home';
import Login from 'pages/Login';
import NotFound from 'pages/NotFound';
import Register from 'pages/Register';
import UserSettings from 'pages/UserSettings';

import Error from 'components/Error';
import Header from 'components/Header';
import RouteError from 'components/RouteError';
import Spinner from 'components/Spinner';

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

const Index = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Home />;
};

const GuestRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to='/' replace /> : <Outlet />;
};

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to='/' replace />;
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <Index />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/register',
            element: <Register />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/settings',
            element: <UserSettings />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
