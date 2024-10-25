import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Paragraph, Tabs } from '@digdir/designsystemet-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookup/lookupApi';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { amUIPath } from '@/routes/paths';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { FakePageWrapper } from '../common/FakePageWrapper';
import { SnackbarProvider } from '../common/Snackbar/SnackbarProvider';

import classes from './UserRightsPage.module.css';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [chosenTab, setChosenTab] = useState<'packages | singleRights'>('packages');

  const navigate = useNavigate();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const name = id ? party?.name : '';

  return (
    <SnackbarProvider>
      <PageWrapper>
        <FakePageWrapper reporteeName={reportee?.name || ''}>
          <PageContainer onNavigateBack={() => navigate(`/${amUIPath.Users}`)}>
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
              className={classes.tabs}
            >
              <Tabs.List>
                <Tabs.Tab value='packages'>Tilgangspakker</Tabs.Tab>
                <Tabs.Tab value='singleRights'>Tjenester</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value='packages'>Tilgangspakker</Tabs.Panel>
              <Tabs.Panel value='singleRights'>
                <SingleRightsSection />
              </Tabs.Panel>
            </Tabs>
          </PageContainer>
        </FakePageWrapper>
      </PageWrapper>
    </SnackbarProvider>
  );
};
