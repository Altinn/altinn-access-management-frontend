import React, { useEffect, useRef, useState } from 'react';
import { DsButton, DsDialog, DsHeading, DsTabs } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';

import { NewPersonContent, personInput } from './NewPersonContent';
import classes from './NewUserModal.module.css';
import { createErrorDetails } from '../../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useAddAgentMutation } from '@/rtk/features/clientApi';
import { User } from '@/rtk/features/userInfoApi';

interface AddAgentButtonProps {
  /*** Render a larger version of the trigger button */
  isLarge?: boolean;
  onComplete?: (user: User) => void;
}

export const AddAgentButton: React.FC<AddAgentButtonProps> = ({ isLarge, onComplete }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();

  return (
    <>
      <DsButton
        variant={isLarge ? 'primary' : 'secondary'}
        onClick={() => modalRef.current?.showModal()}
        className={isLarge ? classes.largeButton : undefined}
      >
        <PlusIcon aria-label={t('common.add')} />
        {t('client_administration_page.add_agent_button')}
      </DsButton>
      <AddAgentModal
        modalRef={modalRef}
        onComplete={onComplete}
      />
    </>
  );
};

interface AddAgentModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  onComplete?: (user: User) => void;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ modalRef, onComplete }) => {
  const [errorDetail, setErrorDetail] = useState<{ status: string; time: string } | null>(null);
  const [addAgent, { isLoading, error }] = useAddAgentMutation();
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      const details = createErrorDetails(error);
      setErrorDetail(details);
    }
  }, [error]);

  const handleAddAgent = async (personInput: personInput) => {
    setErrorDetail(null);
    try {
      const assignment = await addAgent({ personInput }).unwrap();
      if (onComplete) {
        const newUser: User = {
          id: assignment.toId || assignment.id,
          name: personInput.lastName,
          type: 'person',
          children: null,
        };
        onComplete(newUser);
      }
      modalRef.current?.close();
    } catch {
      // Error handling is done in useEffect
    }
  };

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      aria-labelledby='addAgentModal'
      onClose={() => {
        setErrorDetail(null);
      }}
    >
      <DsHeading
        data-size='xs'
        level={2}
        className={classes.modalHeading}
        id='addAgentModal'
      >
        {t('client_administration_page.add_agent_button')}
      </DsHeading>
      <DsTabs
        onChange={() => {
          setErrorDetail(null);
        }}
        defaultValue='user'
        data-size='sm'
      >
        <DsTabs.List>
          <DsTabs.Tab value='user'>{t('client_administration_page.agents_tab_title')}</DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel value='user'>
          <NewPersonContent
            isLoading={isLoading}
            errorDetails={errorDetail}
            addPerson={handleAddAgent}
          />
        </DsTabs.Panel>
      </DsTabs>
    </DsDialog>
  );
};

export default AddAgentModal;
