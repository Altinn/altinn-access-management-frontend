import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';
import { Button, Chip, Paragraph, Popover } from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { DualElementsContainer, Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useMediaQuery } from '@/resources/hooks';
import {
  type ChosenService,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';

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
  const personName = useState('Navn');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isSm = useMediaQuery('(max-width: 768px)');
  let hasPartiallyDelegableAppeared = false;

  const delegationList: DelegationResourceDTO[] = [];

  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.chosenServices.filter((s) => s.status !== 'NotDelegable'),
  );

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

  const onConfirm = () => {
    setPopoverOpen(!popoverOpen);
    const filteredList = delegationList.filter((right) => right.checked);
    console.log('filteredList', filteredList);
  };

  const serviceResources = useMemo(() => {
    return [...delegableChosenServices]?.sort((a, b) => {
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
  }, [delegableChosenServices]);

  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({});

  const handleToggleChecked = (serviceIdentifier: string, rightKey: string) => {
    setCheckedStates((prevCheckedStates) => ({
      ...prevCheckedStates,
      [`${serviceIdentifier}-${rightKey}`]: !prevCheckedStates[`${serviceIdentifier}-${rightKey}`],
    }));
  };

  const serviceResourcesActionBars = serviceResources?.map((chosenService: ChosenService) => {
    const isPartiallyDelegable =
      chosenService.status === 'PartiallyDelegable' && !hasPartiallyDelegableAppeared;

    if (isPartiallyDelegable) {
      hasPartiallyDelegableAppeared = true;
    }

    console.log('serviceResources', serviceResources);

    return (
      <ResourceActionBar
        key={chosenService.service?.identifier}
        title={chosenService.service?.title}
        subtitle={chosenService.service?.resourceOwnerName}
        status={chosenService.status ?? 'Unchecked'}
        onRemoveClick={() => {
          onRemove(chosenService.service?.identifier);
        }}
        compact={isSm}
        canBePartiallyDelegable={true}
        initialOpen={isPartiallyDelegable}
      >
        <div className={classes.serviceResourceContent}>
          <Paragraph size='small'>{chosenService.service?.description}</Paragraph>
          <Paragraph size='small'>{chosenService.service?.rightDescription}</Paragraph>
          <Paragraph>{t('single_rights.choose_rights_chip_text')}</Paragraph>
          <div className={classes.chipContainer}>
            {chosenService.accessCheckResponses
              ?.filter((response) => response.status !== 'NotDelegable')
              .map((response, index: number) => {
                const isChecked =
                  checkedStates[`${chosenService.service?.identifier}-${response.rightKey}`];

                const dto = {
                  title: chosenService.service?.title,
                  serviceIdentifier: chosenService.service?.identifier,
                  rightKey: response.rightKey,
                  checked: isChecked,
                };
                delegationList.push(dto);

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
                onClick={() => {
                  setPopoverOpen(!popoverOpen);
                }}
              >
                {t('common.complete')}
              </Button>
            }
            open={popoverOpen}
            onOpenChange={() => {
              setPopoverOpen(!popoverOpen);
            }}
            variant={'info'}
          >
            <Paragraph>
              {t('single_rights.confirm_delegation_text', { name: personName })}
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
          <div className={classes.serviceResources}>{serviceResourcesActionBars}</div>
          <div className={classes.navigationContainer}>{navigationButtons()}</div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
