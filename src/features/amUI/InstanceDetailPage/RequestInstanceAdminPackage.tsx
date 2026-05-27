import { useRef, useState } from 'react';
import { Button, DsAlert, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useCreatePackageRequestMutation,
  useGetSentRequestsQuery,
  useWithdrawRequestMutation,
} from '@/rtk/features/requestApi';

import classes from './RequestInstanceAdminPackage.module.css';

const INSTANCE_ADMIN_PACKAGE_URN = 'urn:altinn:accesspackage:tilgangsstyring-enkeltinstanser';

export const RequestInstanceAdminPackage = () => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { actingParty, selfParty } = usePartyRepresentation();
  const [requestError, setRequestError] = useState(false);

  const { data: packageRequests } = useGetSentRequestsQuery(
    {
      party: selfParty?.partyUuid ?? '',
      to: actingParty?.partyUuid ?? '',
      status: ['Pending'],
      type: 'package',
    },
    { skip: !selfParty?.partyUuid || !actingParty?.partyUuid },
  );

  const [createPackageRequest, { isLoading: isCreating }] = useCreatePackageRequestMutation();
  const [withdrawRequest, { isLoading: isWithdrawing }] = useWithdrawRequestMutation();

  const pendingRequest = packageRequests?.find(
    (r) => r.packageId === INSTANCE_ADMIN_PACKAGE_URN && r.to.id === actingParty?.partyUuid,
  );
  const hasPendingRequest = !!pendingRequest;

  const openDialog = () => {
    setRequestError(false);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => dialogRef.current?.close();

  const handleConfirm = async () => {
    if (!actingParty || !selfParty) return;
    setRequestError(false);
    try {
      await createPackageRequest({
        party: selfParty.partyUuid,
        to: actingParty.partyUuid,
        package: INSTANCE_ADMIN_PACKAGE_URN,
      }).unwrap();
      // modal re-renders into pending state via getSentRequests invalidation
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
      // modal re-renders into initial state via getSentRequests invalidation
    } catch {
      setRequestError(true);
    }
  };

  return (
    <>
      <Button
        className={classes.triggerButton}
        data-size='sm'
        variant='secondary'
        onClick={openDialog}
      >
        {hasPendingRequest ? (
          <>
            <MinusCircleIcon aria-hidden='true' />
            {t('instance.withdraw_instance_admin_package')}
          </>
        ) : (
          <>
            <PlusCircleIcon aria-hidden='true' />
            {t('instance.request_instance_admin_package')}
          </>
        )}
      </Button>

      <DsDialog
        ref={dialogRef}
        closedby='any'
        closeButton={t('common.close')}
        onClose={closeDialog}
      >
        <div className={classes.modalContent}>
          {hasPendingRequest ? (
            <>
              <DsHeading level={2}>{t('instance.request_modal.pending_heading')}</DsHeading>
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
              <DsHeading level={2}>{t('instance.request_modal.heading')}</DsHeading>
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
                  disabled={isCreating}
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
      </DsDialog>
    </>
  );
};
