/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Route, Routes } from 'react-router-dom';
import * as React from 'react';
import axios from 'axios';

import { ErrorPage } from '@/resources/ErrorPage/ErrorPage';
import { NewApiDelegationPage } from '@/components/NewApiDelegationPage';
import { OverviewPage as GivenOverviewPage } from '@/components/apiDelegation/given/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/components/apiDelegation/received/OverviewPage';
import { NewOrgDelegationPage } from '@/components/NewOrgDelegationPage';
import { ApiDelegationConfirmationPage } from '@/components/ApiDelegationConfirmationPage';
import { ApiDelegationReceiptPage } from '@/components/ApiDelegationReceiptPage';

export enum RouterPath {
  GivenApiDelegations = 'given-api-delegations',
  GivenApiDelegationsOverview = 'overview',
  NewGivenApiDelegation = 'choose-api',
  NewGivenOrgDelegation = 'choose-org',
  GivenApiDelegationsConfirmation = 'confirmation',
  GivenApiDelegationsReceipt = 'receipt',
  ReceivedApiDelegations = 'received-api-delegations',
  ReceivedApiDelegationsOverview = 'overview',
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
          window.location.pathname = '/';
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
          path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsOverview}
          element={<GivenOverviewPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path={RouterPath.GivenApiDelegations + '/' + RouterPath.NewGivenOrgDelegation}
          element={<NewOrgDelegationPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path={RouterPath.GivenApiDelegations + '/' + RouterPath.NewGivenApiDelegation}
          element={<NewApiDelegationPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsConfirmation}
          element={<ApiDelegationConfirmationPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path={RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsReceipt}
          element={<ApiDelegationReceiptPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path={RouterPath.ReceivedApiDelegations + '/' + RouterPath.GivenApiDelegationsOverview}
          element={<ReceivedOverviewPage />}
          errorElement={<ErrorPage />}
        />
      </Route>
      , ),
    </Routes>
  );
};
