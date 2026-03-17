import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

enum Tags {
  PendingSentRequests = 'PendingSentRequests',
}

export interface SingleRightRequest {
  id: string;
  type: 'resource';
  status: string;
  from: {
    id: string;
    name: string;
    type: 'organization' | 'person';
  };
  to: {
    id: string;
    name: string;
    type: 'organization' | 'person';
  };
  resourceId: string;
}

export const requestApi = createApi({
  reducerPath: 'requestApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: [Tags.PendingSentRequests],
  endpoints: (builder) => ({
    // request single right access
    getPendingSingleRightRequests: builder.query<
      SingleRightRequest[],
      { actingParty: string; to: string }
    >({
      query: ({ actingParty, to }) => `request/sent?party=${actingParty}&to=${to}&status=pending`,
      providesTags: [Tags.PendingSentRequests],
    }),

    createSingleRightRequest: builder.mutation<
      SingleRightRequest,
      { actingParty: string; to: string; resource: string }
    >({
      query: ({ actingParty, to, resource }) => {
        return {
          url: `request/resource?party=${actingParty}&to=${to}&resource=${encodeURIComponent(resource)}`,
          method: 'POST',
        };
      },
      invalidatesTags: [Tags.PendingSentRequests],
    }),

    deleteSingleRightRequest: builder.mutation<
      SingleRightRequest,
      { requestId: string; actingParty: string }
    >({
      query: ({ requestId, actingParty }) => {
        return {
          url: `request/sent/withdraw?party=${actingParty}&id=${requestId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: [Tags.PendingSentRequests],
    }),
  }),
});

export const {
  useGetPendingSingleRightRequestsQuery,
  useDeleteSingleRightRequestMutation,
  useCreateSingleRightRequestMutation,
} = requestApi;

export const { endpoints, reducerPath, reducer, middleware } = requestApi;
