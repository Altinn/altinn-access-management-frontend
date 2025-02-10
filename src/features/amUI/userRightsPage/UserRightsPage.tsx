import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Heading, Paragraph, Spinner, Tabs } from '@digdir/designsystemet-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Avatar } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import {
  PartyType,
  useGetReporteeQuery,
  useGetRightHolderAccessesQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { filterDigdirRole } from '@/resources/utils/roleUtils';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { SnackbarProvider } from '../common/Snackbar/SnackbarProvider';
import { UserRoles } from '../common/UserRoles/UserRoles';

import classes from './UserRightsPage.module.css';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';
import { AccessPackageSection } from './AccessPackageSection/AccessPackageSection';
import { RoleSection } from './RoleSection/RoleSection';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [chosenTab, setChosenTab] = useState('packages');

  const navigate = useNavigate();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const name = id ? party?.name : '';

  const { data: allAccesses, isLoading } = useGetRightHolderAccessesQuery(id || '');

  return (
    <SnackbarProvider>
      <PageWrapper>
        <PageLayoutWrapper>
          <PageContainer onNavigateBack={() => navigate(`/${amUIPath.Users}`)}>
            {!isLoading && allAccesses ? (
              <>
                <div className={classes.headingContainer}>
                  <Avatar
                    className={classes.avatar}
                    name={name || ''}
                    size={'lg'}
                    type={party?.partyTypeName === PartyType.Organization ? 'company' : 'person'}
                  />
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
                  {!!reportee?.partyUuid && !!party?.partyUuid && (
                    <UserRoles
                      className={classes.userRoles}
                      rightOwnerUuid={reportee.partyUuid}
                      rightHolderUuid={party.partyUuid}
                    />
                  )}
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
                        count={allAccesses.accessPackages?.length ?? 0}
                        maxCount={99}
                      />
                      {t('user_rights_page.access_packages_title')}
                    </Tabs.Tab>
                    <Tabs.Tab value='singleRights'>
                      <Badge
                        size='sm'
                        color={chosenTab === 'singleRights' ? 'accent' : 'neutral'}
                        count={allAccesses.services?.length ?? 0}
                        maxCount={99}
                      />
                      {t('user_rights_page.single_rights_title')}
                    </Tabs.Tab>
                    <Tabs.Tab value='roleAssignments'>
                      <Badge
                        size='sm'
                        color={chosenTab === 'roleAssignments' ? 'accent' : 'neutral'}
                        count={filterDigdirRole(allAccesses.roles).length ?? 0}
                        maxCount={99}
                      />
                      {t('user_rights_page.roles_title')}
                    </Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value='packages'>
                    <AccessPackageSection numberOfAccesses={allAccesses.accessPackages?.length} />
                  </Tabs.Panel>
                  <Tabs.Panel value='singleRights'>
                    <SingleRightsSection />
                  </Tabs.Panel>
                  <Tabs.Panel value='roleAssignments'>
                    <RoleSection />
                  </Tabs.Panel>
                </Tabs>
              </>
            ) : (
              <Spinner title='loading' />
            )}
          </PageContainer>
        </PageLayoutWrapper>
      </PageWrapper>
    </SnackbarProvider>
  );
};
