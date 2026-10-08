import { type ComponentType } from 'react';
import { type RouteObject } from 'react-router';

import Layout from '@/components/Layout';
import RouteError from '@/components/RouteError';

const lazy = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: lazy(() => import('@/pages/Index')),
      },
      {
        lazy: lazy(() => import('@/components/GuestRoute')),
        children: [
          {
            path: 'login',
            lazy: lazy(() => import('@/pages/Login')),
          },
          {
            path: 'register',
            lazy: lazy(() => import('@/pages/Register')),
          },
        ],
      },
      {
        lazy: lazy(() => import('@/components/ProtectedRoute')),
        children: [
          {
            path: 'settings',
            lazy: lazy(() => import('@/pages/UserSettings')),
          },
        ],
      },
      {
        path: '*',
        lazy: lazy(() => import('@/pages/NotFound')),
      },
    ],
  },
];
