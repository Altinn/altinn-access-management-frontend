import type { ActivityLogDirection, ActivityLogDto, ActivityLogFilterValueDto } from './types';
import type { ActivityLogValueFilter } from './useActivityLogQueryState';

/**
 * Sample Maskinporten activity log data for Storybook and the tests. The reportee is
 * Fysioterapeutene AS; `getSampleActivityLog` plays the part of the area endpoints.
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
    toId: to.id,
    toName: to.name,
    roleName: 'Leverandør',
    ...fields,
  };
};

const scope = (when: string, trigger: ActivityLogDto['trigger'], name: string, to = liseLarsen) =>
  entry(when, sampleReportee, to, {
    subtype: 'Resource',
    trigger,
    resourceId: name,
    resourceName: name,
  });

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
  /** The value filters on the tab, from `getActivityLogValueFilters(sampleFilterFields, direction)`. */
  valueFilters: ActivityLogValueFilter[];
  /** The ids chosen in each value filter, by filter name; empty or missing shows all. */
  selectedIdsByName: Record<string, string[]>;
  /** The picker being searched and its term, narrowing that picker's options as `term` does. */
  search?: { name: string; term: string };
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
  /** What `GET maskinporten/activitylog/filter/{field}` would return for each value filter, by name. */
  optionsByName: Record<string, ActivityLogFilterValueDto[]>;
  hasMore: boolean;
}

/** What `GET maskinporten/activitylog/filter/fields` returns for the area, lower-cased. */
export const sampleFilterFields = ['from', 'to', 'by', 'resource', 'source', 'activitytype'];

/** The (id, name) of the entry's value for a lookup field, when it has one. */
const fieldValue = (
  item: ActivityLogDto,
  field: string,
): [string, string | null | undefined] | undefined => {
  switch (field) {
    case 'to':
      return item.toId ? [item.toId, item.toName] : undefined;
    case 'from':
      return item.fromId ? [item.fromId, item.fromName] : undefined;
    case 'by':
      return item.byId ? [item.byId, item.byName] : undefined;
    case 'resource':
      return item.resourceId ? [item.resourceId, item.resourceName] : undefined;
    case 'source':
      return item.sourceId ? [item.sourceId, item.sourceName] : undefined;
    default:
      return undefined;
  }
};

const distinctParties = (pairs: [string, string | null | undefined][], term = ''): Party[] =>
  [
    ...new Map<string, Party>(pairs.map(([id, name]) => [id, { id, name: name ?? '' }])).values(),
  ].filter((party) => party.name.toLowerCase().includes(term.trim().toLowerCase()));

const inPeriod = (item: ActivityLogDto, after?: string, before?: string) => {
  const when = new Date(item.when).getTime();
  return (
    (!after || when >= new Date(after).getTime()) && (!before || when <= new Date(before).getTime())
  );
};

/** Plays the part of the area endpoints: filters by direction, the value filters and period, and pages the result. */
export const getSampleActivityLog = (
  {
    direction,
    valueFilters,
    selectedIdsByName,
    search,
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
  const optionsByName = Object.fromEntries(
    valueFilters.map((filter) => [
      filter.name,
      distinctParties(
        inDirection.flatMap((item) => {
          const value = fieldValue(item, filter.field);
          return value ? [value] : [];
        }),
        search?.name === filter.name ? search.term : '',
      ),
    ]),
  );
  const filtered = inDirection.filter(
    (item) =>
      valueFilters.every((filter) => {
        const selected = selectedIdsByName[filter.name] ?? [];
        return (
          selected.length === 0 || selected.includes(fieldValue(item, filter.field)?.[0] ?? '')
        );
      }) && inPeriod(item, after, before),
  );
  const visible = filtered.slice(0, (pageNo + 1) * pageSize);

  return { entries: visible, optionsByName, hasMore: visible.length < filtered.length };
};
