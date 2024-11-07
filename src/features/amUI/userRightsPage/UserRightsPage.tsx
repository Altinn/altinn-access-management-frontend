import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Heading, Paragraph, Spinner, Tabs } from '@digdir/designsystemet-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookup/lookupApi';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { FakePageWrapper } from '../common/FakePageWrapper';
import { SnackbarProvider } from '../common/Snackbar/SnackbarProvider';

import classes from './UserRightsPage.module.css';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';
import { AccessPackageSection } from './AccessPackageSection/AccessPackageSection';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [chosenTab, setChosenTab] = useState('packages');

  const navigate = useNavigate();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const name = id ? party?.name : '';

  const { data: singleRights, isLoading } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  return (
    <SnackbarProvider>
      <PageWrapper>
        <FakePageWrapper reporteeName={reportee?.name || ''}>
          <PageContainer onNavigateBack={() => navigate(`/${amUIPath.Users}`)}>
            {!isLoading && singleRights ? (
              <>
                <div className={classes.headingRow}>
                  <Avatar
                    name={name}
                    size={'lg'}
                    profile={
                      party?.partyTypeName === PartyType.Organization ? 'organization' : 'person'
                    }
                  />
                  <div>
                    <Heading
                      level={1}
                      size='sm'
                      className={classes.heading}
                    >
                      {party?.name}
                    </Heading>
                    <Paragraph
                      className={classes.subheading}
                      size='xs'
                    >
                      for {reportee?.name}
                    </Paragraph>
                  </div>
                </div>
                <Tabs
                  defaultValue='packages'
                  size='sm'
                  value={chosenTab}
                  onChange={setChosenTab}
                  className={classes.tabs}
                >
                  <Tabs.List>
                    <Tabs.Tab value='packages'>
                      <Badge
                        size='sm'
                        color={chosenTab === 'packages' ? 'accent' : 'neutral'}
                        count={0}
                        maxCount={99}
                      ></Badge>
                      {t('user_rights_page.access_packages_title')}
                    </Tabs.Tab>
                    <Tabs.Tab value='singleRights'>
                      <Badge
                        size='sm'
                        color={chosenTab === 'singleRights' ? 'accent' : 'neutral'}
                        count={singleRights.length}
                        maxCount={99}
                      ></Badge>
                      {t('user_rights_page.single_rights_title')}
                    </Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value='packages'>
                    <AccessPackageSection />
                  </Tabs.Panel>
                  <Tabs.Panel value='singleRights'>
                    <SingleRightsSection />
                  </Tabs.Panel>
                </Tabs>
              </>
            ) : (
              <Spinner title='loading' />
            )}
          </PageContainer>
        </FakePageWrapper>
      </PageWrapper>
    </SnackbarProvider>
  );
};
