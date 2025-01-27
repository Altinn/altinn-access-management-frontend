import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

import AltinnLogo from '@/assets/AltinnTextLogo.svg?react';
import { useGetReporteeQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import type { RegisteredSystem } from '../../types';

import classes from './RequestPageBase.module.css';

interface RequestPageBaseProps {
  system?: RegisteredSystem;
  heading: string;
  children: React.ReactNode | React.ReactNode[];
}

export const RequestPageBase = ({
  system,
  heading,
  children,
}: RequestPageBaseProps): React.ReactNode => {
  const { data: userData } = useGetUserInfoQuery();
  const { data: reporteeData } = useGetReporteeQuery();

  const { t } = useTranslation();

  return (
    <div className={classes.requestPage}>
      <div className={classes.requestWrapper}>
        <div className={classes.headerContainer}>
          <AltinnLogo />
          {userData && (
            <div>
              <div>{userData?.name}</div>
              <div>for {reporteeData?.name}</div>
            </div>
          )}
        </div>
        <div className={classes.vendorRequestBlock}>
          <Heading
            level={1}
            data-size='lg'
          >
            {heading}
          </Heading>
        </div>
        <div className={classes.vendorRequestBlock}>{children}</div>
        {system && (
          <Paragraph
            data-size='sm'
            className={classes.vendorInfo}
          >
            {t('systemuser_request.org_nr', {
              systemName: system.name,
              vendorName: system.systemVendorOrgName,
              vendorOrg: system.systemVendorOrgNumber.match(/.{1,3}/g)?.join(' '),
            })}
          </Paragraph>
        )}
      </div>
    </div>
  );
};
