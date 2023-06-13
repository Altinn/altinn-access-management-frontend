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
import { OverviewPage } from '@/features/singleRight/offered/OverviewPage/OverviewPage';

import { GeneralPath } from '../paths/GeneralPath';
import { SingleRightPath } from '../paths/SingleRightPath';
import { ApiDelegationPath } from '../paths/ApiDelegationPath';

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      errorElement={<NotFoundSite />}
    >
      <Route
        path={ApiDelegationPath.OfferedApiDelegations}
        element={<OfferedOverviewPage />}
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
        <Route
          path={ApiDelegationPath.Overview}
          element={<ReceivedOverviewPage />}
          errorElement={<NotFoundSite />}
        />
      </Route>
      <Route
        path={SingleRightPath.OfferedSingleRights}
        errorElement={<NotFoundSite />}
      >
        <Route
          path={SingleRightPath.Overview}
          element={<OverviewPage />}
          errorElement={<NotFoundSite />}
        />
      </Route>
    </Route>,
  ),
  { basename: GeneralPath.BasePath },
);
