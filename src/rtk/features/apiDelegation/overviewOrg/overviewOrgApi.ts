import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type CustomError } from '@/dataObjects';
import { LayoutState } from '@/features/apiDelegation/components/LayoutState';

export interface ApiListItem {
  id: string;
  apiName: string;
  isSoftDelete: boolean;
  owner: string;
  description: string;
  scopes: string[];
}

export interface OverviewOrg {
  id: string;
  name: string;
  orgNumber: string;
  isAllSoftDeleted: boolean;
  apiList: ApiListItem[];
}
export interface SliceState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  error: CustomError;
}

export interface SingleDeletionRequest {
  partyId?: string;
  layout: LayoutState;
  apiDelegation: DeletionDto;
}

export interface BatchDeletionRequest {
  partyId?: string;
  apiDelegations: DeletionDto[];
  layout: LayoutState;
}

export interface DeletionDto {
  orgNr: string;
  apiId: string;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

const overviewOrgApi = createApi({
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
    fetchOverviewOrgs: builder.query<OverviewOrg[], { partyId: string; layout: LayoutState }>({
      query: ({ partyId, layout }) =>
        `/apidelegation/${partyId}/${layout === LayoutState.Offered ? 'offered' : 'received'}`,
    }),
    deleteApiDelegation: builder.mutation<void, SingleDeletionRequest>({
      query: ({ partyId, layout, apiDelegation }) => ({
        url: `/apidelegation/${partyId}/${layout === LayoutState.Offered ? 'offered' : 'received'}/revoke`,
        method: 'POST',
        body: apiDelegation,
      }),
    }),
    deleteApiDelegationBatch: builder.mutation<void, BatchDeletionRequest>({
      query: ({ partyId, apiDelegations, layout }) => ({
        url: `/apidelegation/${partyId}/${layout === LayoutState.Offered ? 'offered' : 'received'}/revoke/batch`,
        method: 'POST',
        body: {
          layout: layout,
          apiDelegations: apiDelegations,
        },
      }),
    }),
  }),
});

export const {
  useFetchOverviewOrgsQuery,
  useDeleteApiDelegationMutation,
  useDeleteApiDelegationBatchMutation,
} = overviewOrgApi;
