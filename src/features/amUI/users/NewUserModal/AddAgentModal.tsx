import React, { useEffect, useId, useRef, useState } from 'react';
import { DsButton, DsDialog, DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';
import { AmTabs } from '../../common/AmTabs/AmTabs';

import { NewPersonContent, personInput } from './NewPersonContent';
import classes from './NewUserModal.module.css';
import { createErrorDetails } from '../../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useAddAgentMutation } from '@/rtk/features/clientApi';
import { User } from '@/rtk/features/userInfoApi';

interface AddAgentButtonProps {
  variant: 'primary' | 'secondary';
  onComplete?: (user: User) => void;
}

export const AddAgentButton: React.FC<AddAgentButtonProps> = ({ variant, onComplete }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();

  return (
    <>
      <DsButton
        variant={variant}
        onClick={() => modalRef.current?.showModal()}
      >
        <PlusIcon aria-hidden='true' />
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
  const modalHeadingId = useId();
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
      aria-labelledby={modalHeadingId}
      onClose={() => {
        setErrorDetail(null);
      }}
    >
      <DsHeading
        data-size='xs'
        level={2}
        className={classes.modalHeading}
        id={modalHeadingId}
      >
        {t('client_administration_page.add_agent_button')}
      </DsHeading>
      <AmTabs
        onChange={() => {
          setErrorDetail(null);
        }}
        defaultValue='user'
      >
        <AmTabs.List>
          <AmTabs.Tab
            value='user'
            label={t('client_administration_page.add_agentModal_agent_tab_title')}
          />
        </AmTabs.List>
        <AmTabs.Panel value='user'>
          <NewPersonContent
            isLoading={isLoading}
            errorDetails={errorDetail}
            addPerson={handleAddAgent}
          />
        </AmTabs.Panel>
      </AmTabs>
    </DsDialog>
  );
};

export default AddAgentModal;
