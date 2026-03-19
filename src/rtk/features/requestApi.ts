import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Entity } from '@/dataObjects/dtos/Common';
import { ServiceResource } from './singleRights/singleRightsApi';

export type RequestStatus = 'None' | 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';

export interface RequestResourceDto {
  id: string;
  type: string;
  status: RequestStatus;
  from: Entity;
  to: Entity;
  lastUpdated: string;
  resourceId: string;
  resource?: ServiceResource;
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
      RequestResourceDto[],
      { party: string; to?: string; includeResources?: boolean; status?: RequestStatus[] }
    >({
      query: ({ party, to, includeResources = false, status = [] }) => {
        let params = `?party=${party}`;
        if (to) params += `&to=${to}`;
        if (includeResources) params += `&includeResources=true`;
        for (const s of status) params += `&status=${s}`;
        return `sent${params}`;
      },
      providesTags: ['sentRequests'],
    }),
    getReceivedRequests: builder.query<
      RequestResourceDto[],
      { party: string; from?: string; includeResources?: boolean; status?: RequestStatus[] }
    >({
      query: ({ party, from, includeResources = false, status = [] }) => {
        let params = `?party=${party}`;
        if (from) params += `&from=${from}`;
        if (includeResources) params += `&includeResources=true`;
        for (const s of status) params += `&status=${s}`;
        return `received${params}`;
      },
      providesTags: ['receivedRequests'],
    }),
    getRequest: builder.query<RequestResourceDto, { party: string; id: string }>({
      query: ({ party, id }) => `${id}?party=${party}`,
      providesTags: ['request'],
    }),

    // delegation modal queries and mutations
    getPendingSingleRightRequests: builder.query<
      RequestResourceDto[],
      { party: string; to: string; includeResources?: boolean }
    >({
      query: ({ party, to, includeResources = false }) =>
        `sent?party=${party}&to=${to}&status=pending${includeResources ? '&includeResources=true' : ''}`,
      providesTags: [Tags.PendingSentRequests],
    }),
    createResourceRequest: builder.mutation<
      RequestResourceDto,
      { party: string; to: string; resource: string }
    >({
      query: ({ party, to, resource }) => ({
        url: `resource?party=${party}&to=${to}&resource=${encodeURIComponent(resource)}`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.PendingSentRequests, 'sentRequests'],
    }),
    withdrawRequest: builder.mutation<RequestResourceDto, { party: string; id: string }>({
      query: ({ party, id }) => ({
        url: `sent/withdraw?party=${party}&id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [Tags.PendingSentRequests, 'sentRequests'],
    }),
  }),
});

export const {
  useGetSentRequestsQuery,
  useGetReceivedRequestsQuery,
  useGetRequestQuery,
  useGetPendingSingleRightRequestsQuery,
  useCreateResourceRequestMutation,
  useWithdrawRequestMutation,
} = requestApi;

export const { endpoints, reducerPath, reducer, middleware } = requestApi;
