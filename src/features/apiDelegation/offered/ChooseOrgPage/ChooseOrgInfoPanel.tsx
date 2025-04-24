import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsLink } from '@altinn/altinn-components';

import classes from './ChooseOrgPage.module.css';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

interface InfoPanelProps {
  searchString: string;
  promptOrgNumber: boolean;
  searchOrgNotExist: boolean;
  searchLoading: boolean;
}

export const ChooseOrgInfoPanel = ({
  searchString,
  promptOrgNumber,
  searchOrgNotExist,
  searchLoading,
}: InfoPanelProps) => {
  const { t } = useTranslation();
  const { data: reporteeData } = useGetReporteeQuery();

  if (reporteeData?.organizationNumber === searchString && searchString.length > 0) {
    return (
      <DsAlert
        data-color='warning'
        role='alert'
      >
        <DsHeading
          data-size={'xs'}
          level={2}
          className={classes.alertHeading}
        >
          {t('api_delegation.own_orgnumber_delegation_heading')}
        </DsHeading>
        <DsParagraph>{t('api_delegation.own_orgnumber_delegation_paragraph')}</DsParagraph>
      </DsAlert>
    );
  } else if (!searchLoading && searchOrgNotExist) {
    return (
      <DsAlert
        data-color='danger'
        data-size='lg'
      >
        <DsHeading
          level={2}
          data-size='sm'
          className={classes.alertHeading}
        >
          {t('api_delegation.buisness_search_notfound_title')}
        </DsHeading>
        <DsParagraph data-size='sm'>
          {t('api_delegation.buisness_search_notfound_content')}{' '}
          <DsLink
            className={classes.link}
            href='https://www.brreg.no/'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.broennoeysund_register')}
          </DsLink>
        </DsParagraph>
      </DsAlert>
    );
  } else if (!searchLoading && promptOrgNumber) {
    return (
      <DsAlert
        data-color='info'
        data-size='lg'
      >
        <DsHeading
          level={2}
          data-size='sm'
          className={classes.alertHeading}
        >
          {String(t('api_delegation.buisness_search_info_title'))}
        </DsHeading>
        <DsParagraph data-size='sm'>{t('api_delegation.buisness_search_info_content')}</DsParagraph>
      </DsAlert>
    );
  }
};
