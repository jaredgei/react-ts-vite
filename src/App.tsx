import { useContext } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import 'scss/App.scss';

import { ErrorContext } from 'context/Error';

import Home from 'pages/Home';
import NotFound from 'pages/NotFound';

import Error from 'components/Error';
import Header from 'components/Header';

function App() {
  const { error } = useContext(ErrorContext);

  const router = createBrowserRouter([{
    path: '/',
    element: (
      <div className='app'>
        <Header />
        <Error error={error} />
        <div className='page'><Outlet /></div>
      </div>
    ),
    errorElement: <NotFound />,
    children: [{
      path: '/',
      element: <Home />
    }]
  }]);

  return <RouterProvider router={router} />;
}

export default App;
