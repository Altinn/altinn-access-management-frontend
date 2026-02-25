import { Typography } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React, { useId } from 'react';
import { ExtendedAccessPackage } from './useAreaPackageList';
import classes from './UndelegatedPackageWarning.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

const CRITICAL_URN_SUBSTRING = 'post-til-virksomheten-med-taushetsbelagt-innhold';

export const isCriticalAndUndelegated = (pkg: ExtendedAccessPackage) => {
  return !pkg.permissions?.length && pkg.urn?.includes(CRITICAL_URN_SUBSTRING);
};

export const UndelegatedPackageWarning = () => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const id = useId();
  return (
    <Typography
      size='sm'
      data-color='danger'
      className={classes.criticalAndUndelegatedBadge}
    >
      <ExclamationmarkTriangleIcon
        aria-label={isSmall ? t('poa_status.no_permissions') : undefined}
        aria-labelledby={isSmall ? undefined : id}
      />
      <span id={id}>{!isSmall && t('poa_status.no_permissions')}</span>
    </Typography>
  );
};
