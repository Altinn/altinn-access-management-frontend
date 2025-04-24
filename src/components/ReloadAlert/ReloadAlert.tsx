import { useTranslation } from 'react-i18next';
import { DsDialog, DsParagraph, DsButton } from '@altinn/altinn-components';

import classes from './ReloadAlert.module.css';

import { useCookieListener } from '@/resources/Cookie/CookieMethods';

export const ReloadAlert = () => {
  const { t } = useTranslation();

  const displayAlert = useCookieListener('AltinnPartyId');

  return (
    displayAlert && (
      <DsDialog
        open
        onClose={() => window.location.reload()}
        closeButton={false}
      >
        <DsParagraph className={classes.alertText}>{t('common.refresh_cookie_alert')}</DsParagraph>
        <DsButton onClick={() => window.location.reload()}>Ok</DsButton>
      </DsDialog>
    )
  );
};
