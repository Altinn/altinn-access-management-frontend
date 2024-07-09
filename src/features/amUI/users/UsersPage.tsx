import * as React from 'react';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { getArrayPage, getTotalNumOfPages } from '@/resources/utils';

import { PageWrapper } from '@/components';
import { useGetReporteeQuery, useGetRightHoldersQuery } from '@/rtk/features/userInfo/userInfoApi';
import { Heading } from '@digdir/designsystemet-react';
import { useMemo, useState } from 'react';

import { Pagination } from '@digdir/designsystemet-react';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: reportee } = useGetReporteeQuery();
  const { data: rightHolders } = useGetRightHoldersQuery();

  const [pageEntrees, numOfPages] = useMemo(() => {
    if (!rightHolders) {
      return [[], 1];
    }
    const numPages = getTotalNumOfPages(rightHolders, pageSize);
    return [getArrayPage(rightHolders, currentPage, numPages), numPages];
  }, [rightHolders, currentPage]);

  const displayedRightHolders = pageEntrees?.map((rh, index) => <p key={index}>{rh.name}</p>);

  return (
    <PageWrapper>
      <Heading level={1}>
        {t('users_page.main_page_heading', { name: reportee?.name || '' })}
      </Heading>
      <ul>{displayedRightHolders}</ul>
      <Pagination
        size='sm'
        hideLabels={true}
        currentPage={currentPage}
        totalPages={numOfPages}
        onChange={(newPage) => setCurrentPage(newPage)}
        nextLabel='Neste'
        previousLabel='Forrige'
      />
    </PageWrapper>
  );
};
