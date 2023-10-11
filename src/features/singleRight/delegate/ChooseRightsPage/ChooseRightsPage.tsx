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
import { removeServiceResource, delegate } from '@/rtk/features/singleRights/singleRightsSlice';
import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import {
  type DelegationInputDto,
  IdValuePair,
  DelegationRequestDto,
  ServiceDto,
} from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { RightsActionBar } from './RightsActionBar/RightsActionBar';
import classes from './ChooseRightsPage.module.css';

type Service = {
  serviceIdentifier: string;
  description: string;
  rightDescription: string;
  status: string;
  title: string;
  serviceOwner: string;
  errorCode?: string;
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
  const [serviceStates, setServiceStates] = useState<Service[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [delegationCount, setDelegationCount] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const servicesWithStatus = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);
  const processedDelegations = useAppSelector(
    (state) => state.singleRightsSlice.processedDelegations,
  );
  const isSm = useMediaQuery('(max-width: 768px)');
  const progressLabel = processedDelegations.length + '/' + delegationCount;
  const processedDelegationsRatio = (): number =>
    Math.round((processedDelegations.length / delegationCount) * 100);

  // TO DO:
  // Ask Albert if should move Rights type and logic to RightsActionBar

  const initializeDelegableServices = () => {
    const delegable = servicesWithStatus.filter((s) => s.status !== 'NotDelegable');
    const sorted = delegable.sort((a, b) => {
      const isPartiallyDelegableA = a.status === 'PartiallyDelegable';
      const isPartiallyDelegableB = b.status === 'PartiallyDelegable';

      if (isPartiallyDelegableA && !isPartiallyDelegableB) {
        return -1;
      }
      if (!isPartiallyDelegableA && isPartiallyDelegableB) {
        return 1;
      }

      return a.service?.title.localeCompare(b.service?.title ?? '') ?? -1;
    });

    return sorted.map((service) => {
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
        status: String(service.status),
        errorCode: service.errorCode,
        title: service.service?.title ?? '',
        serviceOwner: service.service?.resourceOwnerName ?? '',
        rights: rights,
      };
    });
  };

  useEffect(() => {
    const initialized: Service[] = initializeDelegableServices();
    setServiceStates(initialized);
    setDelegationCount(initialized.length);
  }, []);

  useEffect(() => {
    processedDelegationsRatio() === 100 &&
      navigate('/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.Receipt);
  }, [processedDelegations]);

  const onRemove = (identifier: string | undefined) => {
    const newList = serviceStates.filter((s) => s.serviceIdentifier !== identifier);

    setServiceStates(newList);
    setDelegationCount(newList.length);

    void dispatch(removeServiceResource(identifier));
  };

  const handleToggleChecked = (serviceIdentifier: string, action: string) => {
    const serviceStateCopy = [...serviceStates];

    for (const service of serviceStateCopy) {
      if (service.serviceIdentifier === serviceIdentifier) {
        for (const right of service.rights) {
          if (right.action === action) {
            right.checked = !right.checked;
            setServiceStates(serviceStateCopy);
            return;
          }
        }
      }
    }
  };

  const postDelegations = () => {
    console.log('serviceStates', serviceStates);

    serviceStates.map((service) => {
      const rightsToDelegate = service.rights
        .filter((right) => right.checked)
        .map((right) => new DelegationRequestDto(right.resourceReference, right.action));

      if (rightsToDelegate.length > 0) {
        const delegationInput: DelegationInputDto = {
          // TODO: make adjustments to codeline below when we get GUID from altinn2
          To: [new IdValuePair('urn:altinn:ssn', '50019992')],
          Rights: rightsToDelegate,
          serviceDto: new ServiceDto(service.title, service.serviceOwner),
        };

        console.log('delegation', delegationInput);
        return dispatch(delegate(delegationInput));
      } else {
        return setDelegationCount(delegationCount - 1);
      }
    });
  };

  const onConfirm = () => {
    setShowProgressModal(true);
    setPopoverOpen(false);
    void postDelegations();
  };

  const chooseRightsActionBars = () => {
    // Delegable rights
    return serviceStates?.map((service, serviceIndex) => {
      const serviceResourceContent = (
        <div className={classes.serviceResourceContent}>
          <Paragraph>{service.description}</Paragraph>
          <Paragraph>{service.rightDescription}</Paragraph>
          <Paragraph>{t('single_rights.action_bar_adjust_rights_text')}</Paragraph>
          <Heading
            size={'xxsmall'}
            level={5}
          >
            {t('single_rights.choose_rights_chip_text')}
          </Heading>
          <div className={classes.chipContainer}>
            {service.rights
              .filter((right) => right.delegable === true)
              .map((right, index: number) => {
                return (
                  <div key={index}>
                    <Chip.Toggle
                      checkmark
                      selected={right.checked}
                      onClick={() => {
                        handleToggleChecked(service.serviceIdentifier, right.action);
                      }}
                    >
                      {t(`common.${right.action}`)}
                    </Chip.Toggle>
                  </div>
                );
              })}
          </div>
        </div>
      );

      // Non-delegable rights
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
              {service.rights
                .filter((r) => r.delegable === false)
                .map((r, index: number) => {
                  return (
                    <div key={index}>
                      <Chip.Toggle>{t(`common.${r.action}`)}</Chip.Toggle>
                    </div>
                  );
                })}
            </div>
          </Alert>
        </div>
      );

      return (
        <RightsActionBar
          key={service.serviceIdentifier}
          title={service.title}
          subtitle={service.serviceOwner}
          color={service.status === 'Delegable' ? 'success' : 'warning'}
          onRemoveClick={() => {
            onRemove(service.serviceIdentifier);
          }}
          compact={isSm}
          initialOpen={serviceIndex === 0}
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
              //disabled={selectedRights.length < 1}
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
          <div className={classes.serviceResources}>{chooseRightsActionBars()}</div>
          <ProgressModal
            open={showProgressModal}
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
