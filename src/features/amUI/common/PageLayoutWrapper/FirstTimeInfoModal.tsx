import { DsButton, DsDialog, DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';
import { useEffect, useState } from 'react';

import classes from './FirstTimeInfoModal.module.css';
import { getHostUrl } from '@/resources/utils/pathUtils';
import { amUIPath } from '@/routes/paths';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const FirstTimeInfoModal = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the modal has been displayed before
    const hasBeenDisplayed = localStorage.getItem('am:beta-modal-displayed');

    // If not displayed or value is 'false', open the modal
    if (!hasBeenDisplayed || hasBeenDisplayed === 'false') {
      setIsOpen(true);
    }

    localStorage.setItem('am:beta-modal-displayed', 'true');
  }, []);

  return (
    <DsDialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      closeButton={false}
      aria-labelledby='info_modal-title'
    >
      <div className={classes.modalContent}>
        <DsHeading
          id='info_modal-title'
          data-size='sm'
        >
          {t('info_modal.title')}
        </DsHeading>
        <DsParagraph>{t('info_modal.info')}</DsParagraph>
        <div className={classes.modalActions}>
          <DsButton onClick={() => setIsOpen(false)}>{t('info_modal.close_button')}</DsButton>
          <DsButton
            variant='secondary'
            asChild
          >
            <a href={getHostUrl() + 'ui/profile'}>{t('info_modal.back_button')}</a>
          </DsButton>
        </div>
        <DsLink asChild>
          <Link
            to={`/${amUIPath.Info}`}
            target='_blank'
            rel='noreferrer'
          >
            {t('info_modal.info_link')}
          </Link>
        </DsLink>
      </div>
    </DsDialog>
  );
};
