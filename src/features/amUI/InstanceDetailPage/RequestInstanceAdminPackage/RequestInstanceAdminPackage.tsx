import { useRef } from 'react';
import { Button, DsDialog } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { RequestModalBody } from './RequestModalBody';
import { useInstanceAdminPackageRequest } from './useInstanceAdminPackageRequest';

import classes from './RequestInstanceAdminPackage.module.css';

export const RequestInstanceAdminPackage = () => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { hasPendingRequest } = useInstanceAdminPackageRequest();

  const openDialog = () => dialogRef.current?.showModal();

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
      >
        <RequestModalBody dialogRef={dialogRef} />
      </DsDialog>
    </>
  );
};
