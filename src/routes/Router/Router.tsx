import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ChooseApiPage } from '@/components/apiDelegation/given/ChooseApiPage';
import { OverviewPage as GivenOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/components/apiDelegation/given/ChooseOrgPage';
import { ReceiptPage } from '@/components/apiDelegation/given/ReceiptPage';
import { ConfirmationPage } from '@/components/apiDelegation/given/ConfirmationPage';
import { NotFoundSite } from '@/resources/NotFoundSite';

// when typescript 5 is released we can further improve the routing to use absolute paths.
// This is because typescript 5 will have support for computed enums for strings https://github.com/microsoft/TypeScript/issues/40793
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
      errorElement={<NotFoundSite />}
    >
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiOverview}
        element={<GivenOverviewPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseOrg}
        element={<ChooseOrgPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseApi}
        element={<ChooseApiPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiExecuteDelegation}
        element={<ConfirmationPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiReceipt}
        element={<ReceiptPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.GivenApiOverview}
        element={<ReceivedOverviewPage />}
        errorElement={<NotFoundSite />}
      />
    </Route>,
  ),
  { basename: RouterPath.BasePath },
);
