import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface IdPortenAuthorization {
  authorization_id: string;
  client_id: string;
  client_name: string;
  client_description: string;
  authorized_at: number;
  expires: number;
  scopes: {
    name: string;
    description: string;
    long_description: string;
    requires_user_consent: boolean;
    owner_orgno: string;
  }[];
  user_agent: string;
  consumer: {
    orgNo: string;
    name: string;
  };
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/`;

enum Tags {
  IdPortenAuthorizationList = 'IdPortenAuthorizationList',
}

export const idPortenAuthorizationApi = createApi({
  reducerPath: 'idPortenAuthorizationApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: [Tags.IdPortenAuthorizationList],
  endpoints: (builder) => ({
    getIdPortenAuthorizations: builder.query<IdPortenAuthorization[], void>({
      query: () => 'idportenauthorization',
      providesTags: [Tags.IdPortenAuthorizationList],
    }),
    withdrawIdPortenAuthorization: builder.mutation<boolean, { id: string }>({
      query: ({ id }) => ({
        url: `idportenauthorization/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [Tags.IdPortenAuthorizationList],
    }),
  }),
});

const apiWithTags = idPortenAuthorizationApi.enhanceEndpoints({
  addTagTypes: [Tags.IdPortenAuthorizationList],
});

export const { useGetIdPortenAuthorizationsQuery, useWithdrawIdPortenAuthorizationMutation } =
  apiWithTags;

export const { endpoints, reducerPath, reducer, middleware } = apiWithTags;
