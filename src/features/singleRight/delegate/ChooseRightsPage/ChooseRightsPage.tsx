import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';
import { Button, Paragraph, Popover } from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { DualElementsContainer, Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  type ChosenService,
  ChosenServiceList,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ResourceActionBar } from '../ChooseServicePage/ResourceActionBar/ResourceActionBar';

import classes from './ChooseRightsPage.module.css';

export const ChooseRightsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [personName, setPersonName] = useState('Navn');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isSm = useMediaQuery('(max-width: 768px)');

  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.chosenServices.filter((s) => s.status !== 'NotDelegable'),
  );

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

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
          >
            <Paragraph>
              {t('single_rights.confirm_delegation_text', { name: personName })}
            </Paragraph>
            <div className={classes.popoverTextContainer}>
              <Button
                onClick={() => {
                  setPopoverOpen(!popoverOpen);
                }}
              >
                {t('common.confirm')}
              </Button>
            </div>
          </Popover>
        }
      />
    );
  };

  const serviceResouces = delegableChosenServices?.map(
    (chosenService: ChosenService, index: number) => {

      const status = chosenService.accessCheckResponses.
      find((selected) => selected.service?.title === resource.title)
        ?.status; */

      return (
        <ResourceActionBar
          key={chosenService.service?.identifier ?? index}
          title={chosenService.service?.title}
          subtitle={chosenService.service?.resourceOwnerName}
          status={'Unchecked'}
          onRemoveClick={() => {
            onRemove(chosenService.service?.identifier);
          }}
          compact={isSm}
        >
          <div className={classes.serviceResourceContent}>
            <Paragraph size='small'>{chosenService.service?.description}</Paragraph>
            <Paragraph size='small'>{chosenService.service?.rightDescription}</Paragraph>
          </div>
        </ResourceActionBar>
      );
    },
  );

  return (
    <PageContainer>
      <Page color='light'>
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <div className={classes.serviceResources}>{serviceResouces}</div>
          <div>{navigationButtons()}</div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
