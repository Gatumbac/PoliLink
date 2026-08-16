import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/app/layouts/AppLayout'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { EventCatalogPage } from '@/features/events/catalog/pages/EventCatalogPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <EventCatalogPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
