import * as React from 'react';
import { Button, Icon, DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { PackageIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
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
import { StatusSection } from '../StatusSection';
import type { ExtendedAccessPackage } from '../../AccessPackageList/useAreaPackageList';
import {
  DeletableStatus,
  getDeletableStatus,
  isInherited,
} from '../../AccessPackageList/useAreaPackageList';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';
import { PackageIsPartiallyDeletableAlert } from '../../AccessPackageList/PackageIsPartiallyDeletableAlert/PackageIsPartiallyDeletableAlert';

import classes from './AccessPackageInfo.module.css';

export interface PackageInfoProps {
  accessPackage: ExtendedAccessPackage;
  availableActions?: DelegationAction[];
}

export const AccessPackageInfo = ({ accessPackage, availableActions = [] }: PackageInfoProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const { canDelegatePackage } = useAccessPackageDelegationCheck();

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

  const { displayLimitedPreviewLaunch } = window.featureFlags || {};
  const userHasPackage = delegationAccess !== null;
  const accessIsInherited =
    (delegationAccess &&
      delegationAccess.permissions.some((p) =>
        isInherited(p, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? ''),
      )) ||
    false;

  const deletableStatus = React.useMemo(
    () =>
      delegationAccess
        ? getDeletableStatus(delegationAccess, toParty?.partyUuid, fromParty?.partyUuid)
        : null,
    [delegationAccess, toParty, fromParty],
  );

  const onlyPermissionTroughInheritance =
    delegationAccess &&
    delegationAccess.permissions.every((p) =>
      isInherited(p, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? ''),
    );

  const canDelegate = canDelegatePackage(accessPackage.id);
  const showMissingRightsMessage =
    !userHasPackage &&
    canDelegate?.result === false &&
    availableActions.includes(DelegationAction.DELEGATE);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Icon
          size='xl'
          svgElement={PackageIcon}
          className={classes.headerIcon}
        />
        <DsHeading
          level={1}
          data-size='md'
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
              {actionError.details?.detail ? (
                <ValidationErrorMessage errorCode={actionError.details?.detail} />
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
            showMissingRightsMessage={showMissingRightsMessage}
            cannotDelegateHere={accessPackage.isAssignable === false}
            inheritedFrom={
              onlyPermissionTroughInheritance
                ? (delegationAccess?.permissions[0].via?.name ??
                  delegationAccess?.permissions[0].from.name)
                : undefined
            }
          />

          <DsParagraph variant='long'>{accessPackage?.description}</DsParagraph>
          <div className={classes.services}>
            <DsHeading
              level={2}
              data-size='xs'
            >
              {t('delegation_modal.package_services', {
                count: accessPackage.resources.length,
                name: accessPackage?.name,
              })}
            </DsHeading>
            <div className={classes.service_list}>
              <ResourceList
                resources={accessPackage.resources}
                enableSearch={false}
                showMoreButton={false}
                showDetails={false}
                interactive={false}
                size='xs'
                as='div'
                getOrgCode={(resource) =>
                  resource.provider?.code ??
                  resource.resourceOwnerOrgcode ??
                  resource.resourceOwnerOrgNumber
                }
                getLogoUrl={(resource) =>
                  resource.provider?.logoUrl ?? resource.resourceOwnerLogoUrl
                }
                getLogoAlt={(resource) =>
                  resource.provider?.name ?? resource.resourceOwnerName ?? ''
                }
                getOwnerName={(resource) =>
                  resource.provider?.name ?? resource.resourceOwnerName ?? ''
                }
              />
            </div>
          </div>

          <div className={classes.actions}>
            {userHasPackage && availableActions.includes(DelegationAction.REVOKE) ? (
              deletableStatus !== DeletableStatus.PartiallyDeletable ? (
                <Button
                  disabled={accessIsInherited || accessPackage.isAssignable === false}
                  onClick={() => onRevoke(accessPackage)}
                  color='danger'
                >
                  {t('common.delete_poa')}
                </Button>
              ) : (
                <PackageIsPartiallyDeletableAlert
                  confirmAction={() => onRevoke(accessPackage)}
                  triggerButtonProps={{
                    variant: 'solid',
                  }}
                />
              )
            ) : null}
            {!userHasPackage && availableActions.includes(DelegationAction.DELEGATE) && (
              <Button
                disabled={accessPackage.isAssignable === false || canDelegate?.result === false}
                onClick={() => onDelegate(accessPackage)}
              >
                {t('common.give_poa')}
              </Button>
            )}
            {!userHasPackage &&
              availableActions.includes(DelegationAction.REQUEST) &&
              // Todo: Implement request access package
              !displayLimitedPreviewLaunch && <Button disabled>{t('common.request_poa')}</Button>}
          </div>
        </>
      )}
    </div>
  );
};
