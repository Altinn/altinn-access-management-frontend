import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Entity } from '@/dataObjects/dtos/Common';
import { ServiceResource } from './singleRights/singleRightsApi';

export type RequestStatus = 'None' | 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';

export interface RequestDto {
  id: string;
  type: string;
  status: RequestStatus;
  from: Entity;
  to: Entity;
  lastUpdated: string;
  resourceId?: string;
}

export interface EnrichedRequestDto extends RequestDto {
  resource: ServiceResource;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/request`;

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
  tagTypes: ['sentRequests', 'receivedRequests', 'request', 'enrichedSentResourceRequests'],
  endpoints: (builder) => ({
    // requests page queries
    getSentRequests: builder.query<
      RequestDto[],
      { party: string; to?: string; status?: RequestStatus[]; type?: string }
    >({
      query: ({ party, to, status = [], type }) => {
        let params = `?party=${party}`;
        if (to) params += `&to=${to}`;
        for (const s of status) params += `&status=${s}`;
        if (type) params += `&type=${type}`;
        return `sent${params}`;
      },
      providesTags: ['sentRequests'],
    }),
    getReceivedRequests: builder.query<
      RequestDto[],
      { party: string; from?: string; status?: RequestStatus[]; type?: string }
    >({
      query: ({ party, from, status = [], type }) => {
        let params = `?party=${party}`;
        if (from) params += `&from=${from}`;
        for (const s of status) params += `&status=${s}`;
        if (type) params += `&type=${type}`;
        return `received${params}`;
      },
      providesTags: ['receivedRequests'],
    }),
    getRequest: builder.query<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => `${id}?party=${party}`,
      providesTags: ['request'],
    }),

    // delegation modal queries and mutations
    getEnrichedSentResourceRequests: builder.query<
      EnrichedRequestDto[],
      { party: string; to?: string; status?: RequestStatus[] }
    >({
      query: ({ party, to, status = [] }) => {
        let params = `?party=${party}`;
        if (to) params += `&to=${to}`;
        for (const s of status) params += `&status=${s}`;
        return `sent/resource${params}`;
      },
      providesTags: ['enrichedSentResourceRequests'],
    }),
    createResourceRequest: builder.mutation<
      RequestDto,
      { party: string; to: string; resource: string }
    >({
      query: ({ party, to, resource }) => ({
        url: `resource?party=${party}&to=${to}&resource=${encodeURIComponent(resource)}`,
        method: 'POST',
      }),
      invalidatesTags: ['sentRequests', 'enrichedSentResourceRequests'],
    }),
    withdrawRequest: builder.mutation<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `sent/withdraw?party=${party}&id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['sentRequests', 'enrichedSentResourceRequests'],
    }),
    confirmRequest: builder.mutation<RequestDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `sent/confirm?party=${party}&id=${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['sentRequests', 'enrichedSentResourceRequests'],
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
  useCreateResourceRequestMutation,
  useWithdrawRequestMutation,
  useConfirmRequestMutation,
  useRejectRequestMutation,
  useApproveRequestMutation,
  useGetEnrichedSentResourceRequestsQuery,
} = requestApi;

export const { endpoints, reducerPath, reducer, middleware } = requestApi;
