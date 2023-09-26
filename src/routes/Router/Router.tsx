import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import * as React from 'react';

import { ChooseApiPage } from '@/features/apiDelegation/offered/ChooseApiPage';
import { OverviewPage as OfferedOverviewPage } from '@/features/apiDelegation/offered/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/features/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/features/apiDelegation/offered/ChooseOrgPage';
import { ReceiptPage } from '@/features/apiDelegation/offered/ReceiptPage';
import { ConfirmationPage } from '@/features/apiDelegation/offered/ConfirmationPage';
import { NotFoundSite } from '@/sites/NotFoundSite';
import { ChooseServicePage as DelegateChooseServicePage } from '@/features/singleRight/delegate/ChooseServicePage/ChooseServicePage';
import { ChooseServicePage as RequestChooseServicePage } from '@/features/singleRight/request/ChooseServicePage/ChooseServicePage';
import { ChooseRightsPage } from '@/features/singleRight/delegate/ChooseRightsPage/ChooseRightsPage';
import { ReceiptPage as SingleRightReceiptPage } from '@/features/singleRight/delegate/ReceiptPage/ReceiptPage';

import { GeneralPath, SingleRightPath, ApiDelegationPath } from '../paths';

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<NotFoundSite />}
    >
      <Route
        path={ApiDelegationPath.OfferedApiDelegations}
        errorElement={<NotFoundSite />}
      >
        <Route
          path={ApiDelegationPath.Overview}
          element={<OfferedOverviewPage />}
          errorElement={<NotFoundSite />}
        />
        <Route
          path={ApiDelegationPath.ChooseOrg}
          element={<ChooseOrgPage />}
          errorElement={<NotFoundSite />}
        />
        <Route
          path={ApiDelegationPath.ChooseApi}
          element={<ChooseApiPage />}
          errorElement={<NotFoundSite />}
        />
        <Route
          path={ApiDelegationPath.Confirmation}
          element={<ConfirmationPage />}
          errorElement={<NotFoundSite />}
        />
        <Route
          path={ApiDelegationPath.Receipt}
          element={<ReceiptPage />}
          errorElement={<NotFoundSite />}
        />
      </Route>
      <Route
        path={ApiDelegationPath.ReceivedApiDelegations}
        errorElement={<NotFoundSite />}
      >
        <Route
          path={ApiDelegationPath.Overview}
          element={<ReceivedOverviewPage />}
          errorElement={<NotFoundSite />}
        />
      </Route>
      <Route
        path={SingleRightPath.DelegateSingleRights}
        errorElement={<NotFoundSite />}
      >
        <Route
          path={SingleRightPath.ChooseService}
          element={<DelegateChooseServicePage />}
          errorElement={<NotFoundSite />}
        />
        <Route
          path={SingleRightPath.ChooseRights}
          element={<ChooseRightsPage />}
          errorElement={<NotFoundSite />}
        />
        <Route
          path={SingleRightPath.Receipt}
          element={<SingleRightReceiptPage />}
          errorElement={<NotFoundSite />}
        />
      </Route>
      <Route
        path={SingleRightPath.RequestSingleRights}
        errorElement={<NotFoundSite />}
      >
        <Route
          path={SingleRightPath.ChooseService}
          element={<RequestChooseServicePage />}
          errorElement={<NotFoundSite />}
        />
      </Route>
    </Route>,
  ),
  { basename: GeneralPath.BasePath },
);
