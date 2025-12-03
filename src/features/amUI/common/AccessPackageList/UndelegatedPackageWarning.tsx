import { DsParagraph } from '@altinn/altinn-components';
import { ExclamationmarkTriangleFillIcon, ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { Trans, useTranslation } from 'react-i18next';
import React from 'react';
import { ExtendedAccessPackage } from './useAreaPackageList';
import classes from './UndelegatedPackageWarning.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

const CRITICAL_URN_SUBSTRING = 'post-til-virksomheten-med-taushetsbelagt-innhold';

export const isCriticalAndUndelegated = (pkg: ExtendedAccessPackage) => {
  return !pkg.permissions?.length && pkg.urn?.includes(CRITICAL_URN_SUBSTRING);
};

interface UndelegatedPackageWarningProps {
  fulltext?: boolean;
  packageName?: string;
}

export const UndelegatedPackageWarning = ({
  fulltext = false,
  packageName,
}: UndelegatedPackageWarningProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const warningTextKey = fulltext
    ? 'access_packages.no_permissions_fulltext'
    : !isSmall
      ? 'access_packages.no_permissions'
      : '';

  return (
    <div
      className={
        fulltext ? classes.criticalAndUndelegatedBadge : classes.criticalAndUndelegatedBadgeCompact
      }
    >
      {fulltext ? (
        <ExclamationmarkTriangleFillIcon
          className={classes.criticalAndUndelegatedBadgeIcon}
          title={t('access_packages.no_permissions')}
        />
      ) : (
        <ExclamationmarkTriangleIcon />
      )}
      <DsParagraph
        variant={fulltext ? 'long' : undefined}
        data-size='sm'
        data-color='danger'
      >
        {warningTextKey && (
          <Trans
            i18nKey={warningTextKey}
            values={{ pakkenavn: packageName, packageName }}
            components={{ b: <strong /> }}
          />
        )}
      </DsParagraph>
    </div>
  );
};
