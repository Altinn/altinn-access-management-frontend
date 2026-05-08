import { Button, DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useAddMaskinportenResourceMutation,
  useGetMaskinportenResourcesQuery,
  useMaskinportenResourceDelegationCheckQuery,
  useRemoveMaskinportenResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../common/ValidationErrorMessage';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';
import { ResourceAlert } from '../common/DelegationModal/SingleRights/ResourceAlert';
import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { StatusSection } from '../common/StatusSection/StatusSection';
import classes from './MaskinportenScopeInfo.module.css';
import resourceInfoClasses from '../common/DelegationModal/SingleRights/ResourceInfo.module.css';

const extractStatus = (error: unknown): string => {
  if (error && typeof error === 'object' && 'status' in error) {
    return String((error as { status: unknown }).status);
  }
  return String(error);
};

const extractDetails = (error: unknown): ActionError['details'] | undefined => {
  if (error && typeof error === 'object' && 'data' in error) {
    return error.data as ActionError['details'];
  }
  return undefined;
};

const getErrorInfo = (error: unknown): ActionError => ({
  httpStatus: extractStatus(error),
  details: extractDetails(error),
  timestamp: new Date().toISOString(),
});

export const MaskinportenScopeInfo = ({ resource }: { resource: ServiceResource }) => {
  const isSmall = useIsMobileOrSmaller();
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const { actionError, setActionError, actionSuccess, setActionSuccess } =
    useDelegationModalContext();
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addResource, { isLoading: isAddingResource }] = useAddMaskinportenResourceMutation();
  const [removeResource, { isLoading: isRemovingResource }] =
    useRemoveMaskinportenResourceMutation();
  const scopes =
    resource.resourceReferences?.filter(
      (reference) => reference.referenceType === 'MaskinportenScope' && reference.reference?.trim(),
    ) ?? [];
  const supplier = toParty?.orgNumber ?? '';

  const {
    data: delegationCheck,
    error: delegationCheckError,
    isError: isDelegationCheckError,
    isFetching: isDelegationCheckLoading,
  } = useMaskinportenResourceDelegationCheckQuery(
    {
      party: fromParty?.partyUuid,
      resource: resource.identifier,
    },
    {
      skip: !fromParty?.partyUuid || !resource.identifier,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: delegatedResources, isFetching: isDelegatedResourcesLoading } =
    useGetMaskinportenResourcesQuery(
      {
        party: fromParty?.partyUuid,
        supplier,
        resource: resource.identifier,
      },
      {
        skip: !fromParty?.partyUuid || !supplier || !resource.identifier,
        refetchOnMountOrArgChange: true,
      },
    );
  const canDelegateResource = delegationCheck?.rights?.some((right) => right.result) ?? false;
  const hasDelegatedResource =
    delegatedResources?.some(
      (delegatedResource) => delegatedResource.resource?.identifier === resource.identifier,
    ) ?? false;
  const hasDelegationCheckResult = delegationCheck !== undefined;
  const showDelegationCheckWarning =
    !hasDelegatedResource &&
    !isDelegationCheckLoading &&
    hasDelegationCheckResult &&
    !canDelegateResource;
  const rawDelegationCheckErrorDetails = isDelegationCheckError
    ? createErrorDetails(delegationCheckError)
    : null;
  const delegationCheckErrorDetails = isDelegationCheckError
    ? {
        status: rawDelegationCheckErrorDetails?.status ?? 'no status',
        time: rawDelegationCheckErrorDetails?.time ?? new Date().toISOString(),
        traceId: rawDelegationCheckErrorDetails?.traceId,
      }
    : null;
  const delegationCheckRightReasons = showDelegationCheckWarning
    ? (delegationCheck?.rights?.map((right) => right.reasonCodes[0] ?? '') ?? [''])
    : undefined;
  const displayResourceAlert =
    !!delegationCheckErrorDetails || resource.delegable === false || showDelegationCheckWarning;
  const isActionLoading = isAddingResource || isRemovingResource;
  const isInitialLoading =
    (isDelegationCheckLoading && !delegationCheck && !isDelegationCheckError) ||
    (isDelegatedResourcesLoading && !delegatedResources);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleActionSuccess = () => {
    setActionError(null);
    setActionSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setActionSuccess(false), 2000);
  };

  const handleAddResource = async () => {
    if (!fromParty?.partyUuid || !supplier || !resource.identifier || !canDelegateResource) {
      return;
    }

    setActionError(null);
    try {
      await addResource({
        party: fromParty.partyUuid,
        supplier,
        resource: resource.identifier,
      }).unwrap();
      handleActionSuccess();
    } catch (error) {
      setActionError(getErrorInfo(error));
    }
  };

  const handleRemoveResource = async () => {
    if (!fromParty?.partyUuid || !supplier || !resource.identifier || !hasDelegatedResource) {
      return;
    }

    setActionError(null);
    try {
      await removeResource({
        party: fromParty.partyUuid,
        supplier,
        resource: resource.identifier,
      }).unwrap();
      handleActionSuccess();
    } catch (error) {
      setActionError(getErrorInfo(error));
    }
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
            {!!actionError && (
              <DsAlert
                data-color='danger'
                data-size='sm'
              >
                <DsHeading
                  level={2}
                  data-size='2xs'
                >
                  {hasDelegatedResource
                    ? t('delegation_modal.general_error.revoke_heading')
                    : t('delegation_modal.general_error.delegate_heading')}
                </DsHeading>
                {actionError.details?.detail || actionError.details?.errorCode ? (
                  <ValidationErrorMessage
                    errorCode={actionError.details?.errorCode ?? actionError.details?.detail ?? ''}
                    translationValues={{
                      entity_type:
                        toParty?.partyTypeName === PartyType.Person
                          ? t('common.persons_lowercase')
                          : t('common.organizations_lowercase'),
                    }}
                  />
                ) : (
                  <TechnicalErrorParagraphs
                    size='xs'
                    status={actionError.httpStatus}
                    time={actionError.timestamp}
                    traceId={actionError.details?.traceId}
                  />
                )}
              </DsAlert>
            )}
            <div
              className={resourceInfoClasses.resourceInfo}
              data-size={isSmall ? 'xs' : 'md'}
            >
              <StatusSection
                userHasAccess={hasDelegatedResource}
                showDelegationCheckWarning={showDelegationCheckWarning}
                cannotDelegateHere={resource.delegable === false}
              />
              {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
              {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
            </div>
            {displayResourceAlert && (
              <ResourceAlert
                error={delegationCheckErrorDetails}
                rightReasons={delegationCheckRightReasons}
                resource={resource}
                className={resourceInfoClasses.resourceAlert}
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
            <div className={resourceInfoClasses.editButtons}>
              {hasDelegatedResource ? (
                <Button
                  color='danger'
                  disabled={isActionLoading}
                  onClick={handleRemoveResource}
                  variant='tertiary'
                >
                  <MinusCircleIcon aria-hidden='true' />
                  {t('common.delete_poa')}
                </Button>
              ) : (
                <Button
                  data-size='sm'
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
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
