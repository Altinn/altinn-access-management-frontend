import { createApi } from '@reduxjs/toolkit/query/react';
import { formatDisplayName } from '@altinn/altinn-components';

import { createBaseQuery } from '@/rtk/app/baseQuery';

export interface IdPortenAuthorization {
  authorizationId: string;
  clientId: string;
  clientName: string;
  authorizedAt: number;
  expires: number;
  scopes: {
    name: string;
    description: string;
    longDescription: string;
  }[];
  userAgent: string;
  consumerName: string;
  consumerPartyUuid: string;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/`;

enum Tags {
  IdPortenAuthorizationList = 'IdPortenAuthorizationList',
}

export const idPortenAuthorizationApi = createApi({
  reducerPath: 'idPortenAuthorizationApi',
  baseQuery: createBaseQuery(baseUrl),
  tagTypes: [Tags.IdPortenAuthorizationList],
  endpoints: (builder) => ({
    getIdPortenAuthorizations: builder.query<IdPortenAuthorization[], void>({
      query: () => 'idportenauthorization',
      providesTags: [Tags.IdPortenAuthorizationList],
      transformResponse: (response: IdPortenAuthorization[]): IdPortenAuthorization[] => {
        return response.map((x) => {
          return {
            ...x,
            consumerName: formatDisplayName({ fullName: x.consumerName, type: 'company' }),
          };
        });
      },
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
