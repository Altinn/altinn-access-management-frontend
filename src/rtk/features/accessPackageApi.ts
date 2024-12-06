import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { IdNamePair } from '@/dataObjects/dtos/IdNamePair';

export interface AccessArea {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  accessPackages: AccessPackage[];
}

export interface AccessPackage {
  id: string;
  name: string;
  description: string;
  resources: IdNamePair[];
  area: AccessArea;
}

export interface AccessPackageDelegation {
  accessPackageId: string;
  DelegationDetails: DelegationDetails;
}

export interface DelegationDetails {
  delegatedFrom: string;
  delegatedTo: string;
  lastChangedOn: Date;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'accesspackage';

export const accessPackageApi = createApi({
  reducerPath: 'accessPackageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['AccessPackages'],
  endpoints: (builder) => ({
    search: builder.query<AccessArea[], string>({
      query: (searchString) => {
        return `search?&searchString=${searchString}`;
      },
    }),
    getRightHolderDelegations: builder.query<{ [key: string]: AccessPackageDelegation[] }, string>({
      query: (rightHolderUuid) => {
        return `delegations/${getCookie('AltinnPartyUuid')}/${rightHolderUuid}`;
      },
      providesTags: ['AccessPackages'],
    }),
    revokeDelegation: builder.mutation<void, { from: string; to: string; packageId: string }>({
      query({ from, to, packageId }) {
        return {
          url: `${from}/${to}/${packageId}/revoke`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AccessPackages'],
    }),
  }),
});

export const { useSearchQuery, useGetRightHolderDelegationsQuery, useRevokeDelegationMutation } =
  accessPackageApi;

export const { endpoints, reducerPath, reducer, middleware } = accessPackageApi;
