import { ExclamationmarkTriangleFillIcon, XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { DsParagraph } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useAccessPackageDelegationCheck } from '../common/DelegationCheck/AccessPackageDelegationCheckContext';
import { isCriticalAndUndelegated } from '../common/AccessPackageList/UndelegatedPackageWarning';
import classes from '../common/DelegationModal/StatusSection.module.css';
import type { ExtendedAccessPackage } from '../common/AccessPackageList/useAreaPackageList';

interface StatusSectionProps {
  accessPackage?: AccessPackage;
}

export const StatusSection = ({ accessPackage }: StatusSectionProps) => {
  const { t } = useTranslation();
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

  return (
    <div
      className={classes.statusSection}
      aria-live='polite'
    >
      {showUndelegatedWarning && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.warningIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='poa_status.no_permissions_fulltext'
              values={{ packageName: accessPackage?.name }}
              components={{ b: <strong /> }}
            />
          </DsParagraph>
        </div>
      )}
      {cannotDelegateHere && (
        <div className={classes.infoLine}>
          <XMarkOctagonFillIcon
            fontSize='1.5rem'
            className={classes.dangerIcon}
          />
          <DsParagraph data-size='xs'>{t('poa_status.cannot_delegate_here')}</DsParagraph>
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
              i18nKey='poa_status.delegation_check_not_delegable'
              components={{ b: <strong /> }}
            />
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
