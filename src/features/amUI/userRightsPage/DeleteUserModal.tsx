import { Button, DsAlert, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { t } from 'i18next';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';

import { amUIPath } from '@/routes/paths';
import { useGetRightHoldersQuery, useRemoveRightHolderMutation } from '@/rtk/features/userInfoApi';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteUserModal.module.css';

const srmLink =
  'https://www.altinn.no/Pages/ServiceEngine/Start/StartService.aspx?ServiceEditionCode=1&ServiceCode=3498&M=SP&DontChooseReportee=true&O=personal';

export const DeleteUserModal = ({ direction = 'to' }: { direction?: 'to' | 'from' }) => {
  const [deleteUser, { isLoading, isError, error }] = useRemoveRightHolderMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { fromParty, toParty, actingParty, selfParty } = usePartyRepresentation();
  const { data: connections, isLoading: isConnectionLoading } = useGetRightHoldersQuery(
    {
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: toParty?.partyUuid ?? '',
      partyUuid: actingParty?.partyUuid ?? '',
    },
    { skip: !fromParty?.partyUuid || !toParty?.partyUuid || !actingParty?.partyUuid },
  );

  const viewingYourself =
    direction === 'to'
      ? toParty?.partyUuid === selfParty?.partyUuid
      : fromParty?.partyUuid === selfParty?.partyUuid;

  const status = useMemo(
    () => determineUserDeletionStatus(connections, viewingYourself, direction === 'from'),
    [connections],
  );

  const onDeleteUser = () => {
    if (!toParty || !fromParty) {
      console.error('Missing party information');
      return;
    }
    deleteUser({ toPartyUuid: toParty.partyUuid, fromPartyUuid: fromParty.partyUuid })
      .unwrap()
      .then(() => {
        setIsSuccess(true);
      })
      .catch((err) => {
        // Error is already captured by RTK Query's isError and error states
        console.error('Failed to delete user:', err);
      });
  };

  const redirectToUsersPage = () => navigate(`/${amUIPath.Users}`);

  const errorDetails = isError ? createErrorDetails(error) : null;

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='tertiary'
      >
        {t(i18nKeysByStatus[status].triggerButtonKey)}
        <TrashIcon style={{ fontSize: '1.4rem' }} />
      </DsDialog.Trigger>
      <DsDialog
        ref={dialogRef}
        closedby='any'
        closeButton={t('common.close')}
        className={classes.modal}
      >
        {isLoading || isConnectionLoading || isSuccess ? (
          <LoadingAnimation
            isLoading={isLoading}
            displaySuccess={isSuccess}
            onAnimationEnd={redirectToUsersPage}
          />
        ) : (
          <div className={classes.modalContent}>
            <DsHeading>{t(i18nKeysByStatus[status].headingKey)}</DsHeading>
            <Trans
              i18nKey={i18nKeysByStatus[status].messageKey}
              values={{
                to_name: toParty?.name,
                from_name: fromParty?.name,
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
              {status !== UserDeletionStatus.DeletionNotAllowed &&
                status !== UserDeletionStatus.Yourself_DeletionNotAllowed &&
                status !== UserDeletionStatus.Reportee_DeletionNotAllowed && (
                  <Button
                    color='danger'
                    onClick={onDeleteUser}
                  >
                    {t('delete_user.yes_button')}
                  </Button>
                )}
              <Button
                color='neutral'
                variant='text'
                onClick={() => dialogRef.current?.close()}
              >
                {status === UserDeletionStatus.DeletionNotAllowed
                  ? t('common.close')
                  : t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};

enum UserDeletionStatus {
  FullDeletionAllowed = 'FullDeletionAllowed',
  LimitedDeletionOnly = 'LimitedDeletionOnly',
  DeletionNotAllowed = 'DeletionNotAllowed',
  Yourself_FullDeletionAllowed = 'Yourself_FullDeletionAllowed',
  Yourself_LimitedDeletionOnly = 'Yourself_LimitedDeletionOnly',
  Yourself_DeletionNotAllowed = 'Yourself_DeletionNotAllowed',
  Reportee_FullDeletionAllowed = 'Reportee_FullDeletionAllowed',
  Reportee_LimitedDeletionOnly = 'Reportee_LimitedDeletionOnly',
  Reportee_DeletionNotAllowed = 'Reportee_DeletionNotAllowed',
}

const i18nKeysByStatus = {
  [UserDeletionStatus.FullDeletionAllowed]: {
    headingKey: 'delete_user.heading',
    messageKey: 'delete_user.message',
    triggerButtonKey: 'delete_user.trigger_button',
  },
  [UserDeletionStatus.LimitedDeletionOnly]: {
    headingKey: 'delete_user.limited_deletion_heading',
    messageKey: 'delete_user.limited_deletion_message',
    triggerButtonKey: 'delete_user.trigger_button',
  },
  [UserDeletionStatus.DeletionNotAllowed]: {
    headingKey: 'delete_user.deletion_not_allowed_heading',
    messageKey: 'delete_user.deletion_not_allowed_message',
    triggerButtonKey: 'delete_user.trigger_button',
  },
  [UserDeletionStatus.Yourself_FullDeletionAllowed]: {
    headingKey: 'delete_user.yourself_heading',
    messageKey: 'delete_user.yourself_message',
    triggerButtonKey: 'delete_user.yourself_trigger_button',
  },
  [UserDeletionStatus.Yourself_LimitedDeletionOnly]: {
    headingKey: 'delete_user.yourself_limited_deletion_heading',
    messageKey: 'delete_user.yourself_limited_deletion_message',
    triggerButtonKey: 'delete_user.yourself_trigger_button',
  },
  [UserDeletionStatus.Yourself_DeletionNotAllowed]: {
    headingKey: 'delete_user.yourself_deletion_not_allowed_heading',
    messageKey: 'delete_user.yourself_deletion_not_allowed_message',
    triggerButtonKey: 'delete_user.yourself_trigger_button',
  },
  [UserDeletionStatus.Reportee_FullDeletionAllowed]: {
    headingKey: 'delete_user.reportee_heading',
    messageKey: 'delete_user.reportee_message',
    triggerButtonKey: 'delete_user.reportee_trigger_button',
  },
  [UserDeletionStatus.Reportee_LimitedDeletionOnly]: {
    headingKey: 'delete_user.reportee_limited_deletion_heading',
    messageKey: 'delete_user.reportee_limited_deletion_message',
    triggerButtonKey: 'delete_user.reportee_trigger_button',
  },
  [UserDeletionStatus.Reportee_DeletionNotAllowed]: {
    headingKey: 'delete_user.reportee_deletion_not_allowed_heading',
    messageKey: 'delete_user.reportee_deletion_not_allowed_message',
    triggerButtonKey: 'delete_user.reportee_trigger_button',
  },
};

const determineUserDeletionStatus = (
  connections: { roles: string[] }[] | undefined,
  viewingYourself: boolean,
  reporteeView: boolean,
): UserDeletionStatus => {
  if (connections && connections.length > 0) {
    const roles =
      connections.length > 1
        ? connections.reduce((acc, connection) => {
            acc.push(...connection.roles);
            return acc;
          }, [] as string[])
        : connections[0].roles;

    if (roles.every((r) => r === 'Rettighetshaver')) {
      if (viewingYourself) {
        return UserDeletionStatus.Yourself_FullDeletionAllowed;
      }
      if (reporteeView) {
        return UserDeletionStatus.Reportee_FullDeletionAllowed;
      }
      return UserDeletionStatus.FullDeletionAllowed;
    }
    if (roles.some((r) => r === 'Rettighetshaver')) {
      if (viewingYourself) {
        return UserDeletionStatus.Yourself_LimitedDeletionOnly;
      }
      if (reporteeView) {
        return UserDeletionStatus.Reportee_LimitedDeletionOnly;
      }
      return UserDeletionStatus.LimitedDeletionOnly;
    }
    if (viewingYourself) {
      return UserDeletionStatus.Yourself_DeletionNotAllowed;
    }
    if (reporteeView) {
      return UserDeletionStatus.Reportee_DeletionNotAllowed;
    }
    return UserDeletionStatus.DeletionNotAllowed;
  }
  if (viewingYourself) {
    return UserDeletionStatus.Yourself_FullDeletionAllowed;
  }
  if (reporteeView) {
    return UserDeletionStatus.Reportee_FullDeletionAllowed;
  }
  return UserDeletionStatus.FullDeletionAllowed;
};
