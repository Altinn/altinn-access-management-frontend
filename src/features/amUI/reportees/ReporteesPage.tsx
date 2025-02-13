import { useTranslation } from 'react-i18next';
import { Heading, Search } from '@digdir/designsystemet-react';
import { useState } from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeListForPartyQuery } from '@/rtk/features/userInfoApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { debounce } from '@/resources/utils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserList } from '../common/UserList/UserList';

import classes from './ReporteePage.module.css';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState<string>('');

  const onSearch = debounce((newSearchString: string) => {
    setSearchString(newSearchString);
  }, 300);

  useDocumentTitle(t('reportees_page.page_title'));
  const { data: userList, isLoading } = useGetReporteeListForPartyQuery();
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
        <div className={classes.search}>
          <Search
            className={classes.searchBar}
            placeholder={t('users_page.user_search_placeholder')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
            onClear={() => {
              setSearchString('');
            }}
            hideLabel
            label={t('users_page.user_search_placeholder')}
          />
        </div>
        <UserList
          userList={userList || []}
          searchString={searchString}
          isLoading={isLoading}
        />
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
