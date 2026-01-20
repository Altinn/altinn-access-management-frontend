import React, { useState } from 'react';
import { DsAlert, DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useRemoveAgentMutation } from '@/rtk/features/clientApi';
import classes from './ClientAdministrationAgentDeleteModal.module.css';
import { TrashIcon } from '@navikt/aksel-icons';

interface ClientAdministrationAgentDeleteModalProps {
  agentId?: string;
  backUrl: string;
}

export const ClientAdministrationAgentDeleteModal = ({
  agentId,
  backUrl,
}: ClientAdministrationAgentDeleteModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [removeAgent, { isLoading: isRemoving, isError: isRemoveError }] = useRemoveAgentMutation();

  return (
    <>
      <DsButton
        variant='tertiary'
        onClick={() => setDeleteOpen(true)}
        disabled={!agentId}
      >
        <TrashIcon />
        {t('client_administration_page.agent_delete_button')}
      </DsButton>
      <DsDialog
        open={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        closedby='any'
      >
        <DsHeading data-size='sm'>{t('client_administration_page.agent_delete_heading')}</DsHeading>
        <DsParagraph data-size='md'>
          {t('client_administration_page.agent_delete_body')}
        </DsParagraph>
        {isRemoveError && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          </DsAlert>
        )}
        <div className={classes.buttonContainer}>
          <DsButton
            variant='primary'
            data-color='danger'
            onClick={() => {
              if (!agentId) {
                return;
              }
              removeAgent({ to: agentId })
                .unwrap()
                .then(() => {
                  setDeleteOpen(false);
                  navigate(backUrl);
                })
                .catch(() => undefined);
            }}
            loading={isRemoving}
          >
            {t('client_administration_page.agent_delete_confirm')}
          </DsButton>
          <DsButton
            variant='secondary'
            onClick={() => setDeleteOpen(false)}
            disabled={isRemoving}
          >
            {t('common.cancel')}
          </DsButton>
        </div>
      </DsDialog>
    </>
  );
};
