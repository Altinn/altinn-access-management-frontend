import { Button, DsAlert, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { t } from 'i18next';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteUserModal.module.css';

import { amUIPath } from '@/routes/paths';
import { useGetRightHoldersQuery, useRemoveRightHolderMutation } from '@/rtk/features/userInfoApi';

const srmLink =
  'https://www.altinn.no/Pages/ServiceEngine/Start/StartService.aspx?ServiceEditionCode=1&ServiceCode=3498&M=SP&DontChooseReportee=true&O=personal';

export const DeleteUserModal = ({ direction = 'to' }: { direction?: 'to' | 'from' }) => {
  const [deleteUser, { isLoading, isError, error }] = useRemoveRightHolderMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const { data: connections, isLoading: isConnectionLoading } = useGetRightHoldersQuery(
    {
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: toParty?.partyUuid ?? '',
      partyUuid: actingParty?.partyUuid ?? '',
    },
    { skip: !fromParty?.partyUuid || !toParty?.partyUuid || !actingParty?.partyUuid },
  );

  const status = useMemo(
    () => determineUserDeletionStatus(connections),
    [connections, isConnectionLoading],
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

  const userName = direction === 'to' ? toParty?.name : fromParty?.name;
  const reporteeName = direction === 'to' ? fromParty?.name : toParty?.name;

  const redirectToUsersPage = () => navigate(`/${amUIPath.Users}`);

  const errorDetails = isError ? createErrorDetails(error) : null;

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='tertiary'
      >
        {t('delete_user.trigger_button')}
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
            {status === UserDeletionStatus.FullDeletionAllowed && (
              <>
                <DsHeading>{t('delete_user.heading')}</DsHeading>
                <DsParagraph>
                  <Trans
                    i18nKey='delete_user.message'
                    values={{
                      user_name: userName,
                      reportee_name: reporteeName,
                    }}
                  />
                </DsParagraph>
              </>
            )}
            {status === UserDeletionStatus.LimitedDeletionOnly && (
              <>
                <DsHeading>{t('delete_user.limited_deletion_heading')}</DsHeading>
                <Trans
                  i18nKey='delete_user.limited_deletion_message'
                  values={{
                    user_name: userName,
                    reportee_name: reporteeName,
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
              </>
            )}
            {status === UserDeletionStatus.DeletionNotAllowed && (
              <>
                <DsHeading>
                  {t('delete_user.deletion_not_allowed_heading', { reportee_name: reporteeName })}
                </DsHeading>
                <DsParagraph>
                  <Trans
                    i18nKey='delete_user.deletion_not_allowed_message'
                    values={{
                      user_name: userName,
                      reportee_name: reporteeName,
                    }}
                    components={{
                      erLink: (
                        <Link
                          to={srmLink}
                          target='_blank'
                          rel='noopener noreferrer'
                        ></Link>
                      ),
                    }}
                  />
                </DsParagraph>
              </>
            )}
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
              {status !== UserDeletionStatus.DeletionNotAllowed && (
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
                  ? t('common.cancel')
                  : t('common.close')}
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
}

const determineUserDeletionStatus = (connections: { roles: string[] }[] | undefined) => {
  if (connections && connections?.length > 0) {
    const roles =
      connections?.length > 1
        ? connections.reduce((acc, connection) => [...acc, ...connection.roles], [] as string[])
        : connections[0].roles;
    if (roles.every((r) => r === 'Rettighetshaver')) return UserDeletionStatus.FullDeletionAllowed;
    if (roles.some((r) => r === 'Rettighetshaver')) return UserDeletionStatus.LimitedDeletionOnly;
    return UserDeletionStatus.DeletionNotAllowed;
  }
};
