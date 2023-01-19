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
  Profile = 'Profile',
}

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<ErrorPage />}
    >
      <Route
        path={Paths.GivenApiDelegationsOverview}
        element={<GivenOverviewPage />}
      />
      <Route
        path={Paths.GivenApiDelegationsOverview + '/' + Paths.NewGivenOrgDelegation}
        element={<NewOrgDelegationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={
          Paths.GivenApiDelegationsOverview +
          '/' +
          Paths.NewGivenOrgDelegation +
          '/' +
          Paths.NewGivenApiDelegation
        }
        element={<NewApiDelegationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={
          Paths.GivenApiDelegationsOverview +
          '/' +
          Paths.NewGivenOrgDelegation +
          '/' +
          Paths.NewGivenApiDelegation +
          '/' +
          Paths.ApiDelegationConfirmation
        }
        element={<ApiDelegationConfirmationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={Paths.ReceivedApiDelegationsOverview}
        element={<ReceivedOverviewPage />}
        errorElement={<ErrorPage />}
      />
    </Route>,
  ),
  { basename: '/accessmanagement/ui' },
);
