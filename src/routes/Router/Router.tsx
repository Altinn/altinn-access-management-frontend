import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationPage } from '@/components/NewApiDelegationPage';
import { OverviewPage as GivenOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';

export enum Paths {
  GivenApiDelegationsOverview = 'given-api-delegations',
  NewGivenApiDelegation = 'pick-api',
  NewGivenOrgDelegation = 'pick-org',
  ApiDelegationConfirmation = 'confirmation',
  ApiDelegationReceipt = 'receipt',
  ReceivedApiDelegationsOverview = 'received-api-delegations',
}

const test = Paths.ReceivedApiDelegationsOverview + '/' + Paths.NewGivenOrgDelegation;

export enum RouterPaths {
  GivenApiDelegationsOverview = 'given-api-delegations',
  NewGivenApiDelegation = 'pick-api',
  NewGivenOrgDelegation = test,
  ApiDelegationConfirmation = 'confirmation',
  ApiDelegationReceipt = 'receipt',
  ReceivedApiDelegationsOverview = 'received-api-delegations',
}

/* <Route
          path={Paths.NewGivenOrgDelegation}
          element={<NewOrgDelegationPage />}
          errorElement={<ErrorPage />}
        ></Route> */
export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<ErrorPage />}
    >
      <Route
        path={Paths.GivenApiDelegationsOverview}
        element={<GivenOverviewPage />}
      ></Route>
      <Route
        path={Paths.GivenApiDelegationsOverview + '/' + Paths.NewGivenOrgDelegation}
        element={<NewOrgDelegationPage />}
        errorElement={<ErrorPage />}
      ></Route>
      <Route
        path={Paths.GivenApiDelegationsOverview + '/' + Paths.NewGivenOrgDelegation}
        element={<NewApiDelegationPage />}
        errorElement={<ErrorPage />}
      ></Route>
      <Route
        path={Paths.GivenApiDelegationsOverview + '/' + Paths.NewGivenApiDelegation}
        element={<NewApiDelegationPage />}
        errorElement={<ErrorPage />}
      ></Route>
      <Route
        path={Paths.GivenApiDelegationsOverview + '/' + Paths.ApiDelegationConfirmation}
        element={<NewApiDelegationPage />}
        errorElement={<ErrorPage />}
      ></Route>
    </Route>,
  ),
  { basename: '/accessmanagement/ui' },
);

/*  export const Router = createBrowserRouter(
  [
    {
      path: '/',
      errorElement: <ErrorPage />,
    },
    {
      path: Paths.GivenApiDelegationsOverview,
      element: <GivenOverviewPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: Paths.ReceivedApiDelegationsOverview,
      element: <ReceivedOverviewPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: [Paths.ReceivedApiDelegationsOverview, '/' Paths.NewGivenOrgDelegation],
      element: <NewOrgDelegationPage />,
      errorElement: <ErrorPage />,
    },
    {
      path:
        Paths.NewGivenApiDelegation +
        '/' +
        Paths.NewGivenOrgDelegation +
        '/' +
        Paths.NewGivenApiDelegation,
      element: <NewApiDelegationsPage />,
      errorElement: <ErrorPage />,
    },
    {
      path:
        Paths.NewGivenApiDelegation +
        '/' +
        Paths.NewGivenOrgDelegation +
        '/' +
        Paths.NewGivenApiDelegation +
        '/' +
        Paths.ApiDelegationConfirmation,
      element: <ApiDelegationConfirmationPage />,
      errorElement: <ErrorPage />,
    },
  ],
  { basename: '/accessmanagement/ui' },
); 
 */
