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

import {
  GroupElements,
  Page,
  PageContainer,
  PageContent,
  PageHeader,
  ProgressModal,
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useMediaQuery } from '@/resources/hooks';
import {
  type ServiceWithStatus,
  removeServiceResource,
  delegate,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import {
  type DelegationInputDto,
  IdValuePair,
  DelegationRequestDto,
  ServiceDto,
} from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { RightsActionBar } from './RightsActionBar/RightsActionBar';
import classes from './ChooseRightsPage.module.css';

interface DelegationResourceDTO {
  serviceIdentifier: string;
  resource: IdValuePair[];
  action: string;
  serviceTitle: string;
  serviceOwner: string;
}

type Service = {
  serviceIdentifier: string;
  description: string;
  rightDescription: string;
  status: 'Delegable' | 'NotDelegable' | 'PartiallyDelegable' | undefined;
  rights: Right[];
};

type Right = {
  action: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
};

export const ChooseRightsPage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedRights, setSelectedRights] = useState<DelegationResourceDTO[]>([]);
  const [serviceStates, setServiceStates] = useState<Service[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [delegationCount, setDelegationCount] = useState(0);
  const servicesWithStatus = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);
  const processedDelegations = useAppSelector(
    (state) => state.singleRightsSlice.processedDelegations,
  );
  // const delegableServices = servicesWithStatus.filter((s) => s.status !== 'NotDelegable');
  const isSm = useMediaQuery('(max-width: 768px)');
  const progressLabel = processedDelegations.length + '/' + delegationCount;
  const processedDelegationsRatio = (): number =>
    Math.round((processedDelegations.length / delegationCount) * 100);

  console.log('delegableServices', delegableServices);

  // TO DO:
  // Rewrite the logic of the toggling
  // Add nullable bool for if checked or not to Rights in delegableServices and use that throughout this whole page
  // No reason to transform a 2D array to a 1D array, only to then make it back into a 2D array

  const initializeDelegableServices = () => {
    const delegable = servicesWithStatus.filter((s) => s.status !== 'NotDelegable');
    return delegable.map((service) => {
      const rights =
        service.rightDelegationResults?.map((right) => ({
          action: right.action,
          delegable: right.status === 'Delegable',
          checked: right.status === 'Delegable',
          resourceReference: right.resource,
        })) ?? [];
      return {
        serviceIdentifier: service.service?.identifier ?? '',
        description: service.service?.description ?? '',
        rightDescription: service.service?.rightDescription ?? '',
        status: service.status,
        rights: rights,
      };
    });
  };

  useEffect(() => {
    const initialized: Service[] = initializeDelegableServices();
    setServiceStates(initialized);
  }, []);

  useEffect(() => {
    processedDelegationsRatio() === 100 &&
      navigate('/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.Receipt);
  }, [processedDelegations]);

  const onRemove = (identifier: string | undefined) => {
    const newList = selectedRights.filter((s) => s.serviceIdentifier !== identifier);

    setSelectedRights(newList);

    void dispatch(removeServiceResource(identifier));
  };

  const groupServices = (): DelegationResourceDTO[][] => {
    return Object.values(
      selectedRights.reduce((batchedRights, right) => {
        const { serviceIdentifier } = right;
        console.log('hello serviceIdentifier', serviceIdentifier);
        batchedRights[serviceIdentifier] = [];
        batchedRights[serviceIdentifier].push(right);

        return batchedRights;
      }, {}),
    );
  };

  const postDelegations = () => {
    const groupedList = groupServices();
    console.log('selectedRights', selectedRights);
    console.log('groupedList', groupedList);
    setDelegationCount(groupedList.length);

    groupedList.map((resource) => {
      const delegationInput: DelegationInputDto = {
        // TODO: make adjustments to codeline below when we get GUID from altinn2
        To: [new IdValuePair('urn:altinn:ssn', '50019992')],
        Rights: resource.map((right) => {
          return new DelegationRequestDto(
            // TODO: make adjustments to codline below when we get urn from resourceregistry
            'urn:altinn:resource',
            right.serviceIdentifier,
            right.action,
          );
        }),
        serviceDto: new ServiceDto(resource[0].serviceTitle, resource[0].serviceOwner),
      };

      return dispatch(delegate(delegationInput));
    });
  };

  const onConfirm = () => {
    void postDelegations();
    setPopoverOpen(false);
  };

  const handleToggleChecked = (serviceIdentifier: string, action: string) => {
    const serviceStateCopy = [...serviceStates];

    for (const service of serviceStateCopy) {
      if (service.serviceIdentifier === serviceIdentifier) {
        for (const right of service.rights) {
          if (right.action === action) {
            right.checked = !right.checked;
          }
          break;
        }
        break;
      }
    }

    setServiceStates(serviceStateCopy);
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
    return sortedServiceResources?.map((service: ServiceWithStatus, chosenServicesIndex) => {
      const serviceResourceContent = (
        <div className={classes.serviceResourceContent}>
          <Paragraph>{service.service?.description}</Paragraph>
          <Paragraph>{service.service?.rightDescription}</Paragraph>
          <Paragraph>{t('single_rights.action_bar_adjust_rights_text')}</Paragraph>
          <Heading
            size={'xxsmall'}
            level={5}
          >
            {t('single_rights.choose_rights_chip_text')}
          </Heading>
          <div className={classes.chipContainer}>
            {service.rightDelegationResults
              ?.filter((response) => response.status !== 'NotDelegable')
              .map((response, index: number) => {
                const isChecked = !!selectedRights.find(
                  (s) =>
                    s.serviceIdentifier === service.service?.identifier &&
                    s.action === response.action,
                );

                return (
                  <div key={index}>
                    <Chip.Toggle
                      checkmark
                      selected={isChecked}
                      onClick={() => {
                        handleToggleChecked(
                          service.service?.title,
                          service.service?.resourceOwnerName,
                          service.service?.identifier,
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

      const alertContainer = service.status === 'PartiallyDelegable' && (
        <div className={classes.alertContainer}>
          <Alert severity='warning'>
            <Heading
              size={'xsmall'}
              level={4}
              spacing
            >
              {t('single_rights.alert_partially_delegable_header')}
            </Heading>
            <Paragraph spacing>
              {t(`${getSingleRightsErrorCodeTextKey(service.errorCode)}`)}
            </Paragraph>
            <Heading
              size={'xxsmall'}
              level={5}
            >
              {t('single_rights.you_cant_delegate_these_rights')}
            </Heading>
            <div className={classes.chipContainer}>
              {service.rightDelegationResults
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
          key={service.service?.identifier}
          title={service.service?.title}
          subtitle={service.service?.resourceOwnerName}
          status={service.status}
          onRemoveClick={() => {
            onRemove(service.service?.identifier);
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
      <GroupElements>
        <Button
          variant='outline'
          color='primary'
          fullWidth={isSm}
          onClick={() => {
            navigate(
              '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService,
            );
          }}
        >
          {t('common.previous')}
        </Button>
        <Popover
          placement={'top'}
          open={popoverOpen}
          onOpenChange={() => setPopoverOpen(!popoverOpen)}
          trigger={
            <Button
              variant='filled'
              color='primary'
              fullWidth={isSm}
              disabled={selectedRights.length < 1}
              onClick={() => setPopoverOpen(!popoverOpen)}
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
      </GroupElements>
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
          <ProgressModal
            open={delegationCount > 0}
            loadingText={t('single_rights.processing_delegations')}
            progressValue={processedDelegationsRatio()}
            progressLabel={progressLabel}
          ></ProgressModal>
          <div className={classes.navigationContainer}>{navigationButtons()}</div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
