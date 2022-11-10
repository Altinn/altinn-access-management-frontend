import { createBrowserRouter } from 'react-router-dom';

import { ApiDelegationOverview } from '@/routes/RouterElements/ApiDelegationOverview';
import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegations } from '@/routes/RouterElements/NewApiDelegations';

export const Router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
  },
  {
    path: 'api-delegations/api-overview',
    element: <ApiDelegationOverview />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'api-delegations/new-api',
    element: <NewApiDelegations />,
    errorElement: <ErrorPage />,
  },
]);
