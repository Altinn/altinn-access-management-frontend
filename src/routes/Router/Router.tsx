/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Route, Routes } from 'react-router-dom';
import * as React from 'react';
import axios from 'axios';
import { useEffect } from 'react';

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

  useEffect(() => {
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
      </Route>
      , ),
    </Routes>
  );
};
