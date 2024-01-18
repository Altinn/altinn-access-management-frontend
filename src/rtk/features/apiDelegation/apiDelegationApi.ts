import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import type { DelegationAccessResult } from '@/dataObjects/dtos/resourceDelegation';
import { getCookie } from '@/resources/Cookie/CookieMethods';

export type ResourceReference = {
  resource: IdValuePair[];
  action?: string;
};

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const apiDelegationApi = createApi({
  reducerPath: 'apiDelegationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['APIs'],

  endpoints: (builder) => ({
    delegationCheck: builder.mutation<
      DelegationAccessResult,
      { partyId: string; resourceRef: ResourceReference }
    >({
      query: ({ partyId, resourceRef }) => ({
        url: `${partyId}/maskinportenschema/delegationcheck`,
        method: 'POST',
        body: JSON.stringify(resourceRef),
      }),
      transformResponse: (response: DelegationAccessResult[]) => {
        return response[0];
      },
      transformErrorResponse: (response: { status: string | number }, meta, arg) => {
        return response.status;
      },
    }),
  }),
});

export const { useDelegationCheckMutation } = apiDelegationApi;
