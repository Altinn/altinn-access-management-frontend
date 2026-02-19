import { DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import classes from './clientAccessInfoModal.module.css';
import { amUIPath } from '@/routes/paths';

interface ClientAccessInfoModalProps {
  open: boolean;
  onClose: () => void;
  isViewingOwnAccess?: boolean;
}

export const ClientAccessInfoModal = ({
  open,
  onClose,
  isViewingOwnAccess = false,
}: ClientAccessInfoModalProps) => {
  const { t } = useTranslation();
  const descriptionKey = isViewingOwnAccess
    ? 'user_roles.has_client_access_description_self'
    : 'user_roles.has_client_access_description';
  const linkPath = isViewingOwnAccess ? amUIPath.MyClients : amUIPath.ClientAdministration;

  return (
    <DsDialog
      open={open}
      closedby='any'
      closeButton={t('common.close')}
      onClose={onClose}
    >
      <div className={classes.modalContent}>
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('user_roles.has_client_access')}
        </DsHeading>
        <DsParagraph data-size='sm'>
          <Trans
            i18nKey={descriptionKey}
            components={{
              a: <Link to={`/${linkPath}`} />,
            }}
          />
        </DsParagraph>
      </div>
    </DsDialog>
  );
};
