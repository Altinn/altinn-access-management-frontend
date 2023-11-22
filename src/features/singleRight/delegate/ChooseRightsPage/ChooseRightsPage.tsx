/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';
import { Button, Ingress, Paragraph, Popover } from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import {
  GroupElements,
  Page,
  PageContainer,
  PageContent,
  PageHeader,
  ProgressModal,
  RestartPrompter,
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useMediaQuery } from '@/resources/hooks';
import {
  removeServiceResource,
  delegate,
  type ServiceWithStatus,
  ServiceStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import {
  type DelegationInputDto,
  IdValuePair,
  DelegationRequestDto,
  ServiceDto,
} from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { RightsActionBar } from './RightsActionBar/RightsActionBar';
import { RightsActionBarContent } from './RightsActionBarContent/RightsActionBarContent';
import { type Right } from './RightsActionBarContent/RightsActionBarContent';
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

export const ChooseRightsPage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [chosenServices, setChosenServices] = useState<Service[]>([]);
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const initializeDelegableServices = () => {
    const delegable = servicesWithStatus.filter(
      (s: ServiceWithStatus) =>
        s.status === ServiceStatus.Delegable || s.status === ServiceStatus.PartiallyDelegable,
    );

    const sorted = delegable.sort((a: ServiceWithStatus, b: ServiceWithStatus) => {
      const isPartiallyDelegableA = a.status === ServiceStatus.PartiallyDelegable;
      const isPartiallyDelegableB = b.status === ServiceStatus.PartiallyDelegable;

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
          delegable: right.status === ServiceStatus.Delegable,
          checked: right.status === ServiceStatus.Delegable,
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
    setChosenServices(initialized);
    setDelegationCount(initialized.length);
  }, []);

  useEffect(() => {
    processedDelegationsRatio() === 100 &&
      navigate('/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.Receipt);
  }, [processedDelegations]);

  const updateDelegationCount = (services: Service[]) => {
    const numServicesToDelegate = services.filter(
      (s: Service) => s.rights.filter((r) => r.checked).length > 0,
    ).length;

    setDelegationCount(numServicesToDelegate);
  };

  const onRemove = (identifier: string | undefined) => {
    const newList = chosenServices.filter((s: Service) => s.serviceIdentifier !== identifier);

    setChosenServices(newList);
    setDelegationCount(newList.length);

    void dispatch(removeServiceResource(identifier));
  };

  const toggleRightChecked = (serviceIdentifier: string, action: string) => {
    const serviceStateCopy = [...chosenServices];

    for (const service of serviceStateCopy) {
      if (service.serviceIdentifier === serviceIdentifier) {
        for (const right of service.rights) {
          if (right.action === action) {
            right.checked = !right.checked;
            setChosenServices(serviceStateCopy);
            updateDelegationCount(serviceStateCopy);
            return;
          }
        }
      }
    }
  };

  const chooseRightsActionBars = chosenServices?.map((service, serviceIndex) => (
    <RightsActionBar
      key={service.serviceIdentifier}
      title={service.title}
      subtitle={service.serviceOwner}
      color={service.status === ServiceStatus.Delegable ? 'success' : 'warning'}
      onRemoveClick={() => {
        onRemove(service.serviceIdentifier);
      }}
      compact={isSm}
      defaultOpen={serviceIndex === 0}
    >
      <RightsActionBarContent
        toggleRight={toggleRightChecked}
        rights={service.rights}
        serviceIdentifier={service.serviceIdentifier}
        serviceDescription={service.description}
        rightDescription={service.rightDescription}
        errorCode={service.errorCode}
      />
    </RightsActionBar>
  ));

  const navigationButtons = () => {
    return (
      <GroupElements>
        <Button
          variant='primary'
          color='first'
          fullWidth={isSm}
          disabled={delegationCount < 1}
          onClick={() => setPopoverOpen(!popoverOpen)}
          ref={buttonRef}
        >
          {t('common.finish_delegation')}
        </Button>
        <Button
          variant='secondary'
          color='first'
          fullWidth={isSm}
          onClick={() => {
            navigate(
              '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService,
            );
          }}
        >
          {t('single_rights.add_more_services')}
        </Button>
        <Popover
          variant={'info'}
          placement={'top'}
          anchorEl={buttonRef.current}
          open={popoverOpen}
          onClose={() => setPopoverOpen(false)}
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

  const onConfirm = () => {
    updateDelegationCount(chosenServices);
    setShowProgressModal(true);
    setPopoverOpen(false);

    void postDelegations();
  };

  const postDelegations = () => {
    chosenServices.forEach((service: Service) => {
      const rightsToDelegate = service.rights
        .filter((right: Right) => right.checked)
        .map((right: Right) => new DelegationRequestDto(right.resourceReference, right.action));

      if (rightsToDelegate.length > 0) {
        const delegationInput: DelegationInputDto = {
          // TODO: make adjustments to codeline below when we get GUID from altinn2
          To: [new IdValuePair('urn:altinn:ssn', '50019992')],
          Rights: rightsToDelegate,
          serviceDto: new ServiceDto(service.title, service.serviceOwner),
        };

        return dispatch(delegate(delegationInput));
      }
    });
  };

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>

        <PageContent>
          {servicesWithStatus.length < 1 ? (
            <RestartPrompter
              spacingBottom
              restartPath={
                '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService
              }
              title={t('common.an_error_has_occured')}
              ingress={t('api_delegation.delegations_not_registered')}
            />
          ) : (
            <>
              <Ingress>
                {t('single_rights.choose_rights_page_top_text', { name: 'ANNEMA FIGMA' })}
              </Ingress>
              <div className={classes.secondaryText}>
                <Paragraph>{t('single_rights.choose_rights_page_secondary_text')}</Paragraph>
              </div>
              <div className={classes.serviceResources}>{chooseRightsActionBars}</div>
              <ProgressModal
                open={showProgressModal}
                loadingText={t('single_rights.processing_delegations')}
                progressValue={processedDelegationsRatio()}
                progressLabel={progressLabel}
              ></ProgressModal>
              <div className={classes.navigationContainer}>{navigationButtons()}</div>
            </>
          )}
        </PageContent>
      </Page>
    </PageContainer>
  );
};
