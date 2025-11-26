import { useMemo, useState } from 'react';
import pageClasses from './PackagePoaDetailsPage.module.css';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { type User, PartyType } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { Party } from '@/rtk/features/lookupApi';
import AdvancedUserSearch from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAccessPackageActions } from '../common/AccessPackageList/useAccessPackageActions';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { usePackagePermissionConnections } from './usePackagePermissionConnections';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';
import { ExclamationmarkTriangleFillIcon, XMarkIcon } from '@navikt/aksel-icons';
import { ActionError } from '@/resources/hooks/useActionError';
import { ValidationErrorMessage } from '../common/ValidationErrorMessage';
import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

const mapUserToParty = (user: User): Party => ({
  partyId: 0,
  partyUuid: user.id,
  name: user.name,
  partyTypeName: user.variant === 'organization' ? PartyType.Organization : PartyType.Person,
});

interface UsersTabProps {
  accessPackage?: AccessPackage;
  fromParty?: { partyUuid?: string; name?: string } | null;
  isLoading: boolean;
  isFetching: boolean;
  canDelegate?: boolean;
  onDelegateError?: (errorInfo: ActionError) => void;
}

export const UsersTab = ({
  accessPackage,
  fromParty,
  isLoading,
  isFetching,
  canDelegate = true,
  onDelegateError: onDelegateErrorCallback,
}: UsersTabProps) => {
  const { t } = useTranslation();
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isFetching, showPendingOnUnmount: true });
  const [delegateError, setDelegateError] = useState<ActionError | null>(null);
  const [delegateTarget, setDelegateTarget] = useState<Party | null>(null);
  const { mapRoles, loadingRoleMetadata, roleMetadataIsError } = useRoleMapper();
  const roleMetadataUnavailable = loadingRoleMetadata || roleMetadataIsError;
  const {
    data: indirectConnections,
    isLoading: loadingIndirectConnections,
    isFetching: isFetchingIndirectConnections,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '', // all
    },
    {
      skip: !fromParty?.partyUuid,
    },
  );

  const connections = usePackagePermissionConnections(accessPackage);
  const connectionsWithRoles = useMemo(
    () =>
      roleMetadataUnavailable
        ? connections
        : connections.map((connection) => ({
            ...connection,
            roles: mapRoles(connection.roles),
            connections: connection.connections?.map((child) => ({
              ...child,
              roles: mapRoles(child.roles),
            })),
          })),
    [connections, mapRoles, roleMetadataUnavailable],
  );

  const onDelegateSuccess = (p: AccessPackage, toParty: Party) => {
    setDelegateError(null);
    queueSnackbar(
      t('package_poa_details_page.package_delegation_success', {
        name: toParty.name,
        accessPackage: p?.name ?? '',
      }),
      'success',
    );
  };

  const onRevokeSuccess = (p: AccessPackage, toParty: Party) => {
    queueSnackbar(
      t('package_poa_details_page.package_revocation_success', {
        name: toParty.name,
        accessPackage: p?.name ?? '',
      }),
      'success',
    );
  };

  const handleDelegateError = (_accessPackage: AccessPackage, errorInfo: ActionError) => {
    setDelegateError(errorInfo);
    onDelegateErrorCallback?.(errorInfo);
  };

  const {
    onDelegate,
    onRevoke,
    isLoading: isActionLoading,
  } = useAccessPackageActions({
    onDelegateSuccess,
    onRevokeSuccess,
    onDelegateError: handleDelegateError,
  });

  const handleOnDelegate = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      setDelegateError(null);
      setDelegateTarget(toParty);
      onDelegate(accessPackage, toParty);
    }
  };

  const handleOnRevoke = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      onRevoke(accessPackage, toParty);
    }
  };

  return (
    <>
      {connections.length === 0 && !isLoading && !loadingIndirectConnections && (
        <div className={pageClasses.noUsersAlert}>
          <ExclamationmarkTriangleFillIcon className={pageClasses.noUsersAlertIcon} />
          <DsParagraph
            data-size='sm'
            className={pageClasses.tabDescription}
          >
            {t('package_poa_details_page.users_tab.no_users', {
              fromparty: fromParty?.name,
            })}
          </DsParagraph>
        </div>
      )}
      {!isLoading && (
        <DsParagraph
          data-size='md'
          className={pageClasses.tabDescription}
        >
          {t('package_poa_details_page.users_tab.description', {
            fromparty: fromParty?.name,
          })}
        </DsParagraph>
      )}

      {delegateError && (
        <DsAlert
          data-color='danger'
          data-size='sm'
          className={pageClasses.delegateErrorAlert}
        >
          <div className={pageClasses.delegateErrorHeader}>
            <DsHeading
              level={2}
              data-size='2xs'
            >
              {t('delegation_modal.general_error.delegate_heading')}
            </DsHeading>
            <button
              type='button'
              className={pageClasses.dismissButton}
              onClick={() => setDelegateError(null)}
              aria-label={t('common.close')}
            >
              <XMarkIcon />
            </button>
          </div>
          {delegateError.details?.detail || delegateError.details?.errorCode ? (
            <ValidationErrorMessage
              errorCode={delegateError.details?.errorCode ?? delegateError.details?.detail ?? ''}
              translationValues={{
                entity_type:
                  delegateTarget?.partyTypeName === PartyType.Person
                    ? t('common.persons_lowercase')
                    : t('common.organizations_lowercase'),
              }}
            />
          ) : (
            <TechnicalErrorParagraphs
              size='xs'
              status={delegateError.httpStatus}
              time={delegateError.timestamp}
            />
          )}
        </DsAlert>
      )}

      <AdvancedUserSearch
        connections={connectionsWithRoles}
        indirectConnections={indirectConnections}
        isLoading={isLoading || loadingIndirectConnections || roleMetadataUnavailable}
        onDelegate={canDelegate ? handleOnDelegate : undefined}
        onRevoke={handleOnRevoke}
        isActionLoading={
          isActionLoading ||
          isLoading ||
          loadingIndirectConnections ||
          isFetching ||
          isFetchingIndirectConnections ||
          roleMetadataUnavailable
        }
        canDelegate={canDelegate}
      />
    </>
  );
};

export default UsersTab;
