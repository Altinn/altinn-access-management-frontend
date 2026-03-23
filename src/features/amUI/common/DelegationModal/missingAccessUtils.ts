import { TFunction } from 'i18next';

import { DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

export const getMissingAccessMessage = (
  response: DelegationCheckedRight[],
  t: TFunction,
  resourceOwnerName?: string,
  reporteeName?: string,
): string | null => {
  const hasMissingRoleAccess = response.some((right) =>
    right.reasonCodes.some(
      (reasonCode) =>
        reasonCode === ErrorCode.MissingRoleAccess ||
        reasonCode === ErrorCode.MissingRightAccess ||
        reasonCode === ErrorCode.MissingDelegationAccess ||
        reasonCode === ErrorCode.MissingPackageAccess,
    ),
  );
  const hasMissingSrrRightAccess = response.some(
    (right) =>
      !hasMissingRoleAccess &&
      right.reasonCodes.some(
        (reasonCode) =>
          reasonCode === ErrorCode.MissingSrrRightAccess ||
          reasonCode === ErrorCode.AccessListValidationFail,
      ),
  );

  if (hasMissingRoleAccess) {
    return t('delegation_modal.specific_rights.missing_role_message');
  }
  if (hasMissingSrrRightAccess) {
    return t('delegation_modal.specific_rights.missing_srr_right_message', {
      resourceOwner: resourceOwnerName,
      reportee: reporteeName,
    });
  }
  return null;
};
