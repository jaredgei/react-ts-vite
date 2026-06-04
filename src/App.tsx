import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import 'scss/App.scss';

import { useError } from 'context/Error';

import Home from 'pages/Home';
import NotFound from 'pages/NotFound';

import Error from 'components/Error';
import Header from 'components/Header';

const Layout = () => {
  const { error } = useError();
  return (
    <div className='app'>
      <Header />
      <Error error={error} />
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
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
