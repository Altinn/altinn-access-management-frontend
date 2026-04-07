import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';
import type { InstanceDelegation } from '@/rtk/features/instanceApi';

import { InstanceList } from './InstanceList';

const digdirResource = {
  identifier: 'digdir-eksempeltjeneste',
  title: 'Eksempeltjeneste',
  description: 'Eksempeltjeneste fra Digitaliseringsdirektoratet',
  resourceOwnerName: 'Digitaliseringsdirektoratet',
  resourceOwnerLogoUrl: 'https://altinncdn.no/orgs/digdir/digdir.png',
  resourceOwnerOrgcode: 'digdir',
  resourceOwnerOrgNumber: '991825827',
  rightDescription: '',
  resourceReferences: [],
  authorizationReference: [],
  resourceType: 'GenericAccessResource',
  delegable: true,
};

const skdResource = {
  ...digdirResource,
  identifier: 'skd-kravogbetaling',
  title: 'Krav og betaling',
  resourceOwnerName: 'Skatteetaten',
  resourceOwnerLogoUrl: 'https://altinncdn.no/orgs/skd/skd.png',
  resourceOwnerOrgcode: 'skd',
  resourceOwnerOrgNumber: '974761076',
};

const dialogSuccess: InstanceDelegation = {
  resource: digdirResource,
  instance: { refId: 'urn:altinn:instance-id:abc123', type: { id: '1', name: 'Søknad' } },
  permissions: [],
  dialogLookup: {
    status: 'Success',
    dialogId: 'df333e75-0000-0000-0000-000000000001',
    instanceRef: 'urn:altinn:instance-id:abc123',
    title: [
      { languageCode: 'nb', value: 'Melding om innvilget søknad om dagpenger' },
      { languageCode: 'en', value: 'Application for unemployment benefits approved' },
    ],
  },
};

const dialogNotFound: InstanceDelegation = {
  resource: digdirResource,
  instance: { refId: 'urn:altinn:instance-id:def456', type: null },
  permissions: [],
  dialogLookup: { status: 'NotFound' },
};

const dialogNotFoundCorrespondence: InstanceDelegation = {
  resource: skdResource,
  instance: { refId: 'urn:altinn:correspondence-id:ghi789', type: { id: '2', name: 'Melding' } },
  permissions: [],
  dialogLookup: { status: 'NotFound' },
};

const dialogForbidden: InstanceDelegation = {
  resource: digdirResource,
  instance: { refId: 'urn:altinn:instance-id:jkl012', type: null },
  permissions: [],
  dialogLookup: { status: 'Forbidden' },
};

const noDialogLookup: InstanceDelegation = {
  resource: digdirResource,
  instance: { refId: 'urn:altinn:instance-id:mno345', type: null },
  permissions: [],
  dialogLookup: null,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <RootProvider>{children}</RootProvider>
  </Provider>
);

const meta: Meta<typeof InstanceList> = {
  title: 'Features/AMUI/InstanceList',
  component: InstanceList,
  render: (args) => (
    <Wrapper>
      <InstanceList {...args} />
    </Wrapper>
  ),
};

export default meta;

type Story = StoryObj<typeof InstanceList>;

export const AllTitleCases: Story = {
  args: {
    instances: [
      dialogSuccess,
      dialogNotFound,
      dialogNotFoundCorrespondence,
      dialogForbidden,
      noDialogLookup,
    ],
  },
};

export const DialogSuccess: Story = {
  name: 'Dialogporten: tittel funnet',
  args: { instances: [dialogSuccess] },
};

export const DialogNotFound: Story = {
  name: 'Dialogporten: ikke funnet (skjema)',
  args: { instances: [dialogNotFound] },
};

export const DialogNotFoundCorrespondence: Story = {
  name: 'Dialogporten: ikke funnet (korrespondanse)',
  args: { instances: [dialogNotFoundCorrespondence] },
};

export const DialogForbidden: Story = {
  name: 'Dialogporten: ingen tilgang',
  args: { instances: [dialogForbidden] },
};

export const NoDialogLookup: Story = {
  name: 'Ingen dialog-oppslag (fallback)',
  args: { instances: [noDialogLookup] },
};

export const Loading: Story = {
  args: { instances: [], isLoading: true },
};

export const Empty: Story = {
  args: { instances: [] },
};
