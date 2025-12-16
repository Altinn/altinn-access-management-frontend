import {
  Button,
  DsAlert,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';
import { t } from 'i18next';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { amUIPath } from '@/routes/paths';
import {
  useGetRightHoldersQuery,
  useRemoveRightHolderMutation,
} from '@/rtk/features/connectionApi';
import { accessPackageApi } from '@/rtk/features/accessPackageApi';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { LoadingAnimation } from '../LoadingAnimation/LoadingAnimation';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteUserModal.module.css';
import { getDeletionStatus, getTextKeysForDeletionStatus } from './deletionModalUtils';
import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';
import { roleApi, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { handleSelectAccount } from '../PageLayoutWrapper/useHeader';
import { PartyType } from '@/rtk/features/userInfoApi';

const srmLink =
  'https://www.altinn.no/Pages/ServiceEngine/Start/StartService.aspx?ServiceEditionCode=1&ServiceCode=3498&M=SP&DontChooseReportee=true&O=personal';

const a2ProfileLink = getRedirectToA2UsersListSectionUrl(9);

export const DeleteUserModal = ({ direction = 'to' }: { direction?: 'to' | 'from' }) => {
  const [deleteUser, { isLoading, isError, error }] = useRemoveRightHolderMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    fromParty,
    toParty,
    actingParty,
    selfParty,
    isLoading: loadingPartyRepresentation,
  } = usePartyRepresentation();
  const { data: rolePermissions, isLoading: isRolePermissionsLoading } = useGetRolePermissionsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    { skip: !fromParty?.partyUuid || !toParty?.partyUuid || !actingParty?.partyUuid },
  );

  const viewingYourself =
    direction === 'to'
      ? toParty?.partyUuid === selfParty?.partyUuid
      : fromParty?.partyUuid === selfParty?.partyUuid;

  const reporteeView = direction === 'from';

  const status = useMemo(
    () => getDeletionStatus(rolePermissions, viewingYourself, reporteeView),
    [rolePermissions, viewingYourself, reporteeView],
  );

  const textKeys = getTextKeysForDeletionStatus(status);

  const onDeleteUser = () => {
    if (!toParty || !fromParty || !actingParty) {
      console.error('Missing party information');
      return;
    }
    deleteUser({ to: toParty.partyUuid, from: fromParty.partyUuid, party: actingParty?.partyUuid })
      .unwrap()
      .then(() => {
        setIsSuccess(true);
        dispatch(roleApi.util.invalidateTags(['roles'])); // Invalidate roles cache
        dispatch(accessPackageApi.util.invalidateTags(['AccessPackages'])); // Invalidate access packages cache
        if (toParty.partyUuid === selfParty?.partyUuid) {
          handleSelectAccount(selfParty.partyUuid);
        }
      })
      .catch((err) => {
        // Error is already captured by RTK Query's isError and error states
        console.error('Failed to delete user:', err);
      });
  };

  const redirectToUsersPage = () => navigate(`/${amUIPath.Users}`);

  const errorDetails = isError ? createErrorDetails(error) : null;

  const isDeletionNotAllowed = status.level === 'none';

  const formattedToPartyName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedFromPartyName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='tertiary'
        disabled={loadingPartyRepresentation}
      >
        <TrashIcon style={{ fontSize: '1.4rem' }} />
        {t(textKeys.triggerButtonKey)}
      </DsDialog.Trigger>
      <DsDialog
        ref={dialogRef}
        closedby='any'
        closeButton={t('common.close')}
        className={classes.modal}
      >
        {isLoading || isRolePermissionsLoading || isSuccess ? (
          <LoadingAnimation
            isLoading={isLoading}
            displaySuccess={isSuccess}
            onAnimationEnd={redirectToUsersPage}
          />
        ) : loadingPartyRepresentation ? (
          <DsSkeleton
            variant='text'
            width='180'
          />
        ) : (
          <div className={classes.modalContent}>
            <DsHeading>{t(textKeys.headingKey)}</DsHeading>
            <Trans
              i18nKey={textKeys.messageKey}
              values={{
                to_name: formattedToPartyName,
                from_name: formattedFromPartyName,
              }}
              components={{
                p: <DsParagraph data-size='sm'></DsParagraph>,
                erLink: (
                  <Link
                    to={srmLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  ></Link>
                ),
                a2Link: (
                  <Link
                    to={a2ProfileLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  ></Link>
                ),
              }}
            />
            {isError && errorDetails && (
              <DsAlert
                data-size='sm'
                data-color='danger'
              >
                <TechnicalErrorParagraphs
                  status={errorDetails.status}
                  time={errorDetails.time}
                  size='sm'
                />
              </DsAlert>
            )}
            <div className={classes.buttons}>
              {!isDeletionNotAllowed && (
                <Button
                  color='danger'
                  onClick={onDeleteUser}
                  disabled={isLoading || isRolePermissionsLoading || loadingPartyRepresentation}
                >
                  {t('delete_user.yes_button')}
                </Button>
              )}
              {!isDeletionNotAllowed && (
                <Button
                  color='neutral'
                  variant='text'
                  onClick={() => dialogRef.current?.close()}
                >
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </div>
        )}
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
