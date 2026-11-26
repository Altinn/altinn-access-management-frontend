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
 * The list parameters of the log query. Each takes the ids to include; values within one list are
 * OR'ed, different parameters are AND'ed. `from` and `to` are the parties that gave and received
 * access, `via` the facilitators, `by` the users or systems that made the change, `source` the
 * systems the change came through and `typeId` the activity type catalog entries.
 */
export const activityLogListParams = [
  'from',
  'to',
  'via',
  'by',
  'role',
  'package',
  'resource',
  'source',
  'typeId',
] as const;

export type ActivityLogListParam = (typeof activityLogListParams)[number];

/**
 * Filters for one area of the activity log, always anchored on the current reportee. `after` and
 * `before` are ISO 8601 bounds on when the event happened.
 */
export interface ActivityLogQueryArgs extends Partial<Record<ActivityLogListParam, string[]>> {
  area: ActivityLogArea;
  direction: ActivityLogDirection;
  after?: string;
  before?: string;
  /** Default 100, clamped to 1–1000 by the API. */
  pageSize?: number;
}

interface ActivityLogLookupArgs extends ActivityLogQueryArgs {
  /** `Name` (default) or `When` (newest occurrence first). */
  orderBy?: 'Name' | 'When';
}

export interface ActivityLogFilterValuesArgs extends ActivityLogLookupArgs {
  /** The filter field to list values for, one of those the area offers (e.g. `from`, `to`, `by`). */
  field: string;
  /** Case-insensitive substring to match names on. */
  term?: string;
}

export interface ActivityLogFilterOptionsArgs extends ActivityLogLookupArgs {
  /** The filter fields to list values for, each one of those the area offers. */
  fields: string[];
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/activitylog`;

const buildQueryString = (
  { area: _area, direction, after, before, pageSize, ...lists }: ActivityLogQueryArgs,
  extra: Record<string, string | number | undefined> = {},
): string => {
  const params = new URLSearchParams({ party: getCookie('AltinnPartyUuid'), direction });
  activityLogListParams.forEach((name) =>
    lists[name]?.forEach((value) => params.append(name, value)),
  );
  Object.entries({ after, before, pageSize, ...extra }).forEach(([name, value]) => {
    if (value !== undefined && value !== '') {
      params.set(name, String(value));
    }
  });
  return params.toString();
};

const filterValuesUrl = ({ field, term, orderBy, ...args }: ActivityLogFilterValuesArgs): string =>
  `${args.area}/filter/${encodeURIComponent(field)}?${buildQueryString(args, { term, orderBy })}`;

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
      query: filterValuesUrl,
    }),
    /**
     * The first page of values for each of several filter fields, keyed by field: what the pickers
     * offer before the user searches. One query, so the tab can offer however many fields the area
     * reports without a hook per field.
     */
    getActivityLogFilterOptions: builder.query<
      Record<string, ActivityLogFilterValueDto[]>,
      ActivityLogFilterOptionsArgs
    >({
      queryFn: async ({ fields, ...args }, _api, _extraOptions, fetchWithBQ) => {
        const results = await Promise.all(
          fields.map(async (field) => fetchWithBQ(filterValuesUrl({ ...args, field }))),
        );
        const failed = results.find((result) => result.error);
        if (failed?.error) {
          return { error: failed.error };
        }
        return {
          data: Object.fromEntries(
            fields.map((field, index) => [
              field,
              (results[index].data as PaginatedResult<ActivityLogFilterValueDto>).data,
            ]),
          ),
        };
      },
    }),
    /**
     * The filter fields the area offers, lower-cased to match the `field` of the value lookup. The
     * tab only builds the filters whose field is listed here.
     */
    getActivityLogFilterFields: builder.query<string[], { area: ActivityLogArea }>({
      query: ({ area }) => `${area}/filter/fields`,
      transformResponse: (fields: string[]) => fields.map((field) => field.toLowerCase()),
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
  useGetActivityLogFilterOptionsQuery,
  useGetActivityLogFilterFieldsQuery,
  useGetActivityTypesQuery,
} = activityLogApi;
