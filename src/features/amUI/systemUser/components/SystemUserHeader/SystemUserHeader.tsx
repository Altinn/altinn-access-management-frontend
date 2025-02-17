import React from 'react';
import { Heading } from '@digdir/designsystemet-react';
import { TenancyIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import classes from './SystemUserHeader.module.css';

interface SystemUserHeaderProps {
  title: string;
  integrationTitle: string;
}

export const SystemUserHeader = ({
  title,
  integrationTitle,
}: SystemUserHeaderProps): React.ReactNode => {
  const { t } = useTranslation();

  const { data: reporteeData } = useGetReporteeQuery();

  return (
    <div className={classes.systemUserDetailsHeader}>
      <TenancyIcon fontSize={60} />
      <Heading
        level={1}
        data-size='sm'
      >
        {t(title, {
          integrationTitle: integrationTitle,
          companyName: reporteeData?.name,
        })}
      </Heading>
    </div>
  );
};
