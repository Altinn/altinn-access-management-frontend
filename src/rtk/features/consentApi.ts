import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ActiveConsentListItem, ConsentRequest } from '@/features/amUI/consent/types';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/`;

export const consentApi = createApi({
  reducerPath: 'consentApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // consent request
    getConsentRequest: builder.query<ConsentRequest, { requestId: string }>({
      query: ({ requestId }) => `consent/request/${requestId}`,
    }),
    approveConsentRequest: builder.mutation<void, { requestId: string; language: string }>({
      query: ({ requestId, language }) => ({
        url: `consent/request/${requestId}/approve`,
        method: 'POST',
        body: { language },
      }),
    }),
    rejectConsentRequest: builder.mutation<void, { requestId: string }>({
      query: ({ requestId }) => ({
        url: `consent/request/${requestId}/reject`,
        method: 'POST',
      }),
    }),

    // active consents
    getActiveConsents: builder.query<ActiveConsentListItem[], { partyId: string }>({
      query: ({ partyId }) => `consent/active/${partyId}`,
    }),
  }),
});

export const {
  useGetConsentRequestQuery,
  useApproveConsentRequestMutation,
  useRejectConsentRequestMutation,
  useGetActiveConsentsQuery,
} = consentApi;

export const { endpoints, reducerPath, reducer, middleware } = consentApi;
