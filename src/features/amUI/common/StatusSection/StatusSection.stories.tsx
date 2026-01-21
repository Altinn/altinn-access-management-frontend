import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';

import { StatusSection, type StatusSectionProps } from './StatusSection';
import {
  PartyRepresentationContext,
  type PartyRepresentationContextOutput,
} from '../PartyRepresentationContext/PartyRepresentationContext';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { InheritedStatusType } from '../useInheritedStatus';

type StatusSectionScenario =
  | 'hasAccess'
  | 'inherited'
  | 'cannotDelegate'
  | 'delegationBlocked'
  | 'undelegated';

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
  orgNumber: type === PartyType.Organization ? '912345678' : undefined,
  unitType: type === PartyType.Organization ? 'AS' : undefined,
  variant: type === PartyType.Person ? 'Person' : 'AS',
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
