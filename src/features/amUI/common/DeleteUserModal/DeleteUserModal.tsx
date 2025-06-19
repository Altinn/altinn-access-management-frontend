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
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { LoadingAnimation } from '../LoadingAnimation/LoadingAnimation';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteUserModal.module.css';
import { getDeletionStatus, getTextKeysForDeletionStatus } from './deletionModalUtils';

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

  const reporteeView = direction === 'from';

  const status = useMemo(
    () => getDeletionStatus(connections, viewingYourself, reporteeView),
    [connections, viewingYourself, reporteeView],
  );

  const textKeys = getTextKeysForDeletionStatus(status);

  const onDeleteUser = () => {
    if (!toParty || !fromParty) {
      console.error('Missing party information');
      return;
    }
    deleteUser({ to: toParty.partyUuid, from: fromParty.partyUuid, party: actingParty?.partyUuid })
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

  const isDeletionNotAllowed = status.level === 'none';

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='tertiary'
      >
        {t(textKeys.triggerButtonKey)}
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
            <DsHeading>{t(textKeys.headingKey)}</DsHeading>
            <Trans
              i18nKey={textKeys.messageKey}
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
              {!isDeletionNotAllowed && (
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
                {t(isDeletionNotAllowed ? 'common.close' : 'common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
