import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';

import { server } from '@mock/node';
import { ACCESSMANAGEMENT_BASE_URL } from '@mock/handlers';
import store from '@/rtk/app/store';

import { SystemUserOverviewPage } from './SystemUserOverviewPage';

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

const mockedUseNavigate = vi.fn();
vi.mock('react-router', async () => {
  const mod = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...mod,
    useNavigate: () => mockedUseNavigate,
    useLocation: () => {
      return {
        state: { createdId: '93d4ac6b-8412-4600-8480-1a282359d2c8' },
      };
    },
  };
});

describe('SystemUserOverviewPage', () => {
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

    const systemUserActionBar = await screen.findAllByText('SmartCloud');
    await user.click(systemUserActionBar[0]);

    expect(mockedUseNavigate).toHaveBeenCalled();
  });
});

const renderSystemUserOverviewPage = () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <SystemUserOverviewPage />
      </MemoryRouter>
    </Provider>,
  );
};
