import { Typography } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { ExtendedAccessPackage } from './useAreaPackageList';
import classes from './UndelegatedPackageWarning.module.css';

const CRITICAL_URN_SUBSTRING = 'post-til-virksomheten-med-taushetsbelagt-innhold';

export const isCriticalAndUndelegated = (pkg: ExtendedAccessPackage) => {
  return !pkg.permissions?.length && pkg.urn?.includes(CRITICAL_URN_SUBSTRING);
};

export const UndelegatedPackageWarning = () => {
  const { t } = useTranslation();
  return (
    <Typography
      size='sm'
      data-color='danger'
      className={classes.criticalAndUndelegatedBadge}
    >
      <ExclamationmarkTriangleIcon aria-hidden='true' />
      {t('access_packages.no_permissions')}
    </Typography>
  );
};
