import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationsPage } from '@/components/NewApiDelegationPage';
import { OverviewPage as GivenOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';

export const Router = createBrowserRouter(
  [
    {
      path: '/',
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations',
      element: <GivenOverviewPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: 'api-delegations-received',
      element: <ReceivedOverviewPage />,
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
  ],
  { basename: '/accessmanagement/ui' },
);
