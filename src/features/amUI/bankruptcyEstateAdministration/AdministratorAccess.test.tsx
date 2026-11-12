import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdministratorAccess } from './AdministratorAccess';

interface FakePackage {
  id: string;
  name: string;
  resources: unknown[];
}

let packages: Record<string, FakePackage>;
let isLoading = false;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key} ${options.count}`,
  }),
}));

vi.mock('@/resources/hooks/useAccessPackageLookup', () => ({
  useAccessPackageLookup: () => ({
    getAccessPackageByUrn: (urn: string) => packages[urn],
    isLoading,
  }),
}));

const resourceCount = 'access_packages.package_number_of_resources';

beforeEach(() => {
  isLoading = false;
  packages = {
    'urn:altinn:accesspackage:hovedadministrator': {
      id: '1',
      name: 'Hovedadministrator',
      resources: [1, 2, 3, 4, 5, 6, 7],
    },
    'urn:altinn:accesspackage:konkursbo-lesetilgang': {
      id: '2',
      name: 'Konkursbo lesetilgang',
      resources: [1, 2],
    },
    'urn:altinn:accesspackage:konkursbo-skrivetilgang': {
      id: '3',
      name: 'Konkursbo skrivetilgang',
      resources: [1],
    },
  };
});

describe('AdministratorAccess', () => {
  it('describes the role and that the packages are managed on each estate', () => {
    render(<AdministratorAccess />);

    expect(
      screen.getByRole('heading', { name: 'bankruptcy_estate_administration_page.info_heading' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('bankruptcy_estate_administration_page.administrator_role_description'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('bankruptcy_estate_administration_page.packages_managed_per_estate'),
    ).toBeInTheDocument();
  });

  it('lists the three packages with their number of services', () => {
    render(<AdministratorAccess />);

    expect(screen.getByText('Hovedadministrator')).toBeInTheDocument();
    expect(screen.getByText('Konkursbo lesetilgang')).toBeInTheDocument();
    expect(screen.getByText('Konkursbo skrivetilgang')).toBeInTheDocument();
    expect(screen.getByText(`${resourceCount} 7`)).toBeInTheDocument();
    expect(screen.getByText(`${resourceCount} 2`)).toBeInTheDocument();
    expect(screen.getByText(`${resourceCount} 1`)).toBeInTheDocument();
  });

  it('leaves out a package the lookup does not know', () => {
    delete packages['urn:altinn:accesspackage:konkursbo-lesetilgang'];

    render(<AdministratorAccess />);

    expect(screen.getByText('Hovedadministrator')).toBeInTheDocument();
    expect(screen.queryByText('Konkursbo lesetilgang')).toBeNull();
    expect(screen.getByText('Konkursbo skrivetilgang')).toBeInTheDocument();
  });
});
