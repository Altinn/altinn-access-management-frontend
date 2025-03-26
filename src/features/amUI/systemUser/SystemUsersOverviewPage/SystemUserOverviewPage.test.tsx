import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';

import { systemUserApi } from '@/rtk/features/systemUserApi';
import { server } from '@mock/node';
import { ACCESSMANAGEMENT_BASE_URL } from '@mock/handlers';
import store from '@/rtk/app/store';

import { SystemUserOverviewPage } from './SystemUserOverviewPage';

const mockedDetailsPageContent = 'systemuser';
const mockedAgentDetailsPageContent = 'systemuser agent';
const testPartyId = 51329012;
const systemUsers = [
  {
    id: '93d4ac6b-8412-4600-8480-1a282359d2c8',
    integrationTitle: 'SmartCloud',
    partyId: '51329012',
    created: '2025-02-21T12:25:41.26221Z',
    system: {
      systemId: '991825827_smartcloud',
      systemVendorOrgNumber: '991825827',
      systemVendorOrgName: 'DIGITALISERINGSDIREKTORATET',
      name: 'N/A',
    },
    resources: [],
    accessPackages: [],
  },
  {
    id: '5610454b-88e4-4934-a30d-b6f93f1b7683',
    integrationTitle: 'Fiken',
    partyId: '51329012',
    created: '2025-02-21T12:25:41.26221Z',
    system: {
      systemId: '913312465_fiken_demo_product',
      systemVendorOrgNumber: '913312465',
      systemVendorOrgName: 'N/A',
      name: 'N/A',
    },
    resources: [],
    accessPackages: [],
  },
];
const agentSystemUsers = [
  {
    id: 'be16ce1b-e1fa-4369-896c-8562858a64d5',
    integrationTitle: 'Tripletex',
    partyId: '51329012',
    created: '2025-02-21T12:25:41.26221Z',
    system: {
      systemId: '991825827_tripletex',
      systemVendorOrgNumber: '991825827',
      systemVendorOrgName: 'DIGITALISERINGSDIREKTORATET',
      name: 'N/A',
    },
    resources: [],
    accessPackages: [],
  },
];

vi.mock('react-router', async () => {
  const mod = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...mod,
    useLocation: () => {
      return {
        state: { createdId: '93d4ac6b-8412-4600-8480-1a282359d2c8' },
      };
    },
  };
});

describe('SystemUserOverviewPage', () => {
  beforeEach(() => {
    store.dispatch(systemUserApi.util.resetApiState());
  });

  test('should show error message if loading system users fail', async () => {
    server.use(
      http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/${testPartyId}`, () => {
        return new HttpResponse(null, {
          status: 500,
        });
      }),
    );
    renderSystemUserOverviewPage();

    const heading = await screen.findByText('systemuser_overviewpage.systemusers_load_error');
    expect(heading).toBeInTheDocument();
  });

  test('should show "new" badge for created system user', async () => {
    server.use(
      http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/${testPartyId}`, () => {
        return HttpResponse.json(systemUsers);
      }),
    );
    renderSystemUserOverviewPage();

    const systemUserBadge = await screen.findByText('systemuser_overviewpage.new_system_user');

    expect(systemUserBadge).toBeInTheDocument();
  });

  test('should navigate to system user when system user is clicked', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/${testPartyId}`, () => {
        return HttpResponse.json(systemUsers);
      }),
    );
    renderSystemUserOverviewPage();

    const systemUserActionBar = await screen.findByText('SmartCloud');
    await user.click(systemUserActionBar);

    const mockedContent = await screen.findByText(mockedDetailsPageContent);

    expect(mockedContent).toBeInTheDocument();
  });

  test('should show error message if loading agent system users fail', async () => {
    server.use(
      http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/agent/${testPartyId}`, () => {
        return new HttpResponse(null, {
          status: 500,
        });
      }),
    );
    renderSystemUserOverviewPage();

    const heading = await screen.findByText(
      'systemuser_overviewpage.agent_delegation_systemusers_load_error',
    );
    expect(heading).toBeInTheDocument();
  });

  test('should navigate to agent system user when agent system user is clicked', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/agent/${testPartyId}`, () => {
        return HttpResponse.json(agentSystemUsers);
      }),
    );
    renderSystemUserOverviewPage();

    const systemUserActionBar = await screen.findByText('Tripletex');
    await user.click(systemUserActionBar);

    const mockedContent = await screen.findByText(mockedAgentDetailsPageContent);

    expect(mockedContent).toBeInTheDocument();
  });
});

const renderSystemUserOverviewPage = () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route
            path='/'
            element={<SystemUserOverviewPage />}
          />
          <Route
            path={'systemuser/:id'}
            element={<div>{mockedDetailsPageContent}</div>}
          />
          <Route
            path={'systemuser/:id/agentdelegation'}
            element={<div>{mockedAgentDetailsPageContent}</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};
