import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { DsHeading, DsSearch } from '@altinn/altinn-components';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserList } from '../common/UserList/UserList';

import classes from './ReporteePage.module.css';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeListForPartyQuery } from '@/rtk/features/userInfoApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { debounce } from '@/resources/utils';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState<string>('');

  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  useDocumentTitle(t('reportees_page.page_title'));
  const { data: userList, isLoading } = useGetReporteeListForPartyQuery();
  const { data: party } = useGetReporteePartyQuery();

  rerouteIfNotConfetti();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.reporteeListHeading}>
          <DsHeading
            level={1}
            data-size='md'
          >
            {t('reportees_page.main_page_heading', { name: party?.name || '' })}
          </DsHeading>
        </div>
        <div className={classes.search}>
          <DsSearch className={classes.searchBar}>
            <DsSearch.Input
              aria-label={t('users_page.user_search_placeholder')}
              placeholder={t('users_page.user_search_placeholder')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSearch(event.target.value)
              }
            />
            <DsSearch.Clear
              onClick={() => {
                setSearchString('');
              }}
            />
          </DsSearch>
        </div>
        <UserList
          userList={userList || []}
          searchString={searchString}
          isLoading={isLoading}
          listItemTitleAs='h2'
        />
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
