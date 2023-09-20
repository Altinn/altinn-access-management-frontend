import { Button, Ingress, Paragraph } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PersonIcon } from '@navikt/aksel-icons';
import { useEffect } from 'react';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { resetServicesWithStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { ReduxStatusResponse } from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { ResourceActionBar } from '../ChooseServicePage/ResourceActionBar/ResourceActionBar';

import classes from './ReceiptPage.module.css';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const failedDelegations = useAppSelector((state) =>
    state.singleRightsSlice.processedDelegations.filter(
      (s) => s.status !== ReduxStatusResponse.Fulfilled,
    ),
  );
  const succesfulDelegations = useAppSelector((state) =>
    state.singleRightsSlice.processedDelegations.filter(
      (s) => s.status !== ReduxStatusResponse.Rejected,
    ),
  );

  useEffect(() => {
    void dispatch(resetServicesWithStatus());
  }, []);

  const failedActionBars = failedDelegations.map((resource) => {
    return (
      <ResourceActionBar
        key={resource.To[0].id}
        title={resource.serviceDto.serviceTitle}
        subtitle={resource.serviceDto.serviceOwner}
        status={'NotDelegable'}
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        compact={isSm}
      ></ResourceActionBar>
    );
  });

  const successfulActionBars = succesfulDelegations.map((resource) => {
    return (
      <ResourceActionBar
        key={resource.To[0].id}
        title={resource.serviceDto.serviceTitle}
        subtitle={resource.serviceDto.serviceOwner}
        status={'Delegable'}
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        compact={isSm}
      ></ResourceActionBar>
    );
  });

  console.log();

  return (
    <PageContainer>
      <Page
        color='light'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <Ingress spacing>
            {t('single_rights.has_received_these_rights', { name: 'ANNEMA FIGMA' })}
          </Ingress>
          <Paragraph spacing>{t('single_rights.rights_are_valid_until_deletion')}</Paragraph>
          <div className={classes.actionBars}>{failedActionBars}</div>
          <div className={classes.actionBars}>{successfulActionBars}</div>
          <div className={classes.successButtonContainer}>
            <Button
              onClick={() => {
                navigate(
                  '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService,
                );
              }}
              color={'success'}
            >
              {t('single_rights.to_delegation_page')}
            </Button>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
