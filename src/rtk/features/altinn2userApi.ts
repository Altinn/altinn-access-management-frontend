import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/altinn2user`;

export const altinn2UserApi = createApi({
  reducerPath: 'altinn2UserApi',
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
    addAltinn2User: builder.mutation<boolean, { username: string; password: string }>({
      query: ({ username, password }) => ({
        url: '',
        method: 'POST',
        body: { username: username, password: password },
      }),
    }),
  }),
});

export const { useAddAltinn2UserMutation } = altinn2UserApi;

export const { endpoints, reducerPath, reducer, middleware } = altinn2UserApi;
