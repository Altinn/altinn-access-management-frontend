import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationPage } from '@/components/NewApiDelegationPage';
import { OverviewPage as GivenOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';

export enum RouterPath {
  GivenApiDelegations = 'given-api-delegations',
  GivenApiDelegationOverview = 'overview',
  NewGivenApiDelegation = 'pick-api',
  NewGivenOrgDelegation = 'pick-org',
  GivenApiDelegationConfirmation = 'confirmation',
  GivenApiDelegationReceipt = 'receipt',
  ReceivedApiDelegations = 'received-api-delegations',
  ReceivedApiDelegationOverview = 'overview',
  Profile = 'Profile',
  StartPage = 'www.altinn.no',
}

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<ErrorPage />}
    >
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationOverview}
        element={<GivenOverviewPage />}
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
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationConfirmation}
        element={<ApiDelegationConfirmationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.GivenApiDelegationOverview}
        element={<ReceivedOverviewPage />}
        errorElement={<ErrorPage />}
      />
    </Route>,
  ),
  { basename: '/accessmanagement/ui' },
);
