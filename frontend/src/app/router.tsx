import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/app/layouts/AppLayout'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { UiPreviewPage } from '@/app/pages/UiPreviewPage'
import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState'
import { AuthLayout } from '@/features/auth/layouts/AuthLayout'
import { RequireAnonymous } from '@/features/auth/route-guards'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { EventCatalogPage } from '@/features/events/catalog/pages/EventCatalogPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <RequireAnonymous loadingFallback={<AuthLoadingState />}>
            <LoginPage />
          </RequireAnonymous>
        ),
      },
      {
        path: 'register',
        element: (
          <RequireAnonymous loadingFallback={<AuthLoadingState />}>
            <RegisterPage />
          </RequireAnonymous>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <EventCatalogPage /> },
      { path: 'ui-preview', element: <UiPreviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
