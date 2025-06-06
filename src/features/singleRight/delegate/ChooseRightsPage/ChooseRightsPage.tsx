/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { DsPopover, DsParagraph, DsButton } from '@altinn/altinn-components';

import { RecipientErrorAlert } from '../../components/RecipientErrorAlert/RecipientErrorAlert';

import { RightsActionBar } from './RightsActionBar/RightsActionBar';
import type { ChipRight } from './RightsActionBarContent/RightsActionBarContent';
import { RightsActionBarContent } from './RightsActionBarContent/RightsActionBarContent';
import classes from './ChooseRightsPage.module.css';

import {
  Page,
  PageContainer,
  PageContent,
  PageHeader,
  ProgressModal,
  RestartPrompter,
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { SingleRightPath } from '@/routes/paths';
import { useFetchRecipientInfo, useMediaQuery } from '@/resources/hooks';
import {
  removeServiceResource,
  delegate,
  type ServiceWithStatus,
  ServiceStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import {
  type DelegationInputDto,
  DelegationRequestDto,
  ServiceDto,
} from '@/dataObjects/dtos/resourceDelegation';
import { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { useClearAccessCacheMutation } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { BaseAttribute } from '@/dataObjects/dtos/BaseAttribute';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

type Service = {
  serviceIdentifier: string;
  description: string;
  rightDescription: string;
  status: string;
  title: string;
  type: string;
  serviceOwner: string;
  rights: ChipRight[];
};

export const ChooseRightsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [urlParams] = useSearchParams();
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
  const [clearAccessCashe] = useClearAccessCacheMutation();
  useDocumentTitle(t('single_rights.page_title'));
  const {
    name: recipientName,
    error: recipientError,
    isLoading,
  } = useFetchRecipientInfo(urlParams.get('userUUID'), urlParams.get('partyUUID'));

  const { data: representingParty } = useGetReporteeQuery();

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

    return sorted.map((service: ServiceWithStatus) => {
      const rights: ChipRight[] =
        service.rightList?.map((right) => ({
          action: right.action,
          rightKey: right.rightKey,
          delegable: right.status === ServiceStatus.Delegable,
          checked: right.status === ServiceStatus.Delegable,
          resourceReference: right.resource,
          details: right.details,
        })) ?? [];

      return {
        serviceIdentifier: service.service?.identifier ?? '',
        description: service.service?.description ?? '',
        rightDescription: service.service?.rightDescription ?? '',
        status: String(service.status),
        title: service.service?.title ?? '',
        serviceOwner: service.service?.resourceOwnerName ?? '',
        rights: rights,
        type: service.service?.resourceType ?? '',
      };
    });
  };

  useEffect(() => {
    const initialized: Service[] = initializeDelegableServices();
    setChosenServices(initialized);
    setDelegationCount(initialized.length);
  }, []);

  useEffect(() => {
    if (processedDelegationsRatio() === 100) {
      navigate(`/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.Receipt}?${urlParams}`);
    }
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

  const toggleRight = (serviceIdentifier: string, rightKey: string) => {
    const serviceStateCopy = [...chosenServices];

    for (const service of serviceStateCopy) {
      if (service.serviceIdentifier === serviceIdentifier) {
        for (const right of service.rights) {
          if (right.rightKey === rightKey) {
            right.checked = !right.checked;
            setChosenServices(serviceStateCopy);
            updateDelegationCount(serviceStateCopy);
            return;
          }
        }
      }
    }
  };

  const chooseRightsActionBars = chosenServices?.map((service: Service, serviceIndex) => (
    <RightsActionBar
      key={service.serviceIdentifier}
      title={service.title}
      subtitle={service.serviceOwner}
      color={
        service.status === ServiceStatus.Delegable || service.type === 'AltinnApp'
          ? 'success'
          : 'warning'
      }
      onRemoveClick={() => {
        onRemove(service.serviceIdentifier);
      }}
      compact={isSm}
      defaultOpen={serviceIndex === 0}
    >
      <RightsActionBarContent
        toggleRight={toggleRight}
        rights={service.rights}
        serviceIdentifier={service.serviceIdentifier}
        serviceDescription={service.description}
        rightDescription={service.rightDescription}
        serviceType={service.type}
        serviceOwner={service.serviceOwner}
        reportee={representingParty?.name ?? ''}
      />
    </RightsActionBar>
  ));

  const navigationButtons = () => {
    return (
      <>
        <DsPopover.TriggerContext>
          <DsPopover.Trigger
            variant='primary'
            data-color='accent'
            disabled={delegationCount < 1}
            onClick={() => setPopoverOpen(!popoverOpen)}
          >
            {t('common.finish_delegation')}
          </DsPopover.Trigger>
          <DsPopover
            onClose={() => setPopoverOpen(false)}
            open={popoverOpen}
            color={'info'}
            placement={'top'}
          >
            <DsParagraph>
              {t('single_rights.confirm_delegation_text', { name: recipientName })}
            </DsParagraph>
            <div className={classes.popoverButtonContainer}>
              <DsButton
                onClick={() => {
                  onConfirm();
                }}
              >
                {t('common.confirm')}
              </DsButton>
            </div>
          </DsPopover>
        </DsPopover.TriggerContext>
        <DsButton
          variant='secondary'
          data-color='accent'
          onClick={() => {
            navigate(
              `/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseService}?${urlParams}`,
            );
          }}
        >
          {t('single_rights.add_more_services')}
        </DsButton>
      </>
    );
  };

  const onConfirm = () => {
    updateDelegationCount(chosenServices);
    setShowProgressModal(true);
    setPopoverOpen(false);

    void postDelegations();
  };

  const postDelegations = () => {
    const partyId = getCookie('AltinnPartyId');
    const userUUID = urlParams.get('userUUID');
    const partyUUID = urlParams.get('partyUUID');
    let recipient: IdValuePair[];

    if (userUUID && userUUID === partyUUID) {
      // Recipient is a person
      recipient = [new IdValuePair('urn:altinn:person:uuid', userUUID)];
    } else if (userUUID) {
      // Recipient is an enterprize user
      recipient = [new IdValuePair('urn:altinn:enterpriseuser:uuid', userUUID)];
    } else if (partyUUID) {
      // Recipient is an organization
      recipient = [new IdValuePair('urn:altinn:organization:uuid', partyUUID)];
    } else {
      throw new Error('Neither userUUID nor partyUUID are defined');
    }

    // TODO: OBS! This is a temporary solution for sequential delegations, which is needed due to a weakness in Altinn 2. When this is fixed, we can go back to paralell delegations
    // Post delegations synchroneously using recursive method
    const syncPostDelegations = (servicesToPost: Service[]) => {
      if (servicesToPost.length === 0) {
        // End recursion
        clearAccessCashe({
          party: partyId,
          user: new BaseAttribute(recipient[0].id, recipient[0].value), // In time BaseAttriute will take over from IdValuePair. But until then we need to use both,
        });
      } else {
        const service = servicesToPost[0];
        const rightsToDelegate = service.rights
          .filter((right: ChipRight) => right.checked)
          .map(
            (right: ChipRight) => new DelegationRequestDto(right.resourceReference, right.action),
          );

        if (rightsToDelegate.length > 0) {
          const delegationInput: DelegationInputDto = {
            To: recipient,
            Rights: rightsToDelegate,
            serviceDto: new ServiceDto(service.title, service.serviceOwner, service.type),
          };

          dispatch(delegate(delegationInput)).then(() => {
            syncPostDelegations(servicesToPost.slice(1));
          });
        } else {
          syncPostDelegations(servicesToPost.slice(1));
        }
      }
    };

    syncPostDelegations(chosenServices);
  };

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          {chosenServices.length < 1 ? (
            <RestartPrompter
              title={t('single_rights.no_resources chosen')}
              ingress={t('single_rights.restart_prompter_no_resources_chosen_ingress')}
            />
          ) : !isLoading && recipientError ? (
            <RecipientErrorAlert
              userUUID={urlParams.get('userUUID')}
              partyUUID={urlParams.get('partyUUID')}
            />
          ) : (
            <>
              <DsParagraph variant='long'>
                {t('single_rights.choose_rights_page_top_text', { name: recipientName })}
              </DsParagraph>
              <div className={classes.secondaryText}>
                <DsParagraph>{t('single_rights.choose_rights_page_secondary_text')}</DsParagraph>
              </div>
              <div className={classes.serviceResources}>{chooseRightsActionBars}</div>
              <ProgressModal
                open={showProgressModal}
                loadingText={t('single_rights.processing_delegations')}
                progressValue={processedDelegationsRatio()}
                progressLabel={progressLabel}
              />
            </>
          )}
          <div className={classes.navigationContainer}>{navigationButtons()}</div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
