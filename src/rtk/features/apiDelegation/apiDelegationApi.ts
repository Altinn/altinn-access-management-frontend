import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import type { DelegationAccessResult } from '@/dataObjects/dtos/resourceDelegation';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { DelegableApi } from './delegableApi/delegableApiSlice';

export type ResourceReference = {
  resource: IdValuePair[];
  action?: string;
};

type PaginatedApiSearchResults = {
  page: number;
  numEntriesTotal: number;
  results: DelegableApi[];
};

interface searchParams {
  searchString: string;
  ROfilters: string[];
  page: number;
  resultsPerPage: number;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const apiDelegationApi = createApi({
  reducerPath: 'apiDelegationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['APIs'],
  endpoints: (builder) => ({
    delegationCheck: builder.mutation<
      DelegationAccessResult,
      { partyId: string; resourceRef: ResourceReference }
    >({
      query: ({ partyId, resourceRef }) => ({
        url: `${partyId}/maskinportenschema/delegationcheck`,
        method: 'POST',
        body: JSON.stringify(resourceRef),
      }),
      transformResponse: (response: DelegationAccessResult[]) => {
        return response[0];
      },
      transformErrorResponse: (response: { status: string | number }) => {
        return response.status;
      },
    }),
    getPaginatedSearch: builder.query<PaginatedApiSearchResults, searchParams>({
      query: (args) => {
        const { searchString, ROfilters, page, resultsPerPage } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/paginatedSearch?Page=${page}&ResultsPerPage=${resultsPerPage}&SearchString=${searchString}${filterUrl}`;
      },
    }),
  }),
});

export const { useDelegationCheckMutation } = apiDelegationApi;
