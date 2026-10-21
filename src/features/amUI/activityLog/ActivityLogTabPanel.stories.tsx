import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';

import { ActivityLogTabPanel, type ActivityLogTabPanelProps } from './ActivityLogTabPanel';
import type { ActivityLogArea, ActivityLogDto, ActivityLogFilterValueDto } from './types';
import { useActivityLogQueryState } from './useActivityLogQueryState';

const reportee = { id: 'fysioterapeutene-as', name: 'Fysioterapeutene AS' };
const liseLarsen = { id: 'lise-larsen-as', name: 'Lise Larsen AS' };
const fysioPartner = { id: 'fysio-partner-as', name: 'Fysio Partner AS' };
const skatteetaten = { id: 'skatteetaten', name: 'Skatteetaten' };
const regnskapsbyraaet = { id: 'regnskapsbyraaet-as', name: 'Regnskapsbyrået AS' };

type Party = ActivityLogFilterValueDto;

let nextId = 1;

const entry = (
  when: string,
  from: Party,
  to: Party,
  fields: Partial<ActivityLogDto> & Pick<ActivityLogDto, 'type' | 'trigger'>,
): ActivityLogDto => ({
  id: String(nextId++),
  itemId: `item-${nextId}`,
  when,
  byName: 'Helle Hovedadmin',
  fromId: from.id,
  fromName: from.name,
  fromType: 'Organisasjon',
  toId: to.id,
  toName: to.name,
  toType: 'Organisasjon',
  ...fields,
});

const scope = (when: string, trigger: ActivityLogDto['trigger'], name: string, to = liseLarsen) =>
  entry(when, reportee, to, {
    type: 'Assignment',
    subtype: 'Resource',
    trigger,
    resourceName: name,
  });

const maskinportenEntries: ActivityLogDto[] = [
  scope('2025-01-15T11:15:00', 'Created', 'altinn:supertjenesten:read'),
  scope('2025-01-15T11:10:00', 'Deleted', 'altinn:supertjenesten:read'),
  scope('2025-02-23T14:15:00', 'Created', 'altinn:starbucks:read'),
  scope('2024-11-20T11:15:00', 'Created', 'altinn:pensjon:read'),
  scope('2024-09-09T11:58:00', 'Deleted', 'altinn:lonn:read'),
  scope('2024-01-15T12:30:00', 'Created', 'altinn:lonn:read', fysioPartner),
  scope('2024-01-15T12:15:00', 'Created', 'altinn:supertjenesten:read', fysioPartner),
  scope('2024-01-15T12:00:00', 'Created', 'altinn:supertjenesten:write'),
  entry('2024-03-02T09:00:00', skatteetaten, reportee, {
    type: 'Assignment',
    subtype: 'Resource',
    trigger: 'Created',
    resourceName: 'skatteetaten:arbeidsgiver:read',
    byName: 'Ola Nordmann',
  }),
];

const connectionsEntries: ActivityLogDto[] = [
  entry('2025-03-10T09:30:00', reportee, liseLarsen, {
    type: 'Assignment',
    subtype: 'Package',
    trigger: 'Created',
    packageName: 'Lønn',
  }),
  entry('2025-03-10T09:29:00', reportee, liseLarsen, {
    type: 'Assignment',
    trigger: 'Created',
    roleName: 'Rettighetshaver',
  }),
  entry('2025-02-01T13:05:00', reportee, fysioPartner, {
    type: 'Assignment',
    subtype: 'Package',
    trigger: 'Deleted',
    packageName: 'Regnskap og økonomirapportering',
    byName: 'Kari Tilgangsstyrer',
  }),
  entry('2025-01-20T08:00:00', reportee, fysioPartner, {
    type: 'Delegation',
    subtype: 'Package',
    trigger: 'Created',
    packageName: 'Regnskapsfører med signeringsrett',
    viaName: regnskapsbyraaet.name,
    viaId: regnskapsbyraaet.id,
  }),
  entry('2024-12-24T10:00:00', reportee, liseLarsen, {
    type: 'Assignment',
    subtype: 'Instance',
    trigger: 'Updated',
    instanceId: 'skd/mva-melding/2024-11',
    byName: null,
  }),
  entry('2024-11-02T15:45:00', skatteetaten, reportee, {
    type: 'Assignment',
    subtype: 'Resource',
    trigger: 'Created',
    resourceName: 'Skattemelding for næringsdrivende',
    byName: 'Ola Nordmann',
  }),
];

