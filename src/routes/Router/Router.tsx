/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ChooseApiPage } from '@/features/apiDelegation/offered/ChooseApiPage';
import { OverviewPage as OfferedOverviewPage } from '@/features/apiDelegation/offered/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/features/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/features/apiDelegation/offered/ChooseOrgPage';
import { ReceiptPage } from '@/features/apiDelegation/offered/ReceiptPage';
import { ConfirmationPage } from '@/features/apiDelegation/offered/ConfirmationPage';
import { NotFoundSite } from '@/sites/NotFoundSite';

import { RouterPath } from './RouterPath';

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<NotFoundSite />}
    >
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.Overview}
        element={<OfferedOverviewPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseOrg}
        element={<ChooseOrgPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseApi}
        element={<ChooseApiPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.Confirmation}
        element={<ConfirmationPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.OfferedApiDelegations + '/' + RouterPath.Receipt}
        element={<ReceiptPage />}
        errorElement={<NotFoundSite />}
      />
      <Route
        path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.Overview}
        element={<ReceivedOverviewPage />}
        errorElement={<NotFoundSite />}
      />
    </Route>,
  ),
  { basename: RouterPath.BasePath },
);
