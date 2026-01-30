import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsHeading, DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import AltinnLogo from '@/assets/AltinnTextLogo.svg?react';
import { useGetUserProfileQuery } from '@/rtk/features/userInfoApi';

import type { RegisteredSystem } from '../../types';

import classes from './RequestPageBase.module.css';
import { formatOrgNr } from '@/resources/utils/reporteeUtils';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { getButtonIconSize } from '@/resources/utils';
import { Link } from 'react-router';
import { SystemUserPath } from '@/routes/paths';

interface RequestPageBaseProps {
  system?: RegisteredSystem;
  heading: string;
  reporteeName?: string;
  backToPage?: string;
  children: React.ReactNode | React.ReactNode[];
}

export const RequestPageBase = ({
  system,
  heading,
  reporteeName,
  backToPage,
  children,
}: RequestPageBaseProps): React.ReactNode => {
  const { data: userData } = useGetUserProfileQuery();

  const { t } = useTranslation();

  return (
    <div className={classes.requestPage}>
      <div className={classes.requestWrapper}>
        <div className={classes.headerContainer}>
          <AltinnLogo />
          {userData && (
            <div>
              <div>
                {formatDisplayName({
                  fullName: userData?.name,
                  type: 'person',
                  reverseNameOrder: true,
                })}
              </div>
              <div>for {reporteeName}</div>
            </div>
          )}
        </div>
        {backToPage && (
          <DsButton
            variant='tertiary'
            data-color='neutral'
            data-size='sm'
            className={classes.backButton}
            asChild
          >
            <Link
              to={
                backToPage === 'landingpage'
                  ? '/'
                  : `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`
              }
            >
              <ArrowLeftIcon fontSize={getButtonIconSize(true)} />
              {t('common.back')}
            </Link>
          </DsButton>
        )}
        <div className={classes.vendorRequestBlock}>
          <DsHeading
            level={1}
            data-size='lg'
          >
            {heading}
          </DsHeading>
        </div>
        <div className={classes.vendorRequestBlock}>{children}</div>
        {system && (
          <DsParagraph
            data-size='sm'
            className={classes.vendorInfo}
          >
            {t('systemuser_request.org_nr', {
              systemName: system.name,
              vendorName: system.systemVendorOrgName,
              vendorOrg: formatOrgNr(system.systemVendorOrgNumber),
            })}
          </DsParagraph>
        )}
      </div>
    </div>
  );
};
