import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router';
import * as React from 'react';

import { ErrorPage, ReporteeChangeErrorPage } from '@/sites/ErrorPage';
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
import { InstanceDetailPage } from '@/features/amUI/InstanceDetailPage/InstanceDetailPage';

import { GeneralPath, amUIPath, SystemUserPath, ConsentPath } from '../paths';
import { PackagePoaDetailsPage } from '@/features/amUI/packagePoaDetailsPage/PackagePoaDetailsPage';
import { SettingsPage } from '@/features/amUI/settings/SettingsPage';
import { LandingPage } from '@/features/amUI/landingPage/LandingPage';
import { RequestPage } from '@/features/amUI/requestPage/RequestsPage';
import { ClientAdministrationPage } from '@/features/amUI/clientAdministration/ClientAdministrationPage';
import { AgentDetailsPage } from '@/features/amUI/agentDetails/AgentDetailsPage';
import { ClientDetailsPage } from '@/features/amUI/clientDetails/ClientDetailsPage';
import { MyClientsPage } from '@/features/amUI/myClients/MyClientsPage';
import { DraftRequestPage } from '@/features/amUI/requestPage/DraftRequestPage/DraftRequestPage';
import { AddAltinn2AccountPage } from '@/features/amUI/altinn2Account/AddAltinn2AccountPage';
import { MaskinportenPage } from '@/features/amUI/maskinporten/MaskinportenPage';
import { SupplierPage } from '@/features/amUI/maskinporten/SupplierPage';
import { ConsumerPage } from '@/features/amUI/maskinporten/ConsumerPage';

export const Router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* A3 user interface routes */}
      <Route
        path='/'
        errorElement={<ErrorPage />}
      >
        <Route
          index
          element={<LandingPage />}
        />
        <Route
          path={amUIPath.Users}
          element={<UsersPage />}
        />
        <Route
          path={amUIPath.UserRights}
          element={<UserRightsPage />}
        />
        <Route
          path={amUIPath.MyClients}
          element={<MyClientsPage />}
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
          path={amUIPath.PoaOverviewInstance}
          element={<InstanceDetailPage />}
        />
        <Route
          path={amUIPath.PackagePoaDetails}
          element={<PackagePoaDetailsPage />}
        />
        <Route path={SystemUserPath.SystemUser}>
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
          path={amUIPath.ClientAdministration}
          element={<ClientAdministrationPage />}
        />
        <Route
          path={amUIPath.ClientAdministrationAgent}
          element={<AgentDetailsPage />}
        />
        <Route
          path={amUIPath.ClientAdministrationClient}
          element={<ClientDetailsPage />}
        />
        <Route path={ConsentPath.Consent}>
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
          path={amUIPath.Settings}
          element={<SettingsPage />}
        />
        <Route
          path={amUIPath.Requests}
          element={<RequestPage />}
        />
        <Route
          path={amUIPath.DraftRequest}
          element={<DraftRequestPage />}
        />
        <Route
          path={amUIPath.Altinn2Account}
          element={<AddAltinn2AccountPage />}
        />
        <Route
          path={amUIPath.Maskinporten}
          element={<MaskinportenPage />}
        />
        <Route
          path={amUIPath.MaskinportenSupplier}
          element={<SupplierPage />}
        />
        <Route
          path={amUIPath.MaskinportenConsumer}
          element={<ConsumerPage />}
        />
        <Route
          path='errorpage/reportee'
          element={<ReporteeChangeErrorPage />}
        />
        {/* Catch-all for any unmatched routes under root */}
        <Route
          path='*'
          element={<ErrorPage />}
        />
      </Route>
    </>,
  ),
  { basename: GeneralPath.BasePath },
);
