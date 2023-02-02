/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Route, Routes } from 'react-router-dom';
import * as React from 'react';
import axios from 'axios';

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
  Profile = 'profile',
  BasePath = 'accessmanagement/ui',
}

export const Router = () => {
  const lastRefreshTokenTimestamp = React.useRef(0);
  const TEN_MINUTES_IN_MILLISECONDS = 600000;

  async function refreshJwtToken() {
    const timeNow = Date.now();
    if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTES_IN_MILLISECONDS) {
      lastRefreshTokenTimestamp.current = timeNow;
      return await axios
        // TODO: This may fail in AT if axios doesn't automatically change the base url
        .get('accessmanagement/api/v1/authentication/refresh')
        .then((response) => response.data)
        .catch((error) => {
          !import.meta.env.DEV && (window.location.pathname = '/');
          console.error(error);
        });
    }
  }

  React.useEffect(() => {
    const setUpEventListeners = () => {
      window.addEventListener('mousemove', refreshJwtToken);
      window.addEventListener('scroll', refreshJwtToken);
      window.addEventListener('onfocus', refreshJwtToken);
      window.addEventListener('keydown', refreshJwtToken);
    };
    refreshJwtToken();
    setUpEventListeners();
  });

  return (
    <Routes>
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
      </Route>
      , ),
    </Routes>
  );
};
