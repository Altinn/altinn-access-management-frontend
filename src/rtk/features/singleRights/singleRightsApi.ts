import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { BaseAttribute } from '@/dataObjects/dtos/BaseAttribute';
import type {
  DelegationAccessResult,
  DelegationInputDto,
  ResourceReference,
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

enum DelegationType {
  Offered,
  Received,
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
      ServiceResource[],
      { party: string; userId: string }
    >({
      query: ({ party, userId }) => `singleright/${party}/rightholder/${userId}`,
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
    delegateRights: builder.mutation<void, DelegationInputDto>({
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
    revokeRights: builder.mutation<
      { isSuccessStatusCode: boolean },
      { type: DelegationType; party: string; userId: string; resourceId: string }
    >({
      query({ type, party, userId, resourceId }) {
        return {
          url: `singleright/${party}/${type === DelegationType.Offered ? 'offered' : 'received'}/revoke`,
          method: 'POST',
          body: JSON.stringify({
            userId: userId,
            resourceId: resourceId,
          }),
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
  useRevokeRightsMutation,
} = singleRightsApi;

export const { endpoints, reducerPath, reducer, middleware } = singleRightsApi;
