import { Button } from '@altinn/altinn-components';
import { Dialog, Heading, Paragraph } from '@digdir/designsystemet-react';
import { t } from 'i18next';

import classes from './DeleteUserModal.module.css';

export const DeleteUserModal = () => {
  return (
    <Dialog.TriggerContext>
      <Dialog.Trigger
        data-size='sm'
        variant='tertiary'
      >
        Delete user
      </Dialog.Trigger>
      <Dialog
        closedby='any'
        closeButton={t('common.close')}
      >
        <div className={classes.modalContent}>
          <Heading>Are you sure you want to delete this user?</Heading>
          <Paragraph data-size='sm'>
            They will lose all rights they have on behalf of DISKRET NÆR TIGER
          </Paragraph>
          <div className={classes.buttons}>
            <Button
              color='danger'
              onClick={() => console.log('Cancel')}
            >
              Yes, delete
            </Button>
            <Button
              color='neutral'
              variant='text'
              onClick={() => console.log('Cancel')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </Dialog.TriggerContext>
  );
};
