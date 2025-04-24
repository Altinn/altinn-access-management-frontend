import { TrashIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsPopover, DsParagraph, DsAlert, DsButton } from '@altinn/altinn-components';

import { ButtonRow } from '../ButtonRow/ButtonRow';

import classes from './DeleteSystemUserPopover.module.css';

interface DeleteSystemUserPopoverProps {
  integrationTitle: string;
  isDeleteError: boolean;
  isDeletingSystemUser: boolean;
  handleDeleteSystemUser: () => void;
  hasAgentDelegation?: boolean;
}

export const DeleteSystemUserPopover = ({
  integrationTitle,
  isDeleteError,
  isDeletingSystemUser,
  handleDeleteSystemUser,
  hasAgentDelegation,
}: DeleteSystemUserPopoverProps): React.ReactNode => {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  return (
    <div className={classes.systemUserDeleteButtonContainer}>
      <DsPopover.TriggerContext>
        <DsPopover.Trigger
          variant='tertiary'
          data-color='danger'
          onClick={() => setIsPopoverOpen(true)}
        >
          <TrashIcon aria-hidden />
          {t('systemuser_detailpage.delete_systemuser')}
        </DsPopover.Trigger>
        <DsPopover
          open={isPopoverOpen}
          data-color='danger'
          className={classes.deletePopover}
          onClose={() => setIsPopoverOpen(false)}
        >
          {hasAgentDelegation ? (
            <DsParagraph>{t('systemuser_detailpage.delete_has_customer_warning')}</DsParagraph>
          ) : (
            <>
              {t('systemuser_detailpage.delete_systemuser_body', {
                title: integrationTitle,
              })}
              {isDeleteError && (
                <DsAlert
                  data-color='danger'
                  role='alert'
                >
                  {t('systemuser_detailpage.delete_systemuser_error')}
                </DsAlert>
              )}
              <ButtonRow>
                <DsButton
                  data-color='danger'
                  disabled={isDeletingSystemUser}
                  onClick={handleDeleteSystemUser}
                >
                  {t('systemuser_detailpage.delete_systemuser')}
                </DsButton>
                <DsButton
                  variant='tertiary'
                  onClick={() => setIsPopoverOpen(false)}
                >
                  {t('common.cancel')}
                </DsButton>
              </ButtonRow>
            </>
          )}
        </DsPopover>
      </DsPopover.TriggerContext>
    </div>
  );
};
