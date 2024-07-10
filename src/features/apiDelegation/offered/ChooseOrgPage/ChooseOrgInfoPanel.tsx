import { Alert, Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import classes from './ChooseOrgPage.module.css';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';

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
      <Alert
        severity='warning'
        role='alert'
      >
        <Heading
          size={'xsmall'}
          level={2}
          spacing
        >
          {t('api_delegation.own_orgnumber_delegation_heading')}
        </Heading>
        <Paragraph>{t('api_delegation.own_orgnumber_delegation_paragraph')}</Paragraph>
      </Alert>
    );
  } else if (!searchLoading && searchOrgNotExist) {
    return (
      <Alert
        severity='danger'
        size='lg'
      >
        <Heading
          level={2}
          size='sm'
          spacing
        >
          {t('api_delegation.buisness_search_notfound_title')}
        </Heading>
        <Paragraph size='sm'>
          {t('api_delegation.buisness_search_notfound_content')}{' '}
          <Link
            className={classes.link}
            href='https://www.brreg.no/'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.broennoeysund_register')}
          </Link>
        </Paragraph>
      </Alert>
    );
  } else if (!searchLoading && promptOrgNumber) {
    return (
      <Alert
        severity='info'
        size='lg'
      >
        <Heading
          level={2}
          size='sm'
          spacing
        >
          {String(t('api_delegation.buisness_search_info_title'))}
        </Heading>
        <Paragraph size='sm'>{t('api_delegation.buisness_search_info_content')}</Paragraph>
      </Alert>
    );
  }
};
