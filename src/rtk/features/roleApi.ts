import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { CompactRole, Entity } from '@/dataObjects/dtos/Common';

export interface ProviderType {
  id: string;
  name: string;
}

export interface Permissions {
  to: Entity;
  from: Entity;
  via?: Entity;
  role: CompactRole | null;
  viaRole?: CompactRole | null;
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

export interface RolePermission {
  role: Role;
  permissions: Permissions[];
}

export interface RoleResourceMetadata {
  id: string;
  providerId: string;
  typeId: string;
  name: string;
  description: string;
  refId: string;
  provider?: Provider | null;
  type?: ProviderType | null;
}

export interface RolePackageMetadata {
  id: string;
  name: string;
  urn: string;
  description: string;
  isDelegable: boolean;
  isAssignable: boolean;
  isResourcePolicyAvailable: boolean;
  resources: RoleResourceMetadata[];
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/role`;

export const roleApi = createApi({
  reducerPath: 'roleApi',
  tagTypes: ['roles', 'role-permissions'],
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
    getRolePermissions: builder.query<
      RolePermission[],
      { party: string; from?: string; to?: string }
    >({
      query: ({ party, from, to }) => {
        return `/permissions?party=${party}&from=${from}&to=${to}`;
      },
      providesTags: ['role-permissions'],
    }),
    getAllRoles: builder.query<Role[], { language: string }>({
      query: () => `/meta`,
      keepUnusedDataFor: 3600, // 1 hour
      providesTags: ['roles'],
      serializeQueryArgs: ({ queryArgs, endpointName }) => ({
        // Custom cache key with selected language to ensure refetching when language changes
        endpointName,
        language: queryArgs.language,
      }),
    }),
    getRolePackages: builder.query<
      RolePackageMetadata[],
      { roleCode: string; variant?: string; includeResources?: boolean }
    >({
      query: ({ roleCode, variant, includeResources = false }) => {
        const params = new URLSearchParams({
          roleCode,
          includeResources: includeResources.toString(),
        });
        if (variant) params.append('variant', variant);
        return `/packages?${params.toString()}`;
      },
    }),
    getRoleResources: builder.query<
      RoleResourceMetadata[],
      { roleCode: string; variant?: string; includePackageResources?: boolean }
    >({
      query: ({ roleCode, variant, includePackageResources = false }) => {
        const params = new URLSearchParams({
          roleCode,
          includePackageResources: includePackageResources.toString(),
        });
        if (variant) params.append('variant', variant);
        return `/resources?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetRolePermissionsQuery,
  useGetAllRolesQuery,
  useGetRolePackagesQuery,
  useGetRoleResourcesQuery,
} = roleApi;

export const { endpoints, reducerPath, reducer, middleware } = roleApi;
