import '@/styles/App.css';

import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from '@/routes';

const router = createBrowserRouter(routes);

const App = () => <RouterProvider router={router} />;

export default App;
