import { Button, DsAlert, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { t } from 'i18next';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';

import { useRemoveRightHolderMutation } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteUserModal.module.css';

export const DeleteUserModal = ({ direction = 'to' }: { direction?: 'to' | 'from' }) => {
  const [deleteUser, { isLoading, isError, error }] = useRemoveRightHolderMutation();
  const { toParty, fromParty } = usePartyRepresentation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

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
        {isLoading || isSuccess ? (
          <LoadingAnimation
            isLoading={isLoading}
            displaySuccess={isSuccess}
            onAnimationEnd={redirectToUsersPage}
          />
        ) : (
          <div className={classes.modalContent}>
            <DsHeading>{t('delete_user.heading')}</DsHeading>

            <DsParagraph data-size='sm'>
              <Trans
                i18nKey='delete_user.message'
                values={{
                  user_name: userName,
                  reportee_name: reporteeName,
                }}
              />
            </DsParagraph>
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
              <Button
                color='danger'
                onClick={onDeleteUser}
              >
                {t('delete_user.yes_button')}
              </Button>
              <Button
                color='neutral'
                variant='text'
                onClick={() => dialogRef.current?.close()}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
