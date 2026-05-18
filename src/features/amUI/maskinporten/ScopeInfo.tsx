import { Button, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useAddMaskinportenSupplierResourceMutation,
  useGetMaskinportenConsumerResourcesQuery,
  useGetMaskinportenSupplierResourcesQuery,
  useMaskinportenResourceDelegationCheckQuery,
  useRemoveMaskinportenConsumerResourceMutation,
  useRemoveMaskinportenSupplierResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { getActionError } from '@/resources/hooks/useActionError';

import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';
import { ResourceAlert } from '../common/DelegationModal/SingleRights/ResourceAlert';
import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { StatusSection } from '../common/StatusSection/StatusSection';
import { ScopeActionAlert } from './ScopeActionAlert';
import { getMaskinportenScopes } from './scopeUtils';
import { useMaskinportenResourceActions } from './hooks/useMaskinportenResourceActions';
import classes from './ScopeInfo.module.css';

const SUCCESS_DISPLAY_MS = 2000;

interface ScopeInfoProps {
  resource: ServiceResource;
  availableActions?: DelegationAction[];
}

export const ScopeInfo = ({
  resource,
  availableActions = [DelegationAction.DELEGATE, DelegationAction.REVOKE],
}: ScopeInfoProps) => {
  const canDelegate = availableActions.includes(DelegationAction.DELEGATE);
  const canRevoke = availableActions.includes(DelegationAction.REVOKE);
  const isRevokeOnly = canRevoke && !canDelegate;
  const isSmall = useIsMobileOrSmaller();
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const { actionError, setActionError, actionSuccess, setActionSuccess } =
    useDelegationModalContext();
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const consumerPartyUuid = fromParty?.partyUuid;
  const supplierOrgNumber = toParty?.orgNumber ?? '';
  const scopes = getMaskinportenScopes(resource);

  const [addSupplierResource] = useAddMaskinportenSupplierResourceMutation();
  const [removeSupplierResource] = useRemoveMaskinportenSupplierResourceMutation();
  const [removeConsumerResource, { isLoading: isRemovingConsumerResource }] =
    useRemoveMaskinportenConsumerResourceMutation();
  const { delegate, remove, isLoading } = useMaskinportenResourceActions({
    delegate: (r) =>
      addSupplierResource({
        party: consumerPartyUuid!,
        supplier: supplierOrgNumber,
        resource: r.identifier,
      }).unwrap(),
    remove: (r) =>
      removeSupplierResource({
        party: consumerPartyUuid!,
        supplier: supplierOrgNumber,
        resource: r.identifier,
      }).unwrap(),
  });

  const {
    data: delegationCheck,
    error: delegationCheckError,
    isError: isDelegationCheckError,
    isFetching: isDelegationCheckLoading,
  } = useMaskinportenResourceDelegationCheckQuery(
    {
      party: consumerPartyUuid,
      resource: resource.identifier,
    },
    {
      skip: !canDelegate || !consumerPartyUuid || !resource.identifier,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: delegatedResources, isFetching: isDelegatedResourcesLoading } =
    useGetMaskinportenSupplierResourcesQuery(
      {
        party: consumerPartyUuid,
        supplier: supplierOrgNumber,
        resource: resource.identifier,
      },
      {
        skip: !canDelegate || !consumerPartyUuid || !supplierOrgNumber || !resource.identifier,
        refetchOnMountOrArgChange: true,
      },
    );
  const { data: consumerResources, isFetching: isConsumerResourcesLoading } =
    useGetMaskinportenConsumerResourcesQuery(
      {
        party: toParty?.partyUuid,
        consumer: fromParty?.orgNumber,
      },
      {
        skip: !isRevokeOnly || !toParty?.partyUuid || !fromParty?.orgNumber,
        refetchOnMountOrArgChange: true,
      },
    );

  const canDelegateResource = delegationCheck?.rights?.some((right) => right.result) ?? false;
  const hasDelegatedResource = isRevokeOnly
    ? (consumerResources?.some(
        (delegatedResource) => delegatedResource.resource?.identifier === resource.identifier,
      ) ?? false)
    : (delegatedResources?.some(
        (delegatedResource) => delegatedResource.resource?.identifier === resource.identifier,
      ) ?? false);
  const showDelegationCheckWarning =
    canDelegate &&
    !hasDelegatedResource &&
    !isDelegationCheckLoading &&
    delegationCheck !== undefined &&
    !canDelegateResource;
  const rawErrorDetails = isDelegationCheckError ? createErrorDetails(delegationCheckError) : null;
  const delegationCheckErrorDetails =
    canDelegate && isDelegationCheckError
      ? {
          status: rawErrorDetails?.status ?? 'no status',
          time: rawErrorDetails?.time ?? new Date().toISOString(),
          traceId: rawErrorDetails?.traceId,
        }
      : null;
  const delegationCheckRightReasons = showDelegationCheckWarning
    ? (delegationCheck?.rights?.map((right) => right.reasonCodes?.[0] ?? '') ?? [''])
    : undefined;
  const displayResourceAlert =
    canDelegate &&
    (!!delegationCheckErrorDetails || resource.delegable === false || showDelegationCheckWarning);
  const isActionLoading = isLoading(resource.identifier) || isRemovingConsumerResource;
  const isInitialLoading = isRevokeOnly
    ? isConsumerResourcesLoading && !consumerResources
    : (isDelegationCheckLoading && !delegationCheck && !isDelegationCheckError) ||
      (isDelegatedResourcesLoading && !delegatedResources);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleSuccess = () => {
    setActionError(null);
    setActionSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setActionSuccess(false), SUCCESS_DISPLAY_MS);
  };

  const handleAddResource = () => {
    if (!canDelegateResource) return;
    setActionError(null);
    delegate(resource, {
      onSuccess: handleSuccess,
      onError: (_, error) => setActionError(error),
    });
  };

  const handleRemoveResource = async () => {
    if (!hasDelegatedResource) return;
    setActionError(null);

    if (isRevokeOnly) {
      if (!toParty?.partyUuid || !fromParty?.orgNumber || !resource.identifier) return;
      try {
        await removeConsumerResource({
          party: toParty.partyUuid,
          consumer: fromParty.orgNumber,
          resource: resource.identifier,
        }).unwrap();
        handleSuccess();
      } catch (error) {
        setActionError(getActionError(error));
      }
      return;
    }

    remove(resource, {
      onSuccess: handleSuccess,
      onError: (_, error) => setActionError(error),
    });
  };

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {actionError ? t('delegation_modal.technical_error_message.heading') : ''}
      </StatusMessageForScreenReader>
      <div>
        <ResourceHeading resource={resource} />
        {isActionLoading || actionSuccess ? (
          <LoadingAnimation
            isLoading={isActionLoading}
            displaySuccess={actionSuccess}
          />
        ) : isInitialLoading ? (
          <ResourceInfoSkeleton />
        ) : (
          <>
            <div
              className={classes.resourceInfo}
              data-size={isSmall ? 'xs' : 'md'}
            >
              <StatusSection
                userHasAccess={hasDelegatedResource}
                showDelegationCheckWarning={showDelegationCheckWarning}
                cannotDelegateHere={canDelegate && resource.delegable === false}
              />
              {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
              {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
            </div>
            {displayResourceAlert && (
              <ResourceAlert
                error={delegationCheckErrorDetails}
                rightReasons={delegationCheckRightReasons}
                resource={resource}
                className={classes.resourceAlert}
              />
            )}
            {!!actionError && (
              <ScopeActionAlert
                actionError={actionError}
                mode={hasDelegatedResource ? 'revoke' : 'delegate'}
              />
            )}
            <div className={classes.scopes}>
              <DsHeading
                level={4}
                data-size='2xs'
              >
                {t('api_delegation.scopes')}
              </DsHeading>
              {scopes.length > 0 ? (
                <ul className={classes.scopeList}>
                  {scopes.map((scope) => (
                    <li key={`${scope.reference}`}>{scope.reference}</li>
                  ))}
                </ul>
              ) : (
                <DsParagraph>{t('maskinporten_page.no_scopes')}</DsParagraph>
              )}
            </div>
            {hasDelegatedResource && canRevoke ? (
              <div className={classes.editButtons}>
                <DsButton
                  data-size='sm'
                  data-color='danger'
                  disabled={isActionLoading}
                  onClick={handleRemoveResource}
                  variant='secondary'
                >
                  <MinusCircleIcon aria-hidden='true' />
                  {t('common.delete_poa')}
                </DsButton>
              </div>
            ) : !hasDelegatedResource && canDelegate ? (
              <div className={classes.editButtons}>
                <Button
                  size='sm'
                  disabled={
                    isActionLoading ||
                    !!displayResourceAlert ||
                    !canDelegateResource ||
                    isDelegationCheckLoading ||
                    isDelegatedResourcesLoading
                  }
                  onClick={handleAddResource}
                >
                  {t('common.give_poa')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};
