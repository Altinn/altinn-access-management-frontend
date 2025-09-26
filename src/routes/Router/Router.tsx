import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router';
import * as React from 'react';

import { ChooseApiPage } from '@/features/apiDelegation/offered/ChooseApiPage';
import { OverviewPage as OfferedOverviewPage } from '@/features/apiDelegation/offered/OverviewPage';
import { OverviewPage as ReceivedOverviewPage } from '@/features/apiDelegation/received/OverviewPage';
import { ChooseOrgPage } from '@/features/apiDelegation/offered/ChooseOrgPage';
import { ConfirmationPage } from '@/features/apiDelegation/offered/ConfirmationPage';
import { ErrorPage } from '@/sites/ErrorPage';
import { ChooseServicePage as DelegateChooseServicePage } from '@/features/singleRight/delegate/ChooseServicePage/ChooseServicePage';
import { ChooseServicePage as RequestChooseServicePage } from '@/features/singleRight/request/ChooseServicePage/ChooseServicePage';
import { ChooseRightsPage } from '@/features/singleRight/delegate/ChooseRightsPage/ChooseRightsPage';
import { ReceiptPage as SingleRightReceiptPage } from '@/features/singleRight/delegate/ReceiptPage/ReceiptPage';
import { UserRightsPage } from '@/features/amUI/userRightsPage/UserRightsPage';
import { UsersPage } from '@/features/amUI/users/UsersPage';
import { SystemUserRequestPage } from '@/features/amUI/systemUser/SystemUserRequestPage';
import { SystemUserChangeRequestPage } from '@/features/amUI/systemUser/SystemUserChangeRequestPage';
import { SystemUserOverviewPage } from '@/features/amUI/systemUser/SystemUsersOverviewPage/SystemUserOverviewPage';
import { SystemUserDetailsPage } from '@/features/amUI/systemUser/SystemUserDetailPage/SystemUserDetailsPage';
import { CreateSystemUserPage } from '@/features/amUI/systemUser/CreateSystemUserPage/CreateSystemUserPage';
import { ReporteesPage } from '@/features/amUI/reportees/ReporteesPage';
import { ReporteeRightsPage } from '@/features/amUI/reporteeRightsPage/ReporteeRightsPage';
import { SystemUserAgentRequestPage } from '@/features/amUI/systemUser/SystemUserAgentRequestPage';
import { SystemUserAgentDelegationPage } from '@/features/amUI/systemUser/SystemUserAgentDelegationPage/SystemUserAgentDelegationPage';
import { ConsentRequestPage } from '@/features/amUI/consent/ConsentRequestPage/ConsentRequestPage';
import { ActiveConsentsPage } from '@/features/amUI/consent/ActiveConsentsPage/ActiveConsentsPage';
import { ConsentHistoryPage } from '@/features/amUI/consent/ConsentHistoryPage/ConsentHistoryPage';
import { PoaOverviewPage } from '@/features/amUI/poaOverview/PoaOverviewPage';
import { InfoPage } from '@/features/amUI/infoPage/InfoPage';

import {
  GeneralPath,
  SingleRightPath,
  ApiDelegationPath,
  amUIPath,
  SystemUserPath,
  ConsentPath,
} from '../paths';
import { PackagePoaDetailsPage } from '@/features/amUI/packagePoaDetailsPage/PackagePoaDetailsPage';
import { SettingsPage } from '@/features/amUI/settings/SettingsPage';

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
      <Route
        path={amUIPath.Users}
        element={<UsersPage />}
      />
      <Route
        path={amUIPath.UserRights}
        element={<UserRightsPage />}
      />
      <Route
        path={amUIPath.Reportees}
        element={<ReporteesPage />}
      />
      <Route
        path={amUIPath.ReporteeRights}
        element={<ReporteeRightsPage />}
      />
      <Route
        path={amUIPath.PoaOverview}
        element={<PoaOverviewPage />}
      />
      <Route
        path={amUIPath.PackagePoaDetails}
        element={<PackagePoaDetailsPage />}
      />
      <Route
        path={SystemUserPath.SystemUser}
        errorElement={<ErrorPage />}
      >
        <Route
          path={SystemUserPath.Overview}
          element={<SystemUserOverviewPage />}
        />
        <Route
          path={SystemUserPath.Create}
          element={<CreateSystemUserPage />}
        />
        <Route
          path={SystemUserPath.Details}
          element={<SystemUserDetailsPage />}
        />
        <Route
          path={SystemUserPath.AgentDelegation}
          element={<SystemUserAgentDelegationPage />}
        />
        <Route
          path={SystemUserPath.Request}
          element={<SystemUserRequestPage />}
        />
        <Route
          path={SystemUserPath.ChangeRequest}
          element={<SystemUserChangeRequestPage />}
        />
        <Route
          path={SystemUserPath.AgentRequest}
          element={<SystemUserAgentRequestPage />}
        />
      </Route>
      <Route
        path={ConsentPath.Consent}
        errorElement={<ErrorPage />}
      >
        <Route
          path={ConsentPath.Request}
          element={<ConsentRequestPage />}
        />
        <Route
          path={ConsentPath.Active}
          element={<ActiveConsentsPage />}
        />
        <Route
          path={ConsentPath.Log}
          element={<ConsentHistoryPage />}
        />
      </Route>
      <Route
        path={amUIPath.Info}
        element={<InfoPage />}
      />
      <Route
        path={amUIPath.Settings}
        element={<SettingsPage />}
      />
    </Route>,
  ),
  { basename: GeneralPath.BasePath },
);
