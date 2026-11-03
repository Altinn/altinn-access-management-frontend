import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  ActivityLogArea,
  ActivityLogDirection,
  ActivityLogDto,
  ActivityLogFilterValueDto,
  ActivityTypeDto,
  PaginatedResult,
} from '@/features/amUI/activityLog/types';

/**
 * Anchor and filters for one area of the activity log. `party` defaults to the current reportee.
 * Values within one list are OR'ed; different parameters are AND'ed.
 */
export interface ActivityLogQueryArgs {
  area: ActivityLogArea;
  direction: ActivityLogDirection;
  party?: string;
  /** Parties that gave access. */
  from?: string[];
  /** Parties that received access. */
  to?: string[];
  /** Facilitator parties. */
  via?: string[];
  /** Users or systems that performed the change. */
  by?: string[];
  /** Activity type catalog entries. */
  typeId?: string[];
  /** ISO 8601 lower bound on when the event happened. */
  after?: string;
  /** ISO 8601 upper bound on when the event happened. */
  before?: string;
  /** Default 100, clamped to 1–1000 by the API. */
  pageSize?: number;
}

export interface ActivityLogFilterValuesArgs extends ActivityLogQueryArgs {
  /** The filter field to list values for, one of those the area offers (e.g. `from`, `to`, `by`). */
  field: string;
  /** Case-insensitive substring to match names on. */
  term?: string;
  /** `Name` (default) or `When` (newest occurrence first). */
  orderBy?: 'Name' | 'When';
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/activitylog`;

const listParams = ['from', 'to', 'via', 'by', 'typeId'] as const;

const buildQueryString = (
  { party, direction, after, before, pageSize, ...rest }: ActivityLogQueryArgs,
  extra: Record<string, string | number | undefined> = {},
): string => {
  const params = new URLSearchParams({
    party: party ?? getCookie('AltinnPartyUuid'),
    direction,
  });
  listParams.forEach((name) => rest[name]?.forEach((value) => params.append(name, value)));
  Object.entries({ after, before, pageSize, ...extra }).forEach(([name, value]) => {
    if (value !== undefined && value !== '') {
      params.set(name, String(value));
    }
  });
  return params.toString();
};

export const activityLogApi = createApi({
  reducerPath: 'activityLogApi',
  baseQuery: createBaseQuery(baseUrl),
  endpoints: (builder) => ({
    /**
     * The area's log entries for the party, newest first. Pages are accumulated for use with a
     * "load more" button: `data.pages` holds every page fetched so far for the current arguments.
     */
    getActivityLog: builder.infiniteQuery<
      PaginatedResult<ActivityLogDto>,
      ActivityLogQueryArgs,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) =>
          lastPage.links?.next ? lastPageParam + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) =>
        `${queryArg.area}?${buildQueryString(queryArg, { pageNo: pageParam })}`,
    }),
    /** The values occurring in the party's slice of the area for one filter field. */
    getActivityLogFilterValues: builder.query<
      PaginatedResult<ActivityLogFilterValueDto>,
      ActivityLogFilterValuesArgs
    >({
      query: ({ field, term, orderBy, ...args }) =>
        `${args.area}/filter/${encodeURIComponent(field)}?${buildQueryString(args, { term, orderBy })}`,
    }),
    /**
     * The activity type catalog entries the area accepts. The BFF translates them to the selected
     * language cookie; `language` is only part of the cache key so a language change refetches.
     */
    getActivityTypes: builder.query<ActivityTypeDto[], { area: ActivityLogArea; language: string }>(
      {
        query: ({ area }) => `${area}/types`,
      },
    ),
  }),
});

export const {
  useGetActivityLogInfiniteQuery,
  useGetActivityLogFilterValuesQuery,
  useGetActivityTypesQuery,
} = activityLogApi;
