import 'scss/App.scss';

import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import Home from 'pages/Home';
import NotFound from 'pages/NotFound';

import Error from 'components/Error';
import Header from 'components/Header';
import RouteError from 'components/RouteError';

const Layout = () => {
  return (
    <div className='app'>
      <Header />
      <Error />
      <div className='page'>
        <Outlet />
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
