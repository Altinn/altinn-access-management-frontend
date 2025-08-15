import { Typography } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { ExtendedAccessPackage } from './useAreaPackageList';
import classes from './UndelegatedPackageWarning.module.css';

export const isCriticalAndUndelegated = (pkg: ExtendedAccessPackage) => {
  return (
    (!pkg.permissions || (pkg.permissions && pkg.permissions?.length === 0)) &&
    pkg.urn.includes('post-til-virksomheten-med-taushetsbelagt-innhold')
  );
};

export const UndelegatedPackageWarning = () => {
  const { t } = useTranslation();
  return (
    <Typography
      size='sm'
      data-color='danger'
      className={classes.criticalAndUndelegatedBadge}
    >
      <ExclamationmarkTriangleIcon />
      {t('access_packages.no_permissions')}
    </Typography>
  );
};
