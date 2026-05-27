import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button, DsAlert, DsHeading, DsParagraph, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import {
  useCreatePackageRequestMutation,
  useWithdrawRequestMutation,
} from '@/rtk/features/requestApi';

import {
  ORG_INSTANCE_ADMIN_PACKAGE_URN,
  useInstanceAdminPackageRequest,
} from './useInstanceAdminPackageRequest';

import classes from './RequestInstanceAdminPackage.module.css';

interface RequestModalBodyProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
}

export const RequestModalBody = ({ dialogRef }: RequestModalBodyProps) => {
  const { t } = useTranslation();
  const { openSnackbar, dismissSnackbar } = useSnackbar();
  const { actingParty, selfParty, pendingRequest, hasPendingRequest, isLoading } =
    useInstanceAdminPackageRequest();

  const [requestError, setRequestError] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);

  const [createPackageRequest, { isLoading: isCreating }] = useCreatePackageRequestMutation();
  const [withdrawRequest, { isLoading: isWithdrawing }] = useWithdrawRequestMutation();

  const closeDialog = () => dialogRef.current?.close();

  // Clear any error and dismiss the snackbar when the dialog closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      setRequestError(false);
      dismissSnackbar();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [dialogRef, dismissSnackbar]);

  const handleConfirm = async () => {
    if (!actingParty || !selfParty) return;
    setRequestError(false);
    try {
      await createPackageRequest({
        party: selfParty.partyUuid,
        to: actingParty.partyUuid,
        package: ORG_INSTANCE_ADMIN_PACKAGE_URN,
      }).unwrap();
      // Move focus to heading
      headingRef.current?.focus();
      openSnackbar({ message: t('instance.request_modal.request_success'), color: 'success' });
    } catch {
      setRequestError(true);
    }
  };

  const handleWithdraw = async () => {
    if (!selfParty || !pendingRequest) return;
    setRequestError(false);
    try {
      await withdrawRequest({
        party: selfParty.partyUuid,
        id: pendingRequest.id,
      }).unwrap();
      // Move focus to heading
      headingRef.current?.focus();
      openSnackbar({
        message: t('instance.request_modal.delete_request_success'),
        color: 'success',
      });
    } catch {
      setRequestError(true);
    }
  };

  return (
    <div className={classes.modalContent}>
      {hasPendingRequest ? (
        <>
          <DsHeading
            ref={headingRef}
            tabIndex={-1}
            level={2}
          >
            {t('instance.request_modal.pending_heading')}
          </DsHeading>
          <DsParagraph>
            {t('instance.request_modal.pending_description', {
              fromParty: actingParty?.name ?? '',
            })}
          </DsParagraph>
          {requestError && (
            <DsAlert data-color='danger'>
              {t('instance.request_modal.delete_request_error')}
            </DsAlert>
          )}
          <div className={classes.actions}>
            <Button
              data-size='sm'
              variant='primary'
              data-color='danger'
              loading={isWithdrawing}
              disabled={isWithdrawing}
              onClick={handleWithdraw}
            >
              {t('instance.request_modal.delete_request')}
            </Button>
            <Button
              data-size='sm'
              variant='secondary'
              onClick={closeDialog}
            >
              {t('instance.request_modal.close')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <DsHeading
            ref={headingRef}
            tabIndex={-1}
            level={2}
          >
            {t('instance.request_modal.heading')}
          </DsHeading>
          <DsParagraph>{t('instance.request_modal.description_1')}</DsParagraph>
          <DsParagraph>{t('instance.request_modal.description_2')}</DsParagraph>
          {requestError && (
            <DsAlert data-color='danger'>{t('instance.request_modal.request_error')}</DsAlert>
          )}
          <div className={classes.actions}>
            <Button
              data-size='sm'
              variant='primary'
              loading={isCreating}
              disabled={isCreating || isLoading}
              onClick={handleConfirm}
            >
              {t('instance.request_modal.confirm')}
            </Button>
            <Button
              data-size='sm'
              variant='secondary'
              onClick={closeDialog}
            >
              {t('instance.request_modal.cancel')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
