import * as React from 'react';
import type { ListItemProps } from '@altinn/altinn-components';
import { List, Button, Icon, DsAlert, Heading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MenuElipsisHorizontalIcon, PackageIcon } from '@navikt/aksel-icons';
import { useState } from 'react';

import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { StatusSection } from '../StatusSection';

import classes from './AccessPackageInfo.module.css';

import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useAccessPackageActions } from '@/features/amUI/common/AccessPackageList/useAccessPackageActions';
import {
  useGetUserDelegationsQuery,
  type PackageResource,
  type AccessPackage,
} from '@/rtk/features/accessPackageApi';
import { TechnicalErrorParagraphs } from '@/features/amUI/common/TechnicalErrorParagraphs';

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
    toUuid: toParty?.partyUuid || '',
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

  const userHasPackage = React.useMemo(() => {
    if (activeDelegations && !isFetching) {
      return Object.values(activeDelegations)
        .flat()
        .some((delegation) => delegation.accessPackageId === accessPackage.id);
    }
    return false;
  }, [activeDelegations, isFetching, accessPackage.id]);

  const [delegationCheckError, setDelegationCheckError] = useState<ActionError | null>(null);

  const handleDelegationCheckFailure = (error: ActionError) => {
    setDelegationCheckError(error);
  };

  const shouldShowDelegationCheck = availableActions.includes(DelegationAction.DELEGATE);

  // memorize this to prevent unnecessary re-renders
  const accessPackageIds = React.useMemo(() => {
    return accessPackage ? [accessPackage.id] : [];
  }, [accessPackage]);

  React.useEffect(() => {
    setDelegationCheckError(null);
  }, [accessPackage]);

  const { canDelegate, isLoading, isUninitialized } = useAccessPackageDelegationCheck(
    accessPackageIds,
    shouldShowDelegationCheck,
    handleDelegationCheckFailure,
  );

  const showMissingRightsMessage =
    shouldShowDelegationCheck &&
    !delegationCheckError &&
    !canDelegate(accessPackage.id) &&
    !isLoading &&
    !isUninitialized;

  const { listItems } = useMinimizableResourceList(accessPackage.resources);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Icon
          size='xl'
          svgElement={PackageIcon}
          className={classes.headerIcon}
        />
        <Heading
          as='h1'
          data-size='md'
        >
          {accessPackage?.name}
        </Heading>
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
              <Heading as='h2'>
                {t('access_packages.delegation_check.delegation_check_error_heading')}
              </Heading>
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
                <Heading
                  as='h2'
                  data-size='2xs'
                >
                  {t('delegation_modal.general_error.revoke_heading')}
                </Heading>
              ) : (
                <Heading
                  as='h2'
                  data-size='2xs'
                >
                  {t('delegation_modal.general_error.delegate_heading')}
                </Heading>
              )}
              <TechnicalErrorParagraphs
                size='xs'
                status={actionError.httpStatus}
                time={actionError.timestamp}
              />
            </DsAlert>
          )}

          <StatusSection
            userHasAccess={userHasPackage}
            showMissingRightsMessage={showMissingRightsMessage}
            inheritedFrom={accessPackage.inherited ? accessPackage.inheritedFrom?.name : undefined}
          />

          <DsParagraph variant='long'>{accessPackage?.description}</DsParagraph>
          <div className={classes.services}>
            <Heading
              data-size='xs'
              as='h2'
            >
              {t('delegation_modal.package_services', {
                count: accessPackage.resources.length,
                name: accessPackage?.name,
              })}
            </Heading>
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
              <Button onClick={() => onRevoke(accessPackage)}>{t('common.delete_poa')}</Button>
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
