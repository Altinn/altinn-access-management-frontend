import { useTranslation } from 'react-i18next';
import { Button, Modal, Paragraph } from '@digdir/designsystemet-react';

import { useCookieListener } from '@/resources/Cookie/CookieMethods';

import classes from './ReloadAlert.module.css';

export const ReloadAlert = () => {
  const { t } = useTranslation();

  const displayAlert = useCookieListener('AltinnPartyId');

  return (
    displayAlert && (
      <Modal.Context>
        <Modal
          open
          onClose={() => window.location.reload()}
          closeButton={false}
        >
          <Paragraph className={classes.alertText}>{t('common.refresh_cookie_alert')}</Paragraph>
          <Button onClick={() => window.location.reload()}>Ok</Button>
        </Modal>
      </Modal.Context>
    )
  );
};
