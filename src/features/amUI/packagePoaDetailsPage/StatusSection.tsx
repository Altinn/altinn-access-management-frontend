import { ExclamationmarkTriangleFillIcon, XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useAccessPackageDelegationCheck } from '../common/DelegationCheck/AccessPackageDelegationCheckContext';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  UndelegatedPackageWarning,
  isCriticalAndUndelegated,
} from '../common/AccessPackageList/UndelegatedPackageWarning';
import { PartyType } from '@/rtk/features/userInfoApi';
import classes from '../common/DelegationModal/StatusSection.module.css';
import type { ExtendedAccessPackage } from '../common/AccessPackageList/useAreaPackageList';

interface StatusSectionProps {
  accessPackage?: AccessPackage;
}

export const StatusSection = ({ accessPackage }: StatusSectionProps) => {
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();
  const { canDelegatePackage } = useAccessPackageDelegationCheck();

  if (!accessPackage) {
    return null;
  }

  const delegationCheckResult = canDelegatePackage(accessPackage.id);
  const showDelegationCheckWarning = delegationCheckResult?.result === false;
  const cannotDelegateHere = accessPackage.isAssignable === false;
  const showUndelegatedWarning = isCriticalAndUndelegated(accessPackage as ExtendedAccessPackage);

  if (!showUndelegatedWarning && !cannotDelegateHere && !showDelegationCheckWarning) {
    return null;
  }

  const formattedFromPartyName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  return (
    <div
      className={classes.statusSection}
      aria-live='polite'
    >
      {showUndelegatedWarning && (
        <UndelegatedPackageWarning
          packageName={accessPackage?.name}
          fulltext
        />
      )}
      {cannotDelegateHere && (
        <div className={classes.infoLine}>
          <XMarkOctagonFillIcon
            fontSize='1.5rem'
            className={classes.dangerIcon}
          />
          <DsParagraph data-size='xs'>{t('delegation_modal.cannot_delegate_here')}</DsParagraph>
        </div>
      )}
      {!cannotDelegateHere && showDelegationCheckWarning && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.delegationCheckInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.delegation_check_not_delegable'
              components={{ b: <strong /> }}
              values={{
                you: t('common.you_uppercase'),
                reporteeorg: formattedFromPartyName,
              }}
            />
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
