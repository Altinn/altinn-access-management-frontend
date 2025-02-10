import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@digdir/designsystemet-react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeListForPartyQuery } from '@/rtk/features/userInfoApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserList } from '../common/UserList/UserList';

import classes from './ReporteePage.module.css';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('reportees_page.page_title'));
  const { data: userList } = useGetReporteeListForPartyQuery();
  const { data: party } = useGetReporteePartyQuery();
  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.reporteeListHeading}>
          <Heading
            level={1}
            size='md'
          >
            {t('reportees_page.main_page_heading', { name: party?.name || '' })}
          </Heading>
        </div>
        <UserList
          userList={userList || []}
          size='lg'
        />
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
