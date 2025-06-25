import type { RoleInfo } from '@/rtk/features/userInfoApi';

const keyroles = [
  'innehaver',
  'styreleder',
  'varamedlem',
  'regnskapsforer',
  'daglig-leder',
  'deltaker-delt-ansvar',
  'deltaker-fullt-ansvar',
  'komplementar',
  'bestyrende-reder',
  'bostyrer',
  'revisor',
];

export const getRoleCodesForKeyRoles = (roles: RoleInfo[]) =>
  roles.filter((r) => keyroles.includes(r.code ?? '')).map((r) => `user_role.${r.code}`);
