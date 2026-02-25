import * as React from 'react';
import { Icon, DsAlert, DsHeading, DsParagraph, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { PackageIcon } from '@navikt/aksel-icons';
import { useAccessPackageDelegationCheck } from '../../DelegationCheck/AccessPackageDelegationCheckContext';

import type { ActionError } from '@/resources/hooks/useActionError';
import { useAccessPackageActions } from '@/features/amUI/common/AccessPackageList/useAccessPackageActions';
import { useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { TechnicalErrorParagraphs } from '@/features/amUI/common/TechnicalErrorParagraphs';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import type { ExtendedAccessPackage } from '../../AccessPackageList/useAreaPackageList';
import { DeletableStatus, getDeletableStatus } from '../../AccessPackageList/useAreaPackageList';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';
import { PackageIsPartiallyDeletableAlert } from '../../AccessPackageList/PackageIsPartiallyDeletableAlert/PackageIsPartiallyDeletableAlert';

import { displayAccessRequest } from '@/resources/utils/featureFlagUtils';
import classes from './AccessPackageInfo.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';
import { StatusSection } from '../../StatusSection/StatusSection';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

export interface PackageInfoProps {
  accessPackage: ExtendedAccessPackage;
  availableActions?: DelegationAction[];
}

export const AccessPackageInfo = ({ accessPackage, availableActions = [] }: PackageInfoProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const { canDelegatePackage } = useAccessPackageDelegationCheck();
  const displayAccessRequestFeature = displayAccessRequest();
  const isSmall = useIsMobileOrSmaller();

  const {
    onDelegate,
    onRevoke,
    isLoading: isActionLoading,
  } = useAccessPackageActions({
    onDelegateSuccess: () => {
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 2000);
    },
    onRevokeSuccess: () => {
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 2000);
    },
    onDelegateError: (_, error: ActionError) => setActionError(error),
    onRevokeError: (_, error: ActionError) => setActionError(error),
  });
  const { actionError, setActionError, actionSuccess, setActionSuccess } =
    useDelegationModalContext();

  const { data: activeDelegations, isFetching } = useGetUserDelegationsQuery({
    to: toParty?.partyUuid ?? '',
    from: fromParty?.partyUuid ?? '',
  });

  const delegationAccess = React.useMemo(() => {
    if (activeDelegations && !isFetching) {
      return (
        Object.values(activeDelegations)
          .flat()
          .find((delegation) => delegation.package.id === accessPackage.id) ?? null
      );
    }
    return null;
  }, [activeDelegations, isFetching, accessPackage.id]);

  const userHasPackage = delegationAccess !== null;
  const accessIsInherited = accessPackage.inherited;

  const inheritedStatus = accessPackage.inheritedStatus;

  const deletableStatus = React.useMemo(
    () =>
      delegationAccess
        ? getDeletableStatus(delegationAccess, toParty?.partyUuid, fromParty?.partyUuid)
        : null,
    [delegationAccess, toParty, fromParty],
  );

  const canDelegate = canDelegatePackage(accessPackage.id);
  const showMissingRightsMessage =
    !userHasPackage &&
    canDelegate?.result === false &&
    availableActions.includes(DelegationAction.DELEGATE);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {!isSmall && (
          <Icon
            size='md'
            svgElement={PackageIcon}
            className={classes.headerIcon}
          />
        )}
        <DsHeading
          level={1}
          data-size={isSmall ? 'xs' : 'md'}
        >
          {accessPackage?.name}
        </DsHeading>
      </div>

      {isActionLoading || actionSuccess ? (
        <LoadingAnimation
          isLoading={isActionLoading}
          displaySuccess={actionSuccess}
        />
      ) : (
        <>
          {!!actionError && (
            <DsAlert
              data-color='danger'
              data-size='sm'
            >
              {userHasPackage ? (
                <DsHeading
                  level={2}
                  data-size='2xs'
                >
                  {t('delegation_modal.general_error.revoke_heading')}
                </DsHeading>
              ) : (
                <DsHeading
                  level={2}
                  data-size='2xs'
                >
                  {t('delegation_modal.general_error.delegate_heading')}
                </DsHeading>
              )}
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
                />
              )}
            </DsAlert>
          )}

          <StatusSection
            userHasAccess={userHasPackage}
            showDelegationCheckWarning={showMissingRightsMessage}
            cannotDelegateHere={accessPackage.isAssignable === false}
            inheritedStatus={inheritedStatus ?? undefined}
          />

          <DsParagraph
            data-size={isSmall ? 'sm' : 'md'}
            variant='long'
          >
            {accessPackage?.description}
          </DsParagraph>
          <div className={classes.services}>
            <DsHeading
              level={2}
              data-size={isSmall ? 'xs' : 'sm'}
            >
              {t('delegation_modal.package_services', {
                count: accessPackage.resources.length,
                name: accessPackage?.name,
              })}
            </DsHeading>
            <div className={classes.service_list}>
              <ResourceList
                resources={accessPackage.resources}
                enableMaxHeight={true}
                showDetails={false}
                interactive={false}
                size='xs'
                as='div'
              />
            </div>
          </div>

          <div className={classes.actions}>
            {userHasPackage && availableActions.includes(DelegationAction.REVOKE) ? (
              deletableStatus !== DeletableStatus.PartiallyDeletable ? (
                <DsButton
                  disabled={accessIsInherited || accessPackage.isAssignable === false}
                  onClick={() => onRevoke(accessPackage)}
                  data-color='danger'
                >
                  {t('common.delete_poa')}
                </DsButton>
              ) : (
                <PackageIsPartiallyDeletableAlert
                  confirmAction={() => onRevoke(accessPackage)}
                  triggerButtonProps={{
                    variant: 'primary',
                  }}
                />
              )
            ) : null}
            {!userHasPackage && availableActions.includes(DelegationAction.DELEGATE) && (
              <DsButton
                disabled={accessPackage.isAssignable === false || canDelegate?.result === false}
                onClick={() => onDelegate(accessPackage)}
              >
                {t('common.give_poa')}
              </DsButton>
            )}
            {!userHasPackage &&
              availableActions.includes(DelegationAction.REQUEST) &&
              // Todo: Implement request access package
              displayAccessRequestFeature && (
                <DsButton disabled>{t('common.request_poa')}</DsButton>
              )}
          </div>
        </>
      )}
    </div>
  );
};
