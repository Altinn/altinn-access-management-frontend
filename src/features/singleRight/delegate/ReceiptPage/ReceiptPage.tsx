import { Button } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PersonIcon } from '@navikt/aksel-icons';
import { useEffect } from 'react';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent, PageHeader, RestartPrompter } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { resetServicesWithStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { GroupElements } from '@/components/GroupElements/GroupElements';

import classes from './ReceiptPage.module.css';
import { ActionBarSection } from './ActionBarSection/ActionBarSection';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const processedDelegations = useAppSelector(
    (state) => state.singleRightsSlice.processedDelegations,
  );

  useEffect(() => {
    void dispatch(resetServicesWithStatus());
  }, []);

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          {processedDelegations.length < 1 ? (
            <RestartPrompter
              spacingBottom
              button={
                <Button
                  variant='secondary'
                  color='danger'
                  onClick={() => {
                    navigate(
                      '/' +
                        SingleRightPath.DelegateSingleRights +
                        '/' +
                        SingleRightPath.ChooseService,
                    );
                  }}
                >
                  {t('common.restart')}
                </Button>
              }
              title={t('common.an_error_has_occured')}
              ingress={t('api_delegation.delegations_not_registered')}
            ></RestartPrompter>
          ) : (
            <>
              <div className={classes.actionBars}>
                <ActionBarSection />
              </div>
              <GroupElements>
                <Button
                  color={'first'}
                  fullWidth
                >
                  {t('common.finished')}
                </Button>
                <Button
                  onClick={() => {
                    navigate(
                      '/' +
                        SingleRightPath.DelegateSingleRights +
                        '/' +
                        SingleRightPath.ChooseService,
                    );
                  }}
                  color={'first'}
                  variant={'secondary'}
                  fullWidth
                >
                  {t('single_rights.give_more_rights')}
                </Button>
              </GroupElements>
            </>
          )}
        </PageContent>
      </Page>
    </PageContainer>
  );
};
