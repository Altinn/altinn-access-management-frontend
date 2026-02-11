import { DsDialog, DsHeading, DsValidationMessage } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';

import classes from './GuardianshipInfoModal.module.css';
import { Link } from 'react-router';

interface GuardianInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export const GuardianshipInfoModal = ({ open, onClose }: GuardianInfoModalProps) => {
  const { t } = useTranslation();

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
          {t('guardianships.modal_info_title')}
        </DsHeading>
        <DsValidationMessage data-color='info'>
          {t('guardianships.modal_info_description')}
        </DsValidationMessage>
        <DsHeading
          data-size='xs'
          level={3}
        >
          {t('guardianships.modal_info_info_1')}
        </DsHeading>
        <DsHeading
          data-size='xs'
          level={3}
        >
          <Trans
            i18nKey='guardianships.modal_info_info_2'
            components={{
              a: (
                <Link
                  to={'#guardianships'}
                  onClick={onClose}
                />
              ),
            }}
          />
        </DsHeading>
      </div>
    </DsDialog>
  );
};
