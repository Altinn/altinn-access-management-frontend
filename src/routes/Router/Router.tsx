import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationsPage } from '@/components/NewApiDelegationPage';
import { ApiDelegationOverviewPage } from '@/components/ApiDelegationOverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';

export const Router = createBrowserRouter([
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
  {
    path: 'api-delegations/confirmation',
    element: <ApiDelegationConfirmationPage />,
    errorElement: <ErrorPage />,
  },
]);
