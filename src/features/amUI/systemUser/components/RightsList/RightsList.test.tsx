import React from 'react';
import { describe, expect, test } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RightsList } from './RightsList';

const resource = {
  identifier: 'ske-innrapportering-boligsameie',
  title: 'Innrapportering Boligsameie',
  description:
    'Sameier med 9 eller flere boligseksjoner skal levere opplysninger om sameiers andel av felles inntekter, utgifter, formue og gjeld. Det er vanligvis sameiets styre eller forretningsfører som leverer opplysningene.',
  rightDescription:
    'Delegering av denne tjenesten gir andre mulighet til å rapportere opplysninger om boligsameie på vegne av deg.',
  delegable: true,
  resourceOwnerName: 'Skatteetaten',
  resourceOwnerOrgNumber: '974761076',
  resourceOwnerLogoUrl: 'https://altinncdn.no/orgs/skd/skd.png',
  resourceType: 'GenericAccessResource',
  authorizationReference: [],
  resourceReferences: [],
};

const resource2 = {
  ...resource,
  identifier: 'ske-krav-og-betaling',
  title: 'Krav og betaling',
  description: 'Ressurs for å styre krav og betaling',
  resourceOwnerName: '',
};

const accessPackage = {
  id: '1111',
  urn: 'urn:altinn:accesspackage:sjofart',
  name: 'Sjøfart',
  description:
    'Denne fullmakten gir tilgang til tjenester knyttet til skipsarbeidstakere og fartøy til sjøs. Ved regelverksendringer eller innføring av nye digitale tjenester kan det bli endringer i tilganger som fullmakten gir.',
  resources: [resource],
  area: {
    name: 'Transport',
    id: '4321',
    description: '',
    iconUrl: '',
    accessPackages: [],
  },
};

const accessPackage2 = {
  ...accessPackage,
  id: '2222',
  urn: 'urn:altinn:accesspackage:lufttransport',
  name: 'Lufttransport',
  description:
    'Denne fullmakten gir tilgang til tjenester knyttet til luftfartøy og romfartøy. Ved regelverksendringer eller innføring av nye digitale tjenester kan det bli endringer i tilganger som fullmakten gir.',
  resources: [resource, resource2],
};

describe('RightsList', () => {
  test('should show singular header for access package with only one access package', () => {
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage]}
      />,
    );
    const heading = screen.getByText('systemuser_detailpage.right_accesspackage_singular');
    expect(heading).toBeInTheDocument();
  });

  test('should show plural header for access package with more than one access package', () => {
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage, accessPackage2]}
      />,
    );
    const heading = screen.getByText('systemuser_detailpage.right_accesspackage_plural');
    expect(heading).toBeInTheDocument();
  });

  test('should show singular header for resource with only one resource', () => {
    render(
      <RightsList
        resources={[resource]}
        accessPackages={[]}
      />,
    );
    const heading = screen.getByText('systemuser_detailpage.right_resource_singular');
    expect(heading).toBeInTheDocument();
  });

  test('should show plural header for resource with more than one resource', () => {
    render(
      <RightsList
        resources={[resource, resource2]}
        accessPackages={[]}
      />,
    );
    const heading = screen.getByText('systemuser_detailpage.right_resource_plural');
    expect(heading).toBeInTheDocument();
  });

  test('should show modal with access package info when access package is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage]}
      />,
    );

    const accessPackageListItem = screen.getByRole('button', { name: accessPackage.name });
    await user.click(accessPackageListItem);

    const accessPackageDescription = screen.getByText(accessPackage.description);
    expect(accessPackageDescription).toBeInTheDocument();
  });

  test('should show singular header for access package with only one resource', async () => {
    const user = userEvent.setup();
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage]}
      />,
    );

    const accessPackageListItem = screen.getByRole('button', { name: accessPackage.name });
    await user.click(accessPackageListItem);

    const resourcesHeader = screen.getByText(
      'systemuser_detailpage.accesspackage_resources_singular',
    );
    expect(resourcesHeader).toBeInTheDocument();
  });

  test('should show plural header for access package with more than one resource', async () => {
    const user = userEvent.setup();
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage2]}
      />,
    );

    const accessPackageListItem = screen.getByRole('button', { name: accessPackage2.name });
    await user.click(accessPackageListItem);

    const resourcesHeader = screen.getByText(
      'systemuser_detailpage.accesspackage_resources_plural',
    );
    expect(resourcesHeader).toBeInTheDocument();
  });

  test('should show modal with resource info when resource is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RightsList
        resources={[resource2]}
        accessPackages={[]}
      />,
    );

    const resourceListItem = screen.getByRole('button', { name: resource2.title });
    await user.click(resourceListItem);

    const resourceDescription = screen.getByText(resource2.description);
    expect(resourceDescription).toBeInTheDocument();
  });

  test('should show resource when resource is clicked in access package modal', async () => {
    const user = userEvent.setup();
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage]}
      />,
    );

    const accessPackageListItem = screen.getByRole('button', { name: accessPackage.name });
    await user.click(accessPackageListItem);

    const resourceListItem = screen.getByRole('button', { name: resource.title });
    await user.click(resourceListItem);

    const resourceDescription = screen.getByText(resource.description);
    expect(resourceDescription).toBeInTheDocument();
  });

  test('should go back to access package when modal back button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RightsList
        resources={[]}
        accessPackages={[accessPackage]}
      />,
    );

    const accessPackageListItem = screen.getByRole('button', { name: accessPackage.name });
    await user.click(accessPackageListItem);

    const resourceListItem = screen.getByRole('button', { name: resource.title });
    await user.click(resourceListItem);

    const backButton = screen.getByRole('button', { name: 'common.back' });
    await user.click(backButton);

    const accessPackageDescription = screen.getByText(accessPackage.description);
    expect(accessPackageDescription).toBeInTheDocument();
  });
});
