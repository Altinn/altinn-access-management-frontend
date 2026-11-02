import { type TFunction } from 'i18next';

import { type DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';
import { hasMissingAccessCode, isAccessListFailure } from '@/resources/utils/errorCodeUtils';

export const getMissingAccessMessage = (
  response: DelegationCheckedRight[],
  t: TFunction,
  resourceOwnerName?: string,
  reporteeName?: string,
): string | null => {
  const reasonCodes = response.flatMap((right) => right.reasonCodes);
  const hasMissingRoleAccess = hasMissingAccessCode(reasonCodes);
  const hasAccessListFailure = isAccessListFailure(reasonCodes);

  if (hasMissingRoleAccess) {
    return t('delegation_modal.specific_rights.missing_role_message');
  }
  if (hasAccessListFailure) {
    return t('delegation_modal.specific_rights.access_list_message', {
      resourceOwner: resourceOwnerName,
      reportee: reporteeName,
    });
  }
  return null;
};
