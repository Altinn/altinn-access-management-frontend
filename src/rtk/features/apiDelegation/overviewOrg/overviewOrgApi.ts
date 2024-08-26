import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type CustomError } from '@/dataObjects';
import { DelegationType } from '@/features/apiDelegation/components/DelegationType';

export interface ApiListItem {
  id: string;
  apiName: string;
  owner: string;
  description: string;
  scopes: string[];
}

export interface OverviewOrg {
  id: string;
  name: string;
  orgNumber: string;
  apiList: ApiListItem[];
}
export interface SliceState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  error: CustomError;
}

export interface SingleDeletionRequest {
  partyId?: string;
  delegationType: DelegationType;
  apiDelegation: DeletionDto;
}

export interface BatchDeletionRequest {
  partyId?: string;
  apiDelegations: DeletionDto[];
  delegationType: DelegationType;
}

export interface DeletionDto {
  orgNumber: string;
  apiId: string;
}

interface DeletionResponseDto {
  orgNumber: string;
  apiId: string;
  success: boolean;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const overviewOrgApi = createApi({
  reducerPath: 'overviewOrgApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['APIs', 'overviewOrg'],
  endpoints: (builder) => ({
    fetchOverviewOrgs: builder.query<
      OverviewOrg[],
      { partyId?: string; delegationType: DelegationType }
    >({
      query: ({ partyId, delegationType }) =>
        `/apidelegation/${partyId}/${delegationType === DelegationType.Offered ? 'offered' : 'received'}`,
      providesTags: ['overviewOrg'],
    }),
    deleteApiDelegation: builder.mutation<void, SingleDeletionRequest>({
      query: ({ partyId, delegationType, apiDelegation }) => ({
        url: `/apidelegation/${partyId}/${delegationType === DelegationType.Offered ? 'offered' : 'received'}/revoke`,
        method: 'POST',
        body: apiDelegation,
      }),
      invalidatesTags: ['overviewOrg'],
    }),
    deleteApiDelegationBatch: builder.mutation<DeletionResponseDto[], BatchDeletionRequest>({
      query: ({ partyId, apiDelegations, delegationType }) => ({
        url: `/apidelegation/${partyId}/${delegationType === DelegationType.Offered ? 'offered' : 'received'}/revoke/batch`,
        method: 'POST',
        body: apiDelegations,
      }),
      invalidatesTags: ['overviewOrg'],
    }),
  }),
});

export const {
  useFetchOverviewOrgsQuery,
  useDeleteApiDelegationMutation,
  useDeleteApiDelegationBatchMutation,
} = overviewOrgApi;
