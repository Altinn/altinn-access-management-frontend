import type { ActivityLogDirection, ActivityLogDto, ActivityLogFilterValueDto } from './types';

/**
 * Sample Maskinporten activity log data for Storybook and local testing until the API is wired up.
 * The reportee is Fysioterapeutene AS; `getSampleActivityLog` plays the part of the area endpoints.
 */

type Party = ActivityLogFilterValueDto;

export const sampleReportee: Party = { id: 'fysioterapeutene-as', name: 'Fysioterapeutene AS' };
const liseLarsen: Party = { id: 'lise-larsen-as', name: 'Lise Larsen AS' };
const fysioPartner: Party = { id: 'fysio-partner-as', name: 'Fysio Partner AS' };
const skatteetaten: Party = { id: 'skatteetaten', name: 'Skatteetaten' };
const helle: Party = { id: 'helle-hovedadmin', name: 'Helle Hovedadmin' };
const kari: Party = { id: 'kari-tilgangsstyrer', name: 'Kari Tilgangsstyrer' };
const ola: Party = { id: 'ola-nordmann', name: 'Ola Nordmann' };

let nextId = 1;

const entry = (
  when: string,
  from: Party,
  to: Party,
  fields: Partial<ActivityLogDto> & Pick<ActivityLogDto, 'trigger'>,
): ActivityLogDto => {
  const id = nextId++;
  return {
    id: String(id),
    itemId: `item-${id}`,
    type: 'Assignment',
    when,
    byId: helle.id,
    byName: helle.name,
    fromId: from.id,
    fromName: from.name,
    fromType: 'Organisasjon',
    toId: to.id,
    toName: to.name,
    toType: 'Organisasjon',
    roleName: 'Leverandør',
    ...fields,
  };
};

const scope = (when: string, trigger: ActivityLogDto['trigger'], name: string, to = liseLarsen) =>
  entry(when, sampleReportee, to, { subtype: 'Resource', trigger, resourceName: name });

export const sampleActivityLogEntries: ActivityLogDto[] = [
  scope('2025-01-15T11:15:00', 'Created', 'altinn:supertjenesten:read'),
  scope('2025-01-15T11:10:00', 'Deleted', 'altinn:supertjenesten:read'),
  scope('2025-02-23T14:15:00', 'Created', 'altinn:starbucks:read'),
  scope('2024-11-20T11:15:00', 'Created', 'altinn:pensjon:read'),
  scope('2024-09-09T11:58:00', 'Deleted', 'altinn:lonn:read'),
  scope('2024-01-15T12:30:00', 'Created', 'altinn:lonn:read', fysioPartner),
  scope('2024-01-15T12:15:00', 'Created', 'altinn:supertjenesten:read', fysioPartner),
  entry('2024-01-15T12:14:00', sampleReportee, fysioPartner, {
    trigger: 'Created',
    byId: kari.id,
    byName: kari.name,
  }),
  scope('2024-01-15T12:00:00', 'Created', 'altinn:supertjenesten:write'),
  entry('2024-03-02T09:00:00', skatteetaten, sampleReportee, {
    subtype: 'Resource',
    trigger: 'Created',
    resourceName: 'skatteetaten:arbeidsgiver:read',
    byId: ola.id,
    byName: ola.name,
  }),
];

export interface SampleActivityLogQuery {
  direction: ActivityLogDirection;
  /** Ids of the counterparts to show; empty shows all. */
  selectedPartyIds: string[];
  /** Ids of the users or systems that performed the change; empty shows all. */
  selectedByIds?: string[];
  /** ISO 8601 bounds on when the event happened. */
  after?: string;
  before?: string;
  /** 0-based; pages 0..pageNo are returned, like the paged list the tab accumulates. */
  pageNo: number;
  pageSize: number;
}

export interface SampleActivityLog {
  /** What `GET maskinporten/activitylog` would return for the direction, filter and pages so far. */
  entries: ActivityLogDto[];
  /** What `GET maskinporten/activitylog/filter/{to|from}` would return for the direction. */
  partyOptions: ActivityLogFilterValueDto[];
  /** What `GET maskinporten/activitylog/filter/by` would return for the direction. */
  byOptions: ActivityLogFilterValueDto[];
  hasMore: boolean;
}

const counterpartId = (item: ActivityLogDto, direction: ActivityLogDirection) =>
  (direction === 'from' ? item.toId : item.fromId) ?? '';

const distinctParties = (pairs: [string, string | null | undefined][]): Party[] => [
  ...new Map<string, Party>(pairs.map(([id, name]) => [id, { id, name: name ?? '' }])).values(),
];

const inPeriod = (item: ActivityLogDto, after?: string, before?: string) => {
  const when = new Date(item.when).getTime();
  return (
    (!after || when >= new Date(after).getTime()) && (!before || when <= new Date(before).getTime())
  );
};

/** Plays the part of the area endpoints: filters by direction, party, performer and period, and pages the result. */
export const getSampleActivityLog = (
  {
    direction,
    selectedPartyIds,
    selectedByIds = [],
    after,
    before,
    pageNo,
    pageSize,
  }: SampleActivityLogQuery,
  entries: ActivityLogDto[] = sampleActivityLogEntries,
): SampleActivityLog => {
  const inDirection = entries
    .filter((item) => (direction === 'from' ? item.fromId : item.toId) === sampleReportee.id)
    .sort((a, b) => b.when.localeCompare(a.when));
  const partyOptions = distinctParties(
    inDirection.map((item) => [
      counterpartId(item, direction),
      direction === 'from' ? item.toName : item.fromName,
    ]),
  );
  const byOptions = distinctParties(inDirection.map((item) => [item.byId ?? '', item.byName]));
  const filtered = inDirection.filter(
    (item) =>
      (selectedPartyIds.length === 0 ||
        selectedPartyIds.includes(counterpartId(item, direction))) &&
      (selectedByIds.length === 0 || selectedByIds.includes(item.byId ?? '')) &&
      inPeriod(item, after, before),
  );
  const visible = filtered.slice(0, (pageNo + 1) * pageSize);

  return { entries: visible, partyOptions, byOptions, hasMore: visible.length < filtered.length };
};
