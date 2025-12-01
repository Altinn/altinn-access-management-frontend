import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  ActiveConsentListItem,
  Consent,
  ConsentHistoryItem,
  ConsentParty,
  ConsentRequest,
} from '@/features/amUI/consent/types';
import { formatDisplayName } from '@altinn/altinn-components';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/`;

const formatName = (party: ConsentParty): ConsentParty => {
  const type = party.type === 'Person' ? 'person' : 'company';
  return {
    ...party,
    name: formatDisplayName({ fullName: party.name, type: type }),
  };
};

function formatPartyNames<
  T extends { fromParty: ConsentParty; toParty: ConsentParty; handledByParty?: ConsentParty },
>(item: T): T {
  return {
    ...item,
    fromParty: formatName(item.fromParty),
    toParty: formatName(item.toParty),
    ...(item.handledByParty && {
      handledByParty: formatName(item.handledByParty),
    }),
  };
}

enum Tags {
  ConsentList = 'ConsentList',
  ConsentLog = 'ConsentLog',
}

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
  tagTypes: [Tags.ConsentList, Tags.ConsentLog],
  endpoints: (builder) => ({
    // consent request
    getConsentRequest: builder.query<ConsentRequest, { requestId: string }>({
      query: ({ requestId }) => `consent/request/${requestId}`,
      transformResponse: (response: ConsentRequest): ConsentRequest => {
        return formatPartyNames<ConsentRequest>(response);
      },
    }),
    approveConsentRequest: builder.mutation<boolean, { requestId: string; language: string }>({
      query: ({ requestId, language }) => ({
        url: `consent/request/${requestId}/approve`,
        method: 'POST',
        body: { language },
      }),
      invalidatesTags: [Tags.ConsentList, Tags.ConsentLog],
    }),
    rejectConsentRequest: builder.mutation<boolean, { requestId: string }>({
      query: ({ requestId }) => ({
        url: `consent/request/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.ConsentList, Tags.ConsentLog],
    }),

    // active consents
    getActiveConsents: builder.query<ActiveConsentListItem[], { partyId: string }>({
      query: ({ partyId }) => `consent/active/${partyId}`,
      providesTags: [Tags.ConsentList],
      transformResponse: (response: ActiveConsentListItem[]): ActiveConsentListItem[] => {
        return response.map(formatPartyNames<ActiveConsentListItem>);
      },
    }),
    getConsentLog: builder.query<ConsentHistoryItem[], { partyId: string }>({
      query: ({ partyId }) => `consent/log/${partyId}`,
      providesTags: [Tags.ConsentLog],
      transformResponse: (response: ConsentHistoryItem[]): ConsentHistoryItem[] => {
        return response.map(formatPartyNames<ConsentHistoryItem>);
      },
    }),
    getConsent: builder.query<Consent, { consentId: string }>({
      query: ({ consentId }) => `consent/${consentId}`,
      transformResponse: (response: Consent): Consent => {
        return formatPartyNames<Consent>(response);
      },
    }),
    revokeConsent: builder.mutation<boolean, { consentId: string }>({
      query: ({ consentId }) => ({
        url: `consent/${consentId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.ConsentList, Tags.ConsentLog],
    }),
  }),
});

const apiWithTags = consentApi.enhanceEndpoints({
  addTagTypes: [Tags.ConsentList],
});

export const {
  useGetConsentRequestQuery,
  useApproveConsentRequestMutation,
  useRejectConsentRequestMutation,
  useGetActiveConsentsQuery,
  useGetConsentLogQuery,
  useGetConsentQuery,
  useRevokeConsentMutation,
} = apiWithTags;

export const { endpoints, reducerPath, reducer, middleware } = apiWithTags;
