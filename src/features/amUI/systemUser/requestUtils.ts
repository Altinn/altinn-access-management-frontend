import { ProblemDetail } from './types';

export const getApiBaseUrl = (): string => {
  return `${import.meta.env.BASE_URL}accessmanagement/api/v1/systemuser`;
};

export const isPermissionErrorWhichCanBeEscalated = (error: ProblemDetail | undefined): boolean => {
  const permissionErrorCodes = [
    'AMUI-00016', //DelegationRightMissingRoleAccess
    'AMUI-00018', // DelegationRightMissingDelegationAccess
    'AMUI-00066', //Request_UserIsNotAccessManager
    'AMUI-00014', //UnableToDoDelegationCheck
    'AMUI-00050', //AccessPackage_DelegationCheckFailed
    'AMUI-00051', //AccessPackage_DelegationFailed
    'AMUI-00053', //AccessPackage_Delegation_MissingRequiredAccess
  ];
  return permissionErrorCodes.includes(error?.code || '');
};
