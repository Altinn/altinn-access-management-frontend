import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';

import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';

import {
  PartyRepresentationContext,
  type PartyRepresentationContextOutput,
} from '../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType } from '../useInheritedStatus';

import { StatusSection, type StatusSectionProps } from './StatusSection';

type StatusSectionScenario =
  'hasAccess' | 'inherited' | 'cannotDelegate' | 'delegationBlocked' | 'undelegated';

const createParty = (
  partyUuid: string,
  name: string,
  type: PartyType = PartyType.Organization,
): PartyEntity => ({
  partyId: Math.abs(
    Array.from(partyUuid).reduce((sum, char) => {
      return sum + char.charCodeAt(0);
    }, 0),
  ),
  id: partyUuid,
  name,
  type: type,
  organizationIdentifier: type === PartyType.Organization ? '912345678' : undefined,
  unitType: type === PartyType.Organization ? 'AS' : undefined,
  isDeleted: false,
});

const storyContextValue: PartyRepresentationContextOutput = {
  fromParty: createParty('org-from', 'Aktiv Epoke AS'),
  toParty: createParty('party-to', 'Fiona Økonom', PartyType.Person),
  actingParty: createParty('org-from', 'Aktiv Epoke AS'),
  selfParty: createParty('org-from', 'Aktiv Epoke AS'),
  isLoading: false,
  isError: false,
};

const scenarioConfigs: Record<StatusSectionScenario, StatusSectionProps> = {
  hasAccess: {
    userHasAccess: true,
  },
  inherited: {
    inheritedStatus: {
      type: InheritedStatusType.ViaRole,
      via: { name: 'Styrelederne AS', type: 'Organization' },
    },
  },
  cannotDelegate: {
    cannotDelegateHere: true,
  },
  delegationBlocked: {
    showDelegationCheckWarning: true,
  },
  undelegated: {
    showUndelegatedWarning: true,
    undelegatedPackageName: 'Post til virksomheten',
  },
};

type StatusSectionStoryProps = {
  scenario: StatusSectionScenario;
};

const meta: Meta<StatusSectionStoryProps> = {
  title: 'Features/AMUI/StatusSection',
  component: StatusSection,
  args: {
    scenario: 'hasAccess',
  },
  argTypes: {
    scenario: {
      control: { type: 'radio' },
      options: Object.keys(scenarioConfigs) as StatusSectionScenario[],
    },
  },
  render: ({ scenario }: StatusSectionStoryProps) => (
    <RootProvider>
      <div style={{ maxWidth: '38rem' }}>
        <PartyRepresentationContext.Provider value={storyContextValue}>
          <StatusSection {...scenarioConfigs[scenario]} />
        </PartyRepresentationContext.Provider>
      </div>
    </RootProvider>
  ),
};

export default meta;

type Story = StoryObj<StatusSectionStoryProps>;

export const HasAccess: Story = {
  args: { scenario: 'hasAccess' },
};

export const InheritedAccess: Story = {
  args: { scenario: 'inherited' },
};

export const CannotDelegateHere: Story = {
  args: { scenario: 'cannotDelegate' },
};

export const DelegationBlocked: Story = {
  args: { scenario: 'delegationBlocked' },
};

export const UndelegatedPackage: Story = {
  args: { scenario: 'undelegated' },
};
