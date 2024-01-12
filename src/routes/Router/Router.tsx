import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ChooseApiPage } from '@/features/apiDelegation/offered/ChooseApiPage';
import { OverviewPage as OfferedOverviewPage } from '@/features/apiDelegation/offered/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/features/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/features/apiDelegation/offered/ChooseOrgPage';
import { ReceiptPage } from '@/features/apiDelegation/offered/ReceiptPage';
import { ConfirmationPage } from '@/features/apiDelegation/offered/ConfirmationPage';
import { ErrorPage } from '@/sites/ErrorPage';
import { ChooseServicePage as DelegateChooseServicePage } from '@/features/singleRight/delegate/ChooseServicePage/ChooseServicePage';
import { ChooseServicePage as RequestChooseServicePage } from '@/features/singleRight/request/ChooseServicePage/ChooseServicePage';
import { ChooseRightsPage } from '@/features/singleRight/delegate/ChooseRightsPage/ChooseRightsPage';
import { ReceiptPage as SingleRightReceiptPage } from '@/features/singleRight/delegate/ReceiptPage/ReceiptPage';

import { GeneralPath, SingleRightPath, ApiDelegationPath } from '../paths';

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<ErrorPage />}
    >
      <Route
        path={ApiDelegationPath.OfferedApiDelegations}
        errorElement={<ErrorPage />}
      >
        <Route
          path={ApiDelegationPath.Overview}
          element={<OfferedOverviewPage />}
        />
        <Route
          path={ApiDelegationPath.ChooseOrg}
          element={<ChooseOrgPage />}
        />
        <Route
          path={ApiDelegationPath.ChooseApi}
          element={<ChooseApiPage />}
        />
        <Route
          path={ApiDelegationPath.Confirmation}
          element={<ConfirmationPage />}
        />
        <Route
          path={ApiDelegationPath.Receipt}
          element={<ReceiptPage />}
        />
      </Route>
      <Route
        path={ApiDelegationPath.ReceivedApiDelegations}
        errorElement={<ErrorPage />}
      >
        <Route
          path={ApiDelegationPath.Overview}
          element={<ReceivedOverviewPage />}
        />
      </Route>
      <Route
        path={SingleRightPath.DelegateSingleRights}
        errorElement={<ErrorPage />}
      >
        <Route
          path={SingleRightPath.ChooseService}
          element={<DelegateChooseServicePage />}
        />
        <Route
          path={SingleRightPath.ChooseRights}
          element={<ChooseRightsPage />}
        />
        <Route
          path={SingleRightPath.Receipt}
          element={<SingleRightReceiptPage />}
        />
      </Route>
      <Route
        path={SingleRightPath.RequestSingleRights}
        errorElement={<ErrorPage />}
      >
        <Route
          path={SingleRightPath.ChooseService}
          element={<RequestChooseServicePage />}
        />
      </Route>
    </Route>,
  ),
  { basename: GeneralPath.BasePath },
);
