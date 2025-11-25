import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';
import type { Role } from '@/rtk/features/roleApi';
import { RoleInfo } from './RoleInfo';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { PartyRepresentationContext } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType } from '../../useInheritedStatus';

const storyRole: Role = {
  id: 'role-ccr-styreleder',
  name: 'Styreleder',
  code: 'styreleder',
  description:
    'Viser hvordan statusmeldingene forklarer hvor denne rollen kommer fra eller hvordan den kan brukes videre.',
  provider: {
    id: 'provider-ccr',
    name: 'Enhetsregisteret',
    code: 'sys-ccr',
  },
};

const createParty = (
  partyUuid: string,
  name: string,
  type: PartyType = PartyType.Organization,
): Party => ({
  partyId: Math.abs(
    Array.from(partyUuid).reduce((sum, char) => {
      return sum + char.charCodeAt(0);
    }, 0),
  ),
  partyUuid,
  name,
  partyTypeName: type,
  orgNumber: type === PartyType.Person ? undefined : '912345678',
  unitType: type === PartyType.Person ? undefined : 'AS',
  variant: type === PartyType.Person ? 'Person' : 'AS',
});

const scenarioConfigs = {
  viaRole: {
    fromParty: createParty('org-aktiv-epoke', 'Aktiv Epoke AS'),
    toParty: createParty('party-via-role-employee', 'Fiona Økonom', PartyType.Person),
    acting: 'from',
    viaParty: createParty('org-aktiv-epoke', 'Aktiv Epoke AS'),
    statusType: InheritedStatusType.ViaRole,
  },
  viaParent: {
    fromParty: createParty('org-koncern', 'Nordic Holdings ASA'),
    toParty: createParty('party-via-parent', 'Aktiv Epoke AS'),
    acting: 'to',
    viaParty: createParty('org-koncern', 'Nordic Holdings ASA'),
    statusType: InheritedStatusType.ViaConnection,
  },
  viaAgent: {
    fromParty: createParty('org-aktiv-epoke', 'Aktiv Epoke AS'),
    toParty: createParty('party-via-agent', 'Ola Agent', PartyType.Person),
    acting: 'from',
    viaParty: createParty('org-agent', 'Tall & Tid AS'),
    statusType: InheritedStatusType.ViaConnection,
  },
} as const;

type ScenarioKey = keyof typeof scenarioConfigs;

type RoleInfoStoryProps = {
  role: Role;
  scenario: ScenarioKey;
};
const meta: Meta<RoleInfoStoryProps> = {
  title: 'Features/AMUI/DelegationModal/RoleInfo',
  component: RoleInfo,
  args: {
    role: storyRole,
    scenario: 'viaRole',
  },
  argTypes: {
    role: {
      control: { disable: true },
    },
    scenario: {
      options: Object.keys(scenarioConfigs) as ScenarioKey[],
      control: { type: 'radio' },
    },
  },
  render: ({ scenario, role }: RoleInfoStoryProps) => {
    const config = scenarioConfigs[scenario];
    const actingParty = config.acting === 'from' ? config.fromParty : config.toParty;

    return (
      <Provider store={store}>
        <RootProvider>
          <PartyRepresentationContext.Provider
            value={{
              fromParty: config.fromParty,
              toParty: config.toParty,
              actingParty,
              selfParty: actingParty,
              isLoading: false,
              isError: false,
            }}
          >
            <RoleInfo role={role} />
          </PartyRepresentationContext.Provider>
        </RootProvider>
      </Provider>
    );
  },
};

export default meta;

type Story = StoryObj<RoleInfoStoryProps>;

export const ViaRole: Story = {
  args: {
    scenario: 'viaRole',
  },
};

export const ViaParent: Story = {
  args: {
    scenario: 'viaParent',
  },
};

export const ViaAgent: Story = {
  args: {
    scenario: 'viaAgent',
  },
};
