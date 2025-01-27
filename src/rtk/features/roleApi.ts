import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

interface EntityType {
  id: string;
  providerId: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
}

export interface Role {
  entityType: EntityType;
  provider: Provider;
  id: string;
  entityTypeId: string;
  providerId: string;
  name: string;
  code: string;
  description: string;
  urn: string;
}

export interface Assignment {
  id: string;
  roleId: string;
  fromId: string;
  toId: string;
  isDelegable: boolean;
  role: Role;
}

interface RoleApiRequest {
  rightOwnerUuid: string;
  rightHolderUuid: string;
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
    getRolesForUser: builder.query<Assignment[], RoleApiRequest>({
      query: ({ rightOwnerUuid, rightHolderUuid }) =>
        `/assignments/${rightOwnerUuid}/${rightHolderUuid}`,
    }),
    revoke: builder.mutation<void, { to: string; roleId: string }>({
      query({ to, roleId }) {
        return {
          url: `${getCookie('AltinnPartyUuid')}/${to}/${roleId}/revoke`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['roles'],
    }),
    delegate: builder.mutation<void, { to: string; roleId: string }>({
      invalidatesTags: ['roles'],
      query: (args) => {
        return {
          url: `delegate/${getCookie('AltinnPartyId')}/${args.roleId}/${args.to}`,
          method: 'POST',
        };
      },
    }),
  }),
});

export const { useGetRolesForUserQuery, useRevokeMutation, useDelegateMutation } = roleApi;

export const { endpoints, reducerPath, reducer, middleware } = roleApi;
