/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';
import {
  Alert,
  Button,
  Chip,
  Heading,
  Ingress,
  Paragraph,
  Popover,
} from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { DualElementsContainer, Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useMediaQuery } from '@/resources/hooks';
import {
  type ChosenService,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';

import { ResourceActionBar } from '../ChooseServicePage/ResourceActionBar/ResourceActionBar';

import classes from './ChooseRightsPage.module.css';

interface DelegationResourceDTO {
  title: string | undefined;
  serviceIdentifier: string | undefined;
  rightKey: string;
  checked: boolean;
}

export const ChooseRightsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({});
  const isSm = useMediaQuery('(max-width: 768px)');
  let hasPartiallyDelegableAppeared = false;
  const rightsToBeDelegated: DelegationResourceDTO[] = [];

  const chosenServices = useAppSelector((state) => state.singleRightsSlice.chosenServiceList);

  const delegableChosenServices = chosenServices.filter((s) => s.status !== 'NotDelegable');

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

  const onConfirm = () => {
    const filteredList = rightsToBeDelegated.filter((right) => right.checked);
  };

  const handleToggleChecked = (serviceIdentifier: string, rightKey: string) => {
    setCheckedStates((prevCheckedStates) => ({
      ...prevCheckedStates,
      [`${serviceIdentifier}-${rightKey}`]: !prevCheckedStates[`${serviceIdentifier}-${rightKey}`],
    }));
  };

  const sortedServiceResources = [...delegableChosenServices]?.sort((a, b) => {
    const isPartiallyDelegableA = a.status === 'PartiallyDelegable';
    const isPartiallyDelegableB = b.status === 'PartiallyDelegable';

    if (isPartiallyDelegableA && !isPartiallyDelegableB) {
      return -1;
    }
    if (!isPartiallyDelegableA && isPartiallyDelegableB) {
      return 1;
    }

    return a.service?.title.localeCompare(b.service.title);
  });

  const serviceResourcesActionBars = sortedServiceResources?.map((chosenService: ChosenService) => {
    const isPartiallyDelegable =
      chosenService.status === 'PartiallyDelegable' && !hasPartiallyDelegableAppeared;

    if (isPartiallyDelegable) {
      hasPartiallyDelegableAppeared = true;
    }

    return (
      <ResourceActionBar
        key={chosenService.service?.identifier}
        title={chosenService.service?.title}
        subtitle={chosenService.service?.resourceOwnerName}
        status={chosenService.status}
        onRemoveClick={() => {
          onRemove(chosenService.service?.identifier);
        }}
        compact={isSm}
        canBePartiallyDelegable={true}
        initialOpen={isPartiallyDelegable}
      >
        <div className={classes.serviceResourceContent}>
          <Paragraph>{chosenService.service?.description}</Paragraph>
          <Paragraph>{chosenService.service?.rightDescription}</Paragraph>
          <Paragraph>{t('single_rights.action_bar_adjust_rights_text')}</Paragraph>
          <Heading
            size={'xxsmall'}
            level={5}
          >
            {t('single_rights.choose_rights_chip_text')}
          </Heading>
          <div className={classes.chipContainer}>
            {chosenService.accessCheckResponses
              ?.filter((response) => response.status !== 'NotDelegable')
              .map((response, index: number) => {
                const isChecked =
                  !checkedStates[`${chosenService.service?.identifier}-${response.rightKey}`];
                const dto = {
                  title: chosenService.service?.title,
                  serviceIdentifier: chosenService.service?.identifier,
                  rightKey: response.rightKey,
                  checked: isChecked,
                };
                rightsToBeDelegated.push(dto);

                return (
                  <div key={index}>
                    <Chip.Toggle
                      checkmark
                      selected={isChecked}
                      onClick={() => {
                        handleToggleChecked(chosenService.service?.identifier, response.rightKey);
                      }}
                    >
                      {t(`common.${response.action}`)}
                    </Chip.Toggle>
                  </div>
                );
              })}
          </div>
          {chosenService.status === 'PartiallyDelegable' && (
            <div className={classes.alertContainer}>
              <Alert severity='warning'>
                <Paragraph
                  size={'large'}
                  spacing
                >
                  {t('single_rights.alert_partially_delegable_header')}
                </Paragraph>
                <Paragraph spacing>
                  {t(`${getSingleRightsErrorCodeTextKey(chosenService.errorCode)}`)}
                </Paragraph>
                <Paragraph>{t('single_rights.you_cant_delegate_these_rights')}</Paragraph>
                <div className={classes.chipContainer}>
                  {chosenService.accessCheckResponses
                    ?.filter((response) => response.status === 'NotDelegable')
                    .map((response, index: number) => {
                      return (
                        <div key={index}>
                          <Chip.Toggle>{t(`common.${response.action}`)}</Chip.Toggle>
                        </div>
                      );
                    })}
                </div>
              </Alert>
            </div>
          )}
        </div>
      </ResourceActionBar>
    );
  });

  const navigationButtons = () => {
    return (
      <DualElementsContainer
        leftElement={
          <Button
            variant='outline'
            color='primary'
            fullWidth={true}
            onClick={() => {
              navigate(
                '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService,
              );
            }}
          >
            {t('common.previous')}
          </Button>
        }
        rightElement={
          <Popover
            placement={'top'}
            trigger={
              <Button
                variant='filled'
                color='primary'
                fullWidth={true}
                disabled={delegableChosenServices.length < 1}
              >
                {t('common.complete')}
              </Button>
            }
            variant={'info'}
          >
            <Paragraph>
              {t('single_rights.confirm_delegation_text', { name: 'ANNEMA FIGMA' })}
            </Paragraph>
            <div className={classes.popoverButtonContainer}>
              <Button
                onClick={() => {
                  onConfirm();
                }}
              >
                {t('common.confirm_delegation')}
              </Button>
            </div>
          </Popover>
        }
      />
    );
  };

  return (
    <PageContainer>
      <Page color='light'>
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <Ingress>
            {t('single_rights.choose_rights_page_top_text', { name: 'ANNEMA FIGMA' })}
          </Ingress>
          <div className={classes.secondaryText}>
            <Paragraph>{t('single_rights.choose_rights_page_secondary_text')}</Paragraph>
          </div>
          <div className={classes.serviceResources}>{serviceResourcesActionBars}</div>
          <div className={classes.navigationContainer}>{navigationButtons()}</div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
