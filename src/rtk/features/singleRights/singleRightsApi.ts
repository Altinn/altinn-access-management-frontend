import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { BaseAttribute } from '@/dataObjects/dtos/BaseAttribute';
import type {
  DelegationAccessResult,
  DelegationInputDto,
  DelegationResult,
  ResourceReference,
  RightChangesDto,
} from '@/dataObjects/dtos/resourceDelegation';

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
  tagTypes: ['SingleRights', 'overview'],
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
    delegationCheck: builder.mutation<DelegationAccessResult[], ResourceReference>({
      query: (resourceRef) => ({
        url: `singleright/checkdelegationaccesses/${getCookie('AltinnPartyId')}`,
        method: 'POST',
        body: JSON.stringify(resourceRef),
      }),
      transformErrorResponse: (response: { status: string | number }) => {
        return response.status;
      },
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
    delegateRights: builder.mutation<DelegationAccessResult[], DelegationInputDto>({
      query: (delegation) => ({
        url: `singleright/delegate/${getCookie('AltinnPartyId')}`,
        method: 'POST',
        body: JSON.stringify(delegation),
      }),
      invalidatesTags: ['overview'],
      transformErrorResponse: (response: { status: string | number }) => {
        return response.status;
      },
    }),
    revokeResource: builder.mutation<
      { isSuccessStatusCode: boolean },
      { from: string; to: string; resourceId: string }
    >({
      query({ from, to, resourceId }) {
        return {
          url: `singleright/${from}/${to}/${resourceId}/revoke`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['overview'],
    }),
    editResource: builder.mutation<
      { failedEdits: string[] },
      { from: string; to: string; resourceId: string; edits: RightChangesDto }
    >({
      query({ from, to, resourceId, edits }) {
        return {
          url: `singleright/${from}/${to}/${resourceId}/edit`,
          method: 'POST',
          body: JSON.stringify(edits),
        };
      },
      invalidatesTags: ['overview'],
    }),
  }),
});

export const {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
  useClearAccessCacheMutation,
  useDelegationCheckMutation,
  useDelegateRightsMutation,
  useRevokeResourceMutation,
  useEditResourceMutation,
} = singleRightsApi;

export const { endpoints, reducerPath, reducer, middleware } = singleRightsApi;
