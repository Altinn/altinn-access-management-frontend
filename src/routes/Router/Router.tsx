/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ChooseApiPage } from '@/components/apiDelegation/offered/ChooseApiPage';
import { OverviewPage as OfferedOverviewPage } from '@/components/apiDelegation/offered/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/components/apiDelegation/offered/ChooseOrgPage';
import { ReceiptPage } from '@/components/apiDelegation/offered/ReceiptPage';
import { ConfirmationPage } from '@/components/apiDelegation/offered/ConfirmationPage';
import { NotFoundSite } from '@/resources/NotFoundSite';

import { RouterPath } from './';

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
