import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/selfidentifieduser`;

export const selfIdentifiedUserApi = createApi({
  reducerPath: 'selfIdentifiedUserApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['clients', 'agents', 'agentAccessPackages', 'clientAccessPackages', 'myClients'],
  endpoints: (builder) => ({
    addAltinn2User: builder.mutation<boolean, { to: string; username: string; password: string }>({
      query: ({ to, username, password }) => ({
        url: `altinn2user?to=${to}`,
        method: 'POST',
        body: { username: username, password: password },
      }),
    }),
  }),
});

export const { useAddAltinn2UserMutation } = selfIdentifiedUserApi;

export const { endpoints, reducerPath, reducer, middleware } = selfIdentifiedUserApi;
