import { Alert, Button, Chip, Heading, Ingress, Paragraph } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PersonIcon } from '@navikt/aksel-icons';
import { useEffect } from 'react';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type {
  DelegationResponseData,
  ProcessedDelegation,
} from '@/rtk/features/singleRights/singleRightsSlice';
import {
  BFFDelegatedStatus,
  resetServicesWithStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { StatusResponse as ReduxStatusResponse } from '@/dataObjects/dtos/singleRights/DelegationInputDto';
import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';

import { ResourceActionBar } from './ResourceActionBar/ResourceActionBar';
import classes from './ReceiptPage.module.css';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const delegations = useAppSelector((state) => state.singleRightsSlice.processedDelegations);

  useEffect(() => {
    void dispatch(resetServicesWithStatus());
  }, []);

  const actionBars = delegations
    .map((pd: ProcessedDelegation, index: number) => {
      const failedDelegations = pd.bffResponseList?.filter(
        (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.Delegated,
      );

      const successfulDelegations = pd.bffResponseList?.filter(
        (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.NotDelegated,
      );

      // Calculate the number of failed delegations
      const numFailedDelegations = failedDelegations?.length || 0;

      // AdditionalText function
      const additionalText = () => {
        if (numFailedDelegations > 0) {
          return (
            <Paragraph>
              {numFailedDelegations +
                ' av ' +
                pd.bffResponseList?.length +
                ' ' +
                t('common.failed_lowercase')}
            </Paragraph>
          );
        } else {
          return undefined;
        }
      };

      // Return an object containing the ActionBar and the number of failed delegations
      return {
        actionBar: (
          <ResourceActionBar
            key={index}
            title={pd.meta.serviceDto.serviceTitle}
            subtitle={pd.meta.serviceDto.serviceOwner}
            compact={isSm}
            additionalText={additionalText()}
            color={numFailedDelegations === 0 ? 'success' : 'danger'}
          >
            <div className={classes.alertContainer}>
              {numFailedDelegations > 0 && (
                <Alert severity='danger'>
                  <Heading
                    size={'xsmall'}
                    level={2}
                    spacing
                  >
                    {t('single_rights.woops_something_went_wrong_alert')}
                  </Heading>
                  <Paragraph spacing>{t('single_rights.some_failed_technical_problem')}</Paragraph>
                  <Heading
                    size={'xxsmall'}
                    level={3}
                  >
                    {t('single_rights.these_rights_were_not_delegated')}
                  </Heading>
                  <div
                    className={classes.chipContainer}
                    key={index}
                  >
                    {failedDelegations?.map((failedRight, index) => {
                      return (
                        <Chip.Group
                          size='small'
                          key={index}
                        >
                          <Chip.Toggle>{t(`common.${failedRight.action}`)}</Chip.Toggle>
                        </Chip.Group>
                      );
                    })}
                  </div>
                </Alert>
              )}
            </div>
            {successfulDelegations?.length > 0 && (
              <div className={classes.successfulChipsContainer}>
                <Heading
                  size={'xxsmall'}
                  level={3}
                >
                  {t('single_rights.these_rights_were_delegated')}
                </Heading>
                <div
                  className={classes.chipContainer}
                  key={index}
                >
                  {successfulDelegations?.map((right) => {
                    return (
                      <Chip.Group
                        size='small'
                        key={index}
                      >
                        <Chip.Toggle>{t(`common.${right.action}`)}</Chip.Toggle>
                      </Chip.Group>
                    );
                  })}
                </div>
              </div>
            )}
          </ResourceActionBar>
        ),
        numFailedDelegations,
      };
    })
    .sort((a, b) => b.numFailedDelegations - a.numFailedDelegations) // Sort in descending order
    .map((item) => item.actionBar);

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
          <div className={classes.actionBars}>{actionBars}</div>
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
