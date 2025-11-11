import React, { useRef } from 'react';
import { DsButton, DsDialog, DsHeading, DsTabs } from '@altinn/altinn-components';
import { t } from 'i18next';
import { PlusIcon } from '@navikt/aksel-icons';

import { NewPersonContent } from './NewPersonContent';
import classes from './NewUserModal.module.css';
import { NewOrgContent } from './NewOrgContent';
import { User } from '@/rtk/features/userInfoApi';
import { displayPrivDelegation } from '@/resources/utils/featureFlagUtils';

/**
 * NewUserButton component renders a button that, when clicked, opens a modal to add a new user.
 * @component
 */
interface NewUserButtonProps {
  /*** Render a larger version of the trigger button */
  isLarge?: boolean;
  onComplete?: (user: User) => void;
}

export const NewUserButton: React.FC<NewUserButtonProps> = ({ isLarge, onComplete }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <DsButton
        variant={isLarge ? 'primary' : 'secondary'}
        onClick={() => modalRef.current?.showModal()}
        className={isLarge ? classes.largeButton : undefined}
      >
        <PlusIcon aria-label={t('common.add')} />
        {isLarge ? t('new_user_modal.trigger_button_large') : t('new_user_modal.trigger_button')}
      </DsButton>
      <NewUserModal
        modalRef={modalRef}
        onComplete={onComplete}
      />
    </>
  );
};

interface NewUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  onComplete?: (user: User) => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ modalRef, onComplete }) => {
  const shouldDisplayPrivDelegation = displayPrivDelegation();
  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      aria-labelledby='newUserModal'
    >
      <DsHeading
        data-size='xs'
        level={2}
        className={classes.modalHeading}
        id='newUserModal'
      >
        {t('new_user_modal.modal_title')}
      </DsHeading>
      <DsTabs
        defaultValue={shouldDisplayPrivDelegation ? 'person' : 'org'}
        data-size='sm'
      >
        <DsTabs.List>
          {<DsTabs.Tab value='person'>{t('new_user_modal.person')}</DsTabs.Tab>}
          <DsTabs.Tab value='org'>{t('new_user_modal.organization')}</DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel value='person'>
          <NewPersonContent
            onComplete={onComplete}
            modalRef={modalRef}
          />
        </DsTabs.Panel>
        <DsTabs.Panel value='org'>
          <NewOrgContent
            onComplete={onComplete}
            modalRef={modalRef}
          />
        </DsTabs.Panel>
      </DsTabs>
    </DsDialog>
  );
};

export default NewUserModal;
