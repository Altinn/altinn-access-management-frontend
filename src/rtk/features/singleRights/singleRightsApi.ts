import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { BaseAttribute } from '@/dataObjects/dtos/BaseAttribute';
import type { DelegationResult, RightChangesDto } from '@/dataObjects/dtos/resourceDelegation';

interface PaginatedListDTO {
  page: number;
  numEntriesTotal: number;
  pageList: ServiceResource[];
}

export interface ServiceResource {
  title: string;
  identifier: string;
  resourceOwnerName: string;
  resourceOwnerLogoUrl: string;
  resourceOwnerOrgNumber: string;
  resourceOwnerOrgcode: string;
  rightDescription: string;
  description?: string;
  resourceReferences: resourceReference[];
  authorizationReference: IdValuePair[];
  resourceType: string;
  delegable: boolean;
}

export interface ResourceDelegation {
  resource: ServiceResource;
  delegation: DelegationResult;
}

interface resourceReference {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

interface searchParams {
  searchString: string;
  ROfilters: string[];
  page: number;
  resultsPerPage: number;
}

export interface DelegationCheckedRight {
  rightKey: string;
  action: string;
  status: string;
  reasonCodes: string[];
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const singleRightsApi = createApi({
  reducerPath: 'singleRightsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['SingleRights', 'overview', 'delegationCheck'],
  endpoints: (builder) => ({
    // TODO: Move to resourceApi
    getPaginatedSearch: builder.query<PaginatedListDTO, searchParams>({
      query: (args) => {
        const { searchString, ROfilters, page, resultsPerPage } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/search?Page=${page}&ResultsPerPage=${resultsPerPage}&SearchString=${searchString}${filterUrl}`;
      },
    }),
    getSingleRightsForRightholder: builder.query<
      ResourceDelegation[],
      { party: string; userId: string }
    >({
      query: ({ party, userId }) => `singleright/${party}/rightholder/${userId}`,
      providesTags: ['overview'],
    }),
    delegationCheck: builder.query<DelegationCheckedRight[], string>({
      query: (resourceId) => ({
        url: `singleright/${getCookie('AltinnPartyUuid')}/delegationcheck/${resourceId}`,
        method: 'GET',
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
      providesTags: ['delegationCheck'],
    }),
    clearAccessCache: builder.mutation<void, { party: string; user: BaseAttribute }>({
      query({ party, user }) {
        return {
          url: `singleright/${party}/accesscache/clear`,
          method: 'PUT',
          body: JSON.stringify(user),
        };
      },
    }),
    delegateRights: builder.mutation<
      DelegationResult,
      {
        partyUuid: string;
        fromUuid: string;
        toUuid: string;
        resourceId: string;
        actionKeys: string[];
      }
    >({
      query: ({ partyUuid, fromUuid, toUuid, resourceId, actionKeys }) => ({
        url: `singleright/delegate?party=${partyUuid}&from=${fromUuid}&to=${toUuid}&resourceId=${encodeURIComponent(resourceId)}`,
        method: 'POST',
        body: JSON.stringify(actionKeys),
      }),
      transformErrorResponse: (response: { status: string | number }) => {
        return response.status;
      },
      invalidatesTags: ['overview', 'delegationCheck'],
    }),
    revokeResource: builder.mutation<
      { isSuccessStatusCode: boolean },
      { from: string; to: string; resourceId: string }
    >({
      query({ from, to, resourceId }) {
        return {
          url: `singleright/${from}/${to}/${encodeURIComponent(resourceId)}/revoke`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['overview', 'delegationCheck'],
    }),
    updateResource: builder.mutation<
      string[],
      { party: string; from: string; to: string; resourceId: string; actionKeys: string[] }
    >({
      query({ party, from, to, resourceId, actionKeys }) {
        return {
          url: `singleright/update?party=${party}&from=${from}&to=${to}&resourceId=${encodeURIComponent(resourceId)}`,
          method: 'PUT',
          body: JSON.stringify(actionKeys),
        };
      },
      invalidatesTags: ['overview', 'delegationCheck'],
    }),
  }),
});

export const {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
  useClearAccessCacheMutation,
  useDelegationCheckQuery,
  useDelegateRightsMutation,
  useRevokeResourceMutation,
  useUpdateResourceMutation,
} = singleRightsApi;

export const { endpoints, reducerPath, reducer, middleware } = singleRightsApi;
