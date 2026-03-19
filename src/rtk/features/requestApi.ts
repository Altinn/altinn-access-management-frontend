import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Entity } from '@/dataObjects/dtos/Common';

export type RequestStatus = 'None' | 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';

export interface RequestDto {
  id: string;
  type: string;
  status: RequestStatus;
  from: Entity;
  to: Entity;
  lastUpdated: string;
  resourceId: string;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/request`;

enum Tags {
  PendingSentRequests = 'PendingSentRequests',
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
  tagTypes: [Tags.PendingSentRequests, 'sentRequests', 'receivedRequests', 'request'],
  endpoints: (builder) => ({
    // requests page queries
    getSentRequests: builder.query<
      RequestDto[],
      { party: string; to?: string; status?: RequestStatus[] }
    >({
      query: ({ party, to, status = [] }) => {
        let params = `?party=${party}`;
        if (to) params += `&to=${to}`;
        for (const s of status) params += `&status=${s}`;
        return `sent${params}`;
      },
      providesTags: ['sentRequests'],
    }),
    getReceivedRequests: builder.query<
      RequestDto[],
      { party: string; from?: string; status?: RequestStatus[] }
    >({
      query: ({ party, from, status = [] }) => {
        let params = `?party=${party}`;
        if (from) params += `&from=${from}`;
        for (const s of status) params += `&status=${s}`;
        return `received${params}`;
      },
      providesTags: ['receivedRequests'],
    }),
    getRequest: builder.query<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => `${id}?party=${party}`,
      providesTags: ['request'],
    }),

    // delegation modal queries and mutations
    getPendingSentSingleRightRequests: builder.query<RequestDto[], { party: string; to: string }>({
      query: ({ party, to }) => `sent?party=${party}&to=${to}&status=pending`,
      providesTags: [Tags.PendingSentRequests],
    }),
    createResourceRequest: builder.mutation<
      RequestDto,
      { party: string; to: string; resource: string }
    >({
      query: ({ party, to, resource }) => ({
        url: `resource?party=${party}&to=${to}&resource=${encodeURIComponent(resource)}`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.PendingSentRequests, 'sentRequests'],
    }),
    withdrawRequest: builder.mutation<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `sent/withdraw?party=${party}&id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [Tags.PendingSentRequests, 'sentRequests'],
    }),
    confirmRequest: builder.mutation<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `sent/confirm?party=${party}&id=${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['sentRequests', Tags.PendingSentRequests],
    }),
    rejectRequest: builder.mutation<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `received/reject?party=${party}&id=${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['receivedRequests'],
    }),
    approveRequest: builder.mutation<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `received/approve?party=${party}&id=${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['receivedRequests'],
    }),
  }),
});

export const {
  useGetSentRequestsQuery,
  useGetReceivedRequestsQuery,
  useGetRequestQuery,
  useGetPendingSentSingleRightRequestsQuery,
  useCreateResourceRequestMutation,
  useWithdrawRequestMutation,
  useConfirmRequestMutation,
  useRejectRequestMutation,
  useApproveRequestMutation,
} = requestApi;

export const { endpoints, reducerPath, reducer, middleware } = requestApi;
