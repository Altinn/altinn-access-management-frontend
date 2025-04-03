import * as React from 'react';
import { Alert, Heading, Paragraph, Spinner, Tag } from '@digdir/designsystemet-react';
import type { ListItemProps } from '@altinn/altinn-components';
import { List, Button, Icon } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';
import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  MenuElipsisHorizontalIcon,
  PackageIcon,
} from '@navikt/aksel-icons';
import { useState } from 'react';
import Lottie from 'lottie-react';

import checkMarkAnimation from '@/assets/AltinnCheckmarkAnimation.json';
import { TechnicalErrorParagraphs } from '@/features/amUI/common/TechnicalErrorParagraphs';
import {
  useGetUserDelegationsQuery,
  type PackageResource,
  type AccessPackage,
} from '@/rtk/features/accessPackageApi';
import { useAccessPackageActions } from '@/features/amUI/common/AccessPackageList/useAccessPackageActions';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';

import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

import classes from './AccessPackageInfo.module.css';

export interface PackageInfoProps {
  accessPackage: AccessPackage;
  availableActions?: DelegationAction[];
}

export const AccessPackageInfo = ({ accessPackage, availableActions = [] }: PackageInfoProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const [tempHasPackage, setTempHasPackage] = useState(false);

  const { onDelegate, onRevoke, isDelegationLoading } = useAccessPackageActions({
    toUuid: toParty?.partyUuid || '',
    onDelegateSuccess: () => {
      setDelegationSuccess(true);
      setTimeout(() => setDelegationSuccess(false), 2000);
      setTempHasPackage(true);
    },
    onDelegateError: (_, error: ActionError) => setActionError(error),
    onRevokeError: (_, error: ActionError) => setActionError(error),
  });
  const { actionError, setActionError, delegationSuccess, setDelegationSuccess } =
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
  const accessPackageIds = React.useMemo(
    () => (accessPackage ? [accessPackage.id] : []),
    [accessPackage],
  );

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
        <Heading
          data-size='md'
          level={1}
        >
          {accessPackage?.name}
        </Heading>
      </div>

      {isDelegationLoading ? (
        <div className={classes.centralizedAnimation}>
          <Spinner
            data-size='lg'
            aria-label='Laster'
            className={classes.largeSpinner}
          />
        </div>
      ) : delegationSuccess ? (
        <div className={classes.centralizedAnimation}>
          <Lottie
            animationData={checkMarkAnimation}
            loop={false}
            style={{ width: '100px', height: '100px' }}
            className={classes.centralizedAnimation}
          />
        </div>
      ) : (
        <>
          {/* delegationSuccess && (
          <Alert
            data-color='success'
            data-size='sm'
          >
            <Paragraph data-size='sm'>
              Fullmakt gitt til {toParty?.name} for {fromParty?.name}
            </Paragraph>
          </Alert>
        )*/}
          {!!delegationCheckError && (
            <Alert
              data-color='danger'
              data-size='sm'
            >
              <Heading level={3}>
                {t('access_packages.delegation_check.delegation_check_error_heading')}
              </Heading>
              <TechnicalErrorParagraphs
                message={t(
                  'access_packages.delegation_check.delegation_check_error_message_singular',
                )}
                status={delegationCheckError.httpStatus}
                time={delegationCheckError.timestamp}
              />
            </Alert>
          )}
          {!!actionError && (
            <Alert
              data-color='danger'
              data-size='sm'
            >
              {userHasPackage ? (
                <Heading data-size='2xs'>
                  {t('delegation_modal.general_error.revoke_heading')}
                </Heading>
              ) : (
                <Heading data-size='2xs'>
                  {t('delegation_modal.general_error.delegate_heading')}
                </Heading>
              )}
              <TechnicalErrorParagraphs
                size='xs'
                status={actionError.httpStatus}
                time={actionError.timestamp}
              />
            </Alert>
          )}

          {userHasPackage ||
            (tempHasPackage && (
              <div className={classes.infoLine}>
                <CheckmarkCircleFillIcon
                  fontSize='1.5rem'
                  className={classes.hasPackageInfoIcon}
                />
                <Paragraph data-size='xs'>{toParty?.name} har denne fullmakten</Paragraph>
              </div>
            ))}
          {accessPackage?.inherited && (
            <div className={classes.inherited}>
              <InformationSquareFillIcon
                fontSize='1.5rem'
                className={classes.inheritedInfoIcon}
              />
              <Paragraph data-size='xs'>
                <Trans
                  i18nKey='delegation_modal.inherited_role_org_message'
                  values={{
                    user_name: toParty?.name,
                    org_name: accessPackage.inheritedFrom?.name ?? fromParty?.name,
                  }}
                  components={{ b: <strong /> }}
                />
              </Paragraph>
            </div>
          )}
          {showMissingRightsMessage && (
            <div className={classes.infoLine}>
              <ExclamationmarkTriangleFillIcon
                fontSize='1.5rem'
                className={classes.delegationCheckInfoIcon}
              />
              <Paragraph data-size='xs'>
                <Trans i18nKey='delegation_modal.delegation_check_not_delegable' />
              </Paragraph>
            </div>
          )}

          <Paragraph variant='long'>{accessPackage?.description}</Paragraph>
          <div className={classes.services}>
            <Heading
              data-size='xs'
              level={2}
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
