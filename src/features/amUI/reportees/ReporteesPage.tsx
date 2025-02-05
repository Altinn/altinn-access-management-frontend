import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@digdir/designsystemet-react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeListForPartyQuery } from '@/rtk/features/userInfoApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

// import classes from './UsersList.module.css';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('reportees_page.page_title'));
  const { data: reporteeList } = useGetReporteeListForPartyQuery();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Heading
          level={1}
          size='md'
        >
          {t('reportees_page.main_page_heading')}
        </Heading>
        {reporteeList?.map((reportee) => (
          <div key={reportee.partyUuid}>
            {reportee.name} - {reportee.organizationNumber} - {reportee.type}
          </div>
        ))}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
