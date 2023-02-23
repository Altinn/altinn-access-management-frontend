import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { ChooseApiPage } from '@/components/apiDelegation/offered/ChooseApiPage';
import { OverviewPage as OfferedOverviewPage } from '@/components/apiDelegation/offered/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/components/apiDelegation/offered/ChooseOrgPage';
import { ReceiptPage } from '@/components/apiDelegation/offered/ReceiptPage';
import { ConfirmationPage } from '@/components/apiDelegation/offered/ConfirmationPage';

// when typescript 5 is released we can further improve the routing to use absolute paths.
// This is because typescript 5 will have support for computed enums for strings https://github.com/microsoft/TypeScript/issues/40793
export enum RouterPath {
  OfferedApiDelegations = 'offered-api-delegations',
  OfferedApiOverview = 'overview',
  OfferedApiChooseApi = 'choose-api',
  OfferedApiChooseOrg = 'choose-org',
  OfferedApiExecuteDelegation = 'execute-delegation',
  OfferedApiReceipt = 'receipt',
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
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiOverview}
        element={<OfferedOverviewPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiOverview}
        element={<OfferedOverviewPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiChooseOrg}
        element={<ChooseOrgPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiChooseApi}
        element={<ChooseApiPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiExecuteDelegation}
        element={<ConfirmationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiReceipt}
        element={<ReceiptPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.OfferedApiOverview}
        element={<ReceivedOverviewPage />}
        errorElement={<ErrorPage />}
      />
    </Route>,
  ),
  { basename: RouterPath.BasePath },
);
