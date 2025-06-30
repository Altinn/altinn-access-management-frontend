import * as React from 'react';
import type { ListItemProps } from '@altinn/altinn-components';
import { List, Button, Icon, DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MenuElipsisHorizontalIcon, PackageIcon } from '@navikt/aksel-icons';
import { useState } from 'react';

import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useAccessPackageActions } from '@/features/amUI/common/AccessPackageList/useAccessPackageActions';
import {
  useGetUserDelegationsQuery,
  type PackageResource,
  type AccessPackage,
} from '@/rtk/features/accessPackageApi';
import { TechnicalErrorParagraphs } from '@/features/amUI/common/TechnicalErrorParagraphs';

import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { StatusSection } from '../StatusSection';
import { isInherited } from '../../AccessPackageList/useAreaPackageList';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';

import classes from './AccessPackageInfo.module.css';

export interface PackageInfoProps {
  accessPackage: AccessPackage;
  availableActions?: DelegationAction[];
}

export const AccessPackageInfo = ({ accessPackage, availableActions = [] }: PackageInfoProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();

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
      isInherited(delegationAccess, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? '')) ||
    false;

  const [delegationCheckError, setDelegationCheckError] = useState<ActionError | null>(null);

  const handleDelegationCheckFailure = (error: ActionError) => {
    setDelegationCheckError(error);
  };

  const shouldShowDelegationCheck =
    availableActions.includes(DelegationAction.DELEGATE) && !displayLimitedPreviewLaunch;

  // memorize this to prevent unnecessary re-renders
  const accessPackageIds = React.useMemo(() => {
    return accessPackage ? [accessPackage.id] : [];
  }, [accessPackage]);

  React.useEffect(() => {
    setDelegationCheckError(null);
  }, [accessPackage]);

  const { canDelegate, isLoading } = useAccessPackageDelegationCheck(
    accessPackageIds,
    shouldShowDelegationCheck,
    handleDelegationCheckFailure,
  );

  const showMissingRightsMessage =
    shouldShowDelegationCheck &&
    !delegationCheckError &&
    !canDelegate(accessPackage.id) &&
    !isLoading;

  const { listItems } = useMinimizableResourceList(accessPackage.resources);

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
          {!!delegationCheckError && (
            <DsAlert
              data-color='danger'
              data-size='sm'
            >
              <DsHeading level={2}>
                {t('access_packages.delegation_check.delegation_check_error_heading')}
              </DsHeading>
              <TechnicalErrorParagraphs
                message={t(
                  'access_packages.delegation_check.delegation_check_error_message_singular',
                )}
                status={delegationCheckError.httpStatus}
                time={delegationCheckError.timestamp}
              />
            </DsAlert>
          )}
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
            inheritedFrom={
              accessIsInherited
                ? (delegationAccess?.permissions[0].via?.name ??
                  delegationAccess?.permissions[0].to.name)
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
              <List
                items={listItems}
                spacing='xs'
                defaultItemSize='xs'
              />
            </div>
          </div>

          <div className={classes.actions}>
            {userHasPackage && availableActions.includes(DelegationAction.REVOKE) && (
              <Button
                disabled={accessIsInherited}
                onClick={() => onRevoke(accessPackage)}
              >
                {t('common.delete_poa')}
              </Button>
            )}
            {!userHasPackage && availableActions.includes(DelegationAction.DELEGATE) && (
              <Button
                disabled={!canDelegate(accessPackage.id)}
                onClick={() => onDelegate(accessPackage)}
              >
                {t('common.give_poa')}
              </Button>
            )}
            {!userHasPackage && availableActions.includes(DelegationAction.REQUEST) && (
              // Todo: Implement request access package
              <Button disabled>{t('common.request_poa')}</Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const MINIMIZED_LIST_SIZE = 5;

const mapResourceToListItem = (resource: PackageResource): ListItemProps => ({
  title: resource.name,
  description: resource.provider.name,
  icon: { iconUrl: resource.provider.logoUrl },
  as: 'div' as React.ElementType,
  size: 'xs',
});

const useMinimizableResourceList = (list: PackageResource[]) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  if (list.length <= MINIMIZED_LIST_SIZE) {
    return { listItems: list.map(mapResourceToListItem) };
  }
  const showMoreListItem: ListItemProps = {
    title: t('common.show_more'),
    description: '',
    onClick: () => setShowAll(!showAll),
    icon: MenuElipsisHorizontalIcon,
    as: 'button' as React.ElementType,
    size: 'xs',
  };
  const minimizedList = list
    .slice(0, showAll ? list.length : MINIMIZED_LIST_SIZE)
    .map(mapResourceToListItem);
  return { listItems: showAll ? minimizedList : [...minimizedList, showMoreListItem] };
};
