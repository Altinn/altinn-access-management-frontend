import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { ChooseApiPage } from '@/components/apiDelegation/given/ChooseApiPage';
import { OverviewPage as GivenOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/components/apiDelegation/given/ChooseOrgPage';
import { ReceiptPage } from '@/components/apiDelegation/given/ReceiptPage';
import { ConfirmationPage } from '@/components/apiDelegation/given/ConfirmationPage';

export enum RouterPath {
  GivenApiDelegations = 'given-api-delegations',
  GivenApiOverview = 'overview',
  GivenApiChooseApi = 'choose-api',
  GivenApiChooseOrg = 'choose-org',
  GivenApiExecuteDelegation = 'execute-delegation',
  GivenApiReceipt = 'receipt',
  ReceivedApiDelegations = 'received-api-delegations',
  ReceivedApiOverview = 'overview',
  Profile = 'Profile',
  BasePath = '/accessmanagement/ui',
}

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<ErrorPage />}
    >
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiOverview}
        element={<GivenOverviewPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseOrg}
        element={<ChooseOrgPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseApi}
        element={<ChooseApiPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiExecuteDelegation}
        element={<ConfirmationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiReceipt}
        element={<ReceiptPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.GivenApiOverview}
        element={<ReceivedOverviewPage />}
        errorElement={<ErrorPage />}
      />
    </Route>,
  ),
  { basename: RouterPath.BasePath },
);
