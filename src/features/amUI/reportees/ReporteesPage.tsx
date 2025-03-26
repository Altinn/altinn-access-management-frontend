import { useTranslation } from 'react-i18next';
import { Heading, Search } from '@digdir/designsystemet-react';
import { useCallback, useState } from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeListForPartyQuery } from '@/rtk/features/userInfoApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { debounce } from '@/resources/utils';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserList } from '../common/UserList/UserList';

import classes from './ReporteePage.module.css';

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
          <Heading
            level={1}
            data-size='md'
          >
            {t('reportees_page.main_page_heading', { name: party?.name || '' })}
          </Heading>
        </div>
        <div className={classes.search}>
          <Search className={classes.searchBar}>
            <Search.Input
              aria-label={t('users_page.user_search_placeholder')}
              placeholder={t('users_page.user_search_placeholder')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSearch(event.target.value)
              }
            />
            <Search.Clear
              onClick={() => {
                setSearchString('');
              }}
            />
          </Search>
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
