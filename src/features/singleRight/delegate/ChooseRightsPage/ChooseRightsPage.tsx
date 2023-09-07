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
import { useEffect, useState } from 'react';

import { DualElementsContainer, Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useMediaQuery } from '@/resources/hooks';
import {
  type ServiceWithStatus,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import {
  type DelegationRequestDto,
  useDelegateMutation,
  type DelegationInput,
} from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';

import { RightsActionBar } from './RightsActionBar/RightsActionBar';
import classes from './ChooseRightsPage.module.css';

interface DelegationResourceDTO {
  title: string | undefined;
  serviceIdentifier: string | undefined;
  action: string;
}

export const ChooseRightsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedRights, setSelectedRights] = useState<DelegationResourceDTO[]>([]);
  const servicesWithStatus = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);
  const [delegate, { data: delegationOutput }] = useDelegateMutation();
  const delegableServices = servicesWithStatus.filter((s) => s.status !== 'NotDelegable');
  const isSm = useMediaQuery('(max-width: 768px)');

  const initialCheckedRightsList = delegableServices.flatMap(
    (cs) =>
      cs.accessCheckResponses
        ?.filter((acr) => acr.status !== 'NotDelegable')
        .map((acr) => ({
          title: cs.service?.title,
          serviceIdentifier: cs.service?.identifier,
          action: acr.action,
        })),
  );

  useEffect(() => {
    setSelectedRights(initialCheckedRightsList);
  }, []);

  const onRemove = (identifier: string | undefined) => {
    const newList = selectedRights.filter((s) => s.serviceIdentifier !== identifier);

    setSelectedRights(newList);

    void dispatch(removeServiceResource(identifier));
  };

  const postDelegations = () => {
    selectedRights.map(async (right) => {
      const dto: DelegationRequestDto = {
        resourceDto: new ResourceIdentifierDto('urn:altinn:resource', right.serviceIdentifier),
        action: right.action,
      };
      const delegationInput: DelegationInput = {
        receivingPart: new ResourceIdentifierDto('urn:altinn:ssn', '50019992'),
        delegationRequests: dto,
      };
      return await delegate(delegationInput);
    });
  };

  const onConfirm = () => {
    postDelegations();
    console.log('confirm checkedStates', selectedRights);
  };

  const handleToggleChecked = (title: string, serviceIdentifier: string, action: string) => {
    const existsInList = !!selectedRights.find(
      (s) => s.serviceIdentifier === serviceIdentifier && s.action === action,
    );

    let newList: DelegationResourceDTO[] = [...selectedRights];
    if (existsInList) {
      newList = selectedRights.filter(
        (s) => s.serviceIdentifier !== serviceIdentifier || s.action !== action,
      );
    } else {
      newList.push({ title, serviceIdentifier, action });
    }

    setSelectedRights(newList);
  };

  const sortedServiceResources = [...delegableServices]?.sort((a, b) => {
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

  const chooseRightsActionBars = (sortedServiceResources: ServiceWithStatus[]) => {
    return sortedServiceResources?.map((chosenService: ServiceWithStatus, chosenServicesIndex) => {
      const serviceResourceContent = (
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
                const isChecked = !!selectedRights.find(
                  (s) =>
                    s.serviceIdentifier === chosenService.service?.identifier &&
                    s.action === response.action,
                );

                return (
                  <div key={index}>
                    <Chip.Toggle
                      checkmark
                      selected={isChecked}
                      onClick={() => {
                        handleToggleChecked(
                          chosenService.service?.title,
                          chosenService.service?.identifier,
                          response.action,
                        );
                      }}
                    >
                      {t(`common.${response.action}`)}
                    </Chip.Toggle>
                  </div>
                );
              })}
          </div>
        </div>
      );

      const alertContainer = chosenService.status === 'PartiallyDelegable' && (
        <div className={classes.alertContainer}>
          <Alert severity='warning'>
            <Heading
              size={'xsmall'}
              level={6}
              spacing
            >
              {t('single_rights.alert_partially_delegable_header')}
            </Heading>
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
      );

      return (
        <RightsActionBar
          key={chosenService.service?.identifier}
          title={chosenService.service?.title}
          subtitle={chosenService.service?.resourceOwnerName}
          status={chosenService.status}
          onRemoveClick={() => {
            onRemove(chosenService.service?.identifier);
          }}
          compact={isSm}
          initialOpen={chosenServicesIndex === 0}
        >
          {serviceResourceContent}
          {alertContainer}
        </RightsActionBar>
      );
    });
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
                disabled={selectedRights.length < 1}
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
                {t('common.confirm')}
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
          <div className={classes.serviceResources}>
            {chooseRightsActionBars(sortedServiceResources)}
          </div>
          <div className={classes.navigationContainer}>{navigationButtons()}</div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
