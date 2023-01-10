import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationsPage } from '@/components/NewApiDelegationPage';
import { ApiDelegationOverviewPage } from '@/components/ApiDelegationOverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';
import { ApiDelegationReceiptPage } from '@/components/ApiDelegationReceiptPage';

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
      path: 'api-delegations/new-api-delegation',
      element: <NewApiDelegationsPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations/new-org-delegation',
      element: <NewOrgDelegationPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations/confirmation',
      element: <ApiDelegationConfirmationPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations/receipt',
      element: <ApiDelegationReceiptPage />,
      errorElement: <ErrorPage />,
    },
  ],
  { basename: '/accessmanagement/ui' },
);
