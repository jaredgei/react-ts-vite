import { type ComponentType } from 'react';
import { type RouteObject } from 'react-router';

import Layout from '@/components/Layout';
import RouteError from '@/components/RouteError';

const lazy = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    HydrateFallback: Layout,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: lazy(() => import('@/pages/Index')),
      },
      {
        path: 'verify-email',
        lazy: lazy(() => import('@/pages/VerifyEmail')),
      },
      {
        path: 'reset-password',
        lazy: lazy(() => import('@/pages/ResetPassword')),
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
          {
            path: 'forgot-password',
            lazy: lazy(() => import('@/pages/ForgotPassword')),
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
          {
            path: 'admin',
            lazy: lazy(() => import('@/components/AdminRoute')),
            children: [
              {
                index: true,
                lazy: lazy(() => import('@/pages/Admin')),
              },
            ],
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
