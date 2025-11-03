import type { RoleConnection } from '@/rtk/features/roleApi';

export const filterDigdirAssignments = (connections: RoleConnection[] = []) =>
  connections?.filter((connection) => connection.role.urn?.includes('digdir:')) || [];

export const filterDigdirRole = (roleUrns: string[] = []) =>
  roleUrns?.filter((urn) => urn?.includes('digdir:')) || [];
