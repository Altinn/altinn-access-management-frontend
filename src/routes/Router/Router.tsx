import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationsPage } from '@/components/NewApiDelegationPage';
import { ApiDelegationOverviewPage } from '@/components/ApiDelegationOverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';

export const Router = createBrowserRouter(
  [
    {
      path: '/',
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations',
      element: <ApiDelegationOverviewPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations/new-api',
      element: <NewApiDelegationsPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations/new-org',
      element: <NewOrgDelegationPage />,
      errorElement: <ErrorPage />,
    },
  ],
  { basename: '/accessmanagement/ui' },
);
