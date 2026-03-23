import { useTranslation } from 'react-i18next';

import { ChipRight } from '../common/DelegationModal/SingleRights/hooks/rightsUtils';
import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useInstanceDelegationRightsData } from '../common/DelegationModal/Instance/useInstanceDelegationRightsData';

export const getRightsSummaryTitle = (
  rights: ChipRight[],
  t: ReturnType<typeof useTranslation>['t'],
): string => {
  const checkedCount = rights.filter((r) => r.checked).length;
  if (checkedCount === rights.length) {
    return t('delegation_modal.actions.access_to_all');
  }
  return t('delegation_modal.actions.partial_access', {
    count: checkedCount,
    total: rights.length,
  });
};

export const useInstanceRights = ({
  resourceId,
  instanceUrn,
  isOpen,
}: {
  resourceId: string;
  instanceUrn: string;
  isOpen: boolean;
}) => {
  const {
    rights,
    setRights,
    resetRights,
    isLoading,
    rightsMetaTechnicalErrorDetails,
    delegationCheckError,
  } = useInstanceDelegationRightsData({
    resourceId,
    instanceUrn,
    isEnabled: isOpen,
  });

  const errorDetails = rightsMetaTechnicalErrorDetails ?? createErrorDetails(delegationCheckError);

  return { rights, setRights, resetRights, isLoading, errorDetails };
};
