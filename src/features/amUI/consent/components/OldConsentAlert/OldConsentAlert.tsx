import { getHostUrl } from '@/resources/utils/pathUtils';
import { DsAlert, DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import classes from './OldConsentAlert.module.css';

interface OldConsentAlertProps {
  heading: string;
  text: string;
}

export const OldConsentAlert = ({ heading, text }: OldConsentAlertProps) => {
  const { t } = useTranslation();

  return (
    <DsAlert className={classes.consentAlert}>
      <DsHeading
        data-size='xs'
        level={2}
      >
        {heading}
      </DsHeading>
      <DsParagraph>
        {text}{' '}
        <DsLink href={`${getHostUrl()}ui/profile/`}>
          {t('active_consents.altinn2_consent_alert_link')}
        </DsLink>
      </DsParagraph>
    </DsAlert>
  );
};
