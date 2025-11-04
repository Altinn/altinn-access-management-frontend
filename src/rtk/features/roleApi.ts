import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';

export interface ProviderType {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  refId?: string | null;
  logoUrl?: string | null;
  code?: string;
  typeId?: string;
  type?: ProviderType | null;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  urn?: string;
  isKeyRole?: boolean;
  legacyRoleCode?: string | null;
  legacyUrn?: string | null;
  provider?: Provider;
  area?: Area;
  isDelegable?: boolean;
}

interface Area {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
}

export interface RoleConnection {
  role: Role;
  permissions: Permissions[];
}

interface RoleConnectionsRequest {
  from: string;
  to: string;
  party?: string;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/role`;

export const roleApi = createApi({
  reducerPath: 'roleApi',
  tagTypes: ['roles'],
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      const token = getCookie('XSRF-TOKEN');
      if (typeof token === 'string') {
        headers.set('X-XSRF-TOKEN', token);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRolesForUser: builder.query<RoleConnection[], RoleConnectionsRequest>({
      query: ({ from, to, party = getCookie('AltinnPartyUuid') }) =>
        `/connections?party=${party}&from=${from}&to=${to}`,
      providesTags: ['roles'],
    }),
    revoke: builder.mutation<void, { from: string; to: string; roleId: string; party?: string }>({
      query({ from, to, roleId, party = getCookie('AltinnPartyUuid') }) {
        return {
          url: `/connections?party=${party}&from=${from}&to=${to}&roleId=${roleId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['roles'],
    }),
  }),
});

export const { useGetRolesForUserQuery, useRevokeMutation } = roleApi;

export const { endpoints, reducerPath, reducer, middleware } = roleApi;
