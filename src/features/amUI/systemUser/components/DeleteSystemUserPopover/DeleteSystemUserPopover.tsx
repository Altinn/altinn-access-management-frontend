import { Alert, Button, Paragraph, Popover } from '@digdir/designsystemet-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
      <Popover.TriggerContext>
        <Popover.Trigger
          variant='tertiary'
          data-color='danger'
          onClick={() => setIsPopoverOpen(true)}
        >
          <TrashIcon aria-hidden />
          {t('systemuser_detailpage.delete_systemuser')}
        </Popover.Trigger>
        <Popover
          open={isPopoverOpen}
          data-color='danger'
          className={classes.deletePopover}
          onClose={() => setIsPopoverOpen(false)}
        >
          {hasAgentDelegation ? (
            <Paragraph>{t('systemuser_detailpage.delete_has_customer_warning')}</Paragraph>
          ) : (
            <>
              {t('systemuser_detailpage.delete_systemuser_body', {
                title: integrationTitle,
              })}
              {isDeleteError && (
                <Alert
                  data-color='danger'
                  role='alert'
                >
                  {t('systemuser_detailpage.delete_systemuser_error')}
                </Alert>
              )}
              <ButtonRow>
                <Button
                  data-color='danger'
                  disabled={isDeletingSystemUser}
                  onClick={handleDeleteSystemUser}
                >
                  {t('systemuser_detailpage.delete_systemuser')}
                </Button>
                <Button
                  variant='tertiary'
                  onClick={() => setIsPopoverOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
              </ButtonRow>
            </>
          )}
        </Popover>
      </Popover.TriggerContext>
    </div>
  );
};
