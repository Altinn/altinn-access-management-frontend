import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { PartyRepresentationProvider } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType } from '../../useInheritedStatus';
import { DelegationAction } from '../EditModal';

import { PartyInfo } from './PartyInfo';

const party: Party = {
  partyId: 1,
  partyUuid: 'user-1',
  name: 'Ola Nordmann',
  partyTypeName: PartyType.Person,
  dateOfBirth: '1980-01-01',
};

const accessPackage = {
  id: 'pkg-1',
  name: 'Skatt og merverdiavgift',
  description: 'Tilgang til å rapportere skatt og merverdiavgift på vegne av virksomheten.',
  resources: [],
  isAssignable: true,
  isDelegable: true,
  area: {
    id: 'area-1',
    urn: 'urn:area:skatt',
    name: 'Skatt, avgift, regnskap og toll',
    description: '',
    iconUrl: '',
    accessPackages: [],
    typeName: '',
  },
  permissions: [],
} satisfies AccessPackage;

type PartyInfoProps = React.ComponentProps<typeof PartyInfo>;

export default {
  title: 'Features/AMUI/DelegationModal/PartyInfo',
  component: PartyInfo,
  args: {
    party,
    accessPackage,
    availableActions: [DelegationAction.DELEGATE, DelegationAction.REVOKE],
    onDelegate: () => alert('Delegate'),
    onRevoke: () => alert('Revoke'),
  },
  render: (props) => (
    <RootProvider>
      <Provider store={store}>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='123'
          actingPartyUuid='123'
        >
          <PartyInfo {...(props as PartyInfoProps)} />
        </PartyRepresentationProvider>
      </Provider>
    </RootProvider>
  ),
} as Meta<typeof PartyInfo>;

export const NoAccess: StoryObj<PartyInfoProps> = {
  args: {
    userHasAccess: false,
  },
};

export const HasAccess: StoryObj<PartyInfoProps> = {
  args: {
    userHasAccess: true,
  },
};

export const InheritedAccess: StoryObj<PartyInfoProps> = {
  args: {
    userHasAccess: false,
    roleDescription: 'Via rolle Dagligleder',
    inheritedStatus: [
      {
        type: InheritedStatusType.ViaRole,
        via: {
          id: 'org-1',
          name: 'Eksempel AS',
          type: 'Organisasjon',
          variant: '',
        },
      },
    ],
  },
};

export const Loading: StoryObj<PartyInfoProps> = {
  args: {
    userHasAccess: false,
    isLoading: true,
  },
};