const requestEntries: ActivityLogDto[] = [
  entry('2025-04-02T12:00:00', reportee, liseLarsen, {
    type: 'Request',
    subtype: 'Package',
    trigger: 'Updated',
    status: 'Approved',
    packageName: 'Lønn',
  }),
  entry('2025-04-01T16:20:00', reportee, liseLarsen, {
    type: 'Request',
    subtype: 'Package',
    trigger: 'Created',
    status: 'Pending',
    packageName: 'Lønn',
    byName: 'Lise Larsen',
  }),
  entry('2025-03-28T09:10:00', reportee, fysioPartner, {
    type: 'Request',
    subtype: 'Resource',
    trigger: 'Updated',
    status: 'Rejected',
    resourceName: 'Sykmelding',
  }),
  entry('2025-03-20T11:00:00', skatteetaten, reportee, {
    type: 'Request',
    subtype: 'Resource',
    trigger: 'Updated',
    status: 'Withdrawn',
    resourceName: 'Skattemelding for næringsdrivende',
    byName: 'Helle Hovedadmin',
  }),
];

const sampleEntries: Record<ActivityLogArea, ActivityLogDto[]> = {
  connections: connectionsEntries,
  request: requestEntries,
  maskinporten: maskinportenEntries,
};

const STORY_PAGE_SIZE = 4;

interface StoryArgs {
  area: ActivityLogArea;
  isLoading?: boolean;
  isError?: boolean;
  empty?: boolean;
}

/** Plays the part of the area endpoints: filters by direction and party, and pages the result. */
const ActivityLogTabPanelStory = ({ area, isLoading, isError, empty }: StoryArgs) => {
  const {
    direction,
    changeDirection,
    filterState,
    changeFilterState,
    selectedPartyIds,
    pageNo,
    loadMore,
  } = useActivityLogQueryState();

  const inDirection = (empty ? [] : sampleEntries[area])
    .filter((item) => (direction === 'from' ? item.fromId : item.toId) === reportee.id)
    .sort((a, b) => b.when.localeCompare(a.when));
  const partyOptions = [
    ...new Map<string, Party>(
      inDirection.map((item) => {
        const party =
          direction === 'from'
            ? { id: item.toId, name: item.toName }
            : { id: item.fromId, name: item.fromName };
        return [party.id ?? '', { id: party.id ?? '', name: party.name ?? '' }];
      }),
    ).values(),
  ];
  const filtered = inDirection.filter(
    (item) =>
      selectedPartyIds.length === 0 ||
      selectedPartyIds.includes((direction === 'from' ? item.toId : item.fromId) ?? ''),
  );
  const visible = filtered.slice(0, (pageNo + 1) * STORY_PAGE_SIZE);

  const props: ActivityLogTabPanelProps = {
    area,
    direction,
    onDirectionChange: changeDirection,
    reporteeName: reportee.name,
    filterState,
    onFilterStateChange: changeFilterState,
    partyOptions,
    entries: visible,
    isLoading,
    isError,
    hasMore: visible.length < filtered.length,
    onLoadMore: loadMore,
  };

  return <ActivityLogTabPanel {...props} />;
};

const meta: Meta<StoryArgs> = {
  title: 'Features/AMUI/ActivityLog/ActivityLogTabPanel',
  render: (args) => <ActivityLogTabPanelStory {...args} />,
  argTypes: {
    area: { control: 'radio', options: ['connections', 'request', 'maskinporten'] },
  },
  decorators: [
    (Story) => (
      <RootProvider>
        <Story />
      </RootProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Maskinporten: Story = { args: { area: 'maskinporten' } };

export const Connections: Story = { args: { area: 'connections' } };

export const Requests: Story = { args: { area: 'request' } };

export const Loading: Story = { args: { area: 'maskinporten', isLoading: true } };

export const Empty: Story = { args: { area: 'maskinporten', empty: true } };

export const ErrorState: Story = { args: { area: 'maskinporten', isError: true } };
