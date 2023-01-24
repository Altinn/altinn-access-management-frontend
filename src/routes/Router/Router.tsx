import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationPage } from '@/components/NewApiDelegationPage';
import { OverviewPage as GivenApiOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedApiOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';

export enum RouterPath {
  GivenApiDelegations = 'given-api-delegations',
  GivenApiDelegationsOverview = 'overview',
  NewGivenApiDelegation = 'choose-api',
  NewGivenOrgDelegation = 'choose-org',
  GivenApiDelegationsConfirmation = 'confirmation',
  GivenApiDelegationsReceipt = 'receipt',
  ReceivedApiDelegations = 'received-api-delegations',
  ReceivedApiDelegationsOverview = 'overview',
  Profile = 'Profile',
}

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<ErrorPage />}
    >
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsOverview}
        element={<GivenApiOverviewPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.NewGivenOrgDelegation}
        element={<NewOrgDelegationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.NewGivenApiDelegation}
        element={<NewApiDelegationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsConfirmation}
        element={<ApiDelegationConfirmationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.GivenApiDelegationsOverview}
        element={<ReceivedApiOverviewPage />}
        errorElement={<ErrorPage />}
      />
    </Route>,
  ),
  { basename: '/accessmanagement/ui' },
);
