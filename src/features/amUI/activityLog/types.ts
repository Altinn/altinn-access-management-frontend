import type { RequestStatus } from '@/rtk/features/requestApi';

/** The API areas, in the order they are shown as tabs. */
export const activityLogAreas = ['connections', 'request', 'maskinporten'] as const;

export type ActivityLogArea = (typeof activityLogAreas)[number];

/** `from`: access given by the reportee. `to`: access received by the reportee. */
export type ActivityLogDirection = 'from' | 'to';

export type ActivityLogType = 'Assignment' | 'Delegation' | 'Request';

export type ActivityLogSubtype = 'Package' | 'Resource' | 'Instance';

export type ActivityLogTrigger = 'Created' | 'Updated' | 'Deleted';

/**
 * One entry in the activity log: the fields of the API's `ActivityLogDto` that the frontend reads.
 * Names are snapshots taken when the event happened.
 */
export interface ActivityLogDto {
  id: string;
  type: ActivityLogType;
  /** The child record category, or null when the entry describes the main record itself. */
  subtype?: ActivityLogSubtype | null;
  trigger: ActivityLogTrigger;
  /** ISO 8601 timestamp of when the event happened. */
  when: string;
  byId?: string | null;
  byName?: string | null;
  sourceId?: string | null;
  sourceName?: string | null;
  fromId?: string | null;
  fromName?: string | null;
  toId?: string | null;
  toName?: string | null;
  roleName?: string | null;
  packageName?: string | null;
  resourceId?: string | null;
  resourceName?: string | null;
  itemId: string;
  /** The activity type catalog entry for the event */
  activityTypeId?: string | null;
}

/** A catalog entry from `GET {area}/types` (`ActivityTypeDto`), translated by the API. */
export interface ActivityTypeDto {
  id: string;
  type: ActivityLogType;
  subtype?: ActivityLogSubtype | null;
  trigger: ActivityLogTrigger;
  status?: RequestStatus | null;
  name: string;
  description: string;
}

/** A value from `GET {area}/filter/{field}` (`ActivityLogFilterValueDto`). */
export interface ActivityLogFilterValueDto {
  id: string;
  name: string;
}

/** The paginated envelope of the list endpoints. `links.next` is present only when more entries exist. */
export interface PaginatedResult<T> {
  data: T[];
  links: {
    next?: string | null;
  };
}
