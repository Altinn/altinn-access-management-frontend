import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { IdNamePair } from '@/dataObjects/dtos/IdNamePair';

import type { Party } from './lookupApi';

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
  inherited?: boolean;
  inheritedFrom?: Party;
}

export interface AccessPackageDelegation {
  accessPackageId: string;
  delegationDetails: DelegationDetails;
  inherited: boolean;
  inheritedFrom?: Party;
}

export interface DelegationDetails {
  delegatedFrom: string;
  delegatedTo: string;
  lastChangedOn: Date;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/accesspackage`;

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
    getUserDelegations: builder.query<
      { [key: string]: AccessPackageDelegation[] },
      { from: string; to: string }
    >({
      query: ({ from, to }) => {
        return `delegations/${from}/${to}`;
      },
      providesTags: ['AccessPackages'],
    }),
    revokeDelegation: builder.mutation<void, { to: string; packageId: string }>({
      query({ to, packageId }) {
        return {
          url: `${getCookie('AltinnPartyUuid')}/${to}/${packageId}/revoke`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AccessPackages'],
    }),
    delegatePackage: builder.mutation<void, { to: string; packageId: string }>({
      invalidatesTags: ['AccessPackages'],
      query: (args) => {
        return {
          url: `delegate/${getCookie('AltinnPartyId')}/${args.packageId}/${args.to}`,
          method: 'POST',
        };
      },
    }),
  }),
});

export const {
  useSearchQuery,
  useGetUserDelegationsQuery,
  useRevokeDelegationMutation,
  useDelegatePackageMutation,
} = accessPackageApi;

export const { endpoints, reducerPath, reducer, middleware } = accessPackageApi;
