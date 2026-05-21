import { DsDetails, DsLink, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import classes from './LandingPage.module.css';

interface LandingPageInfoCardProps {
  isLoading: boolean;
  isOrganization: boolean;
}

export const LandingPageInfoCard = ({ isLoading, isOrganization }: LandingPageInfoCardProps) => {
  const { t } = useTranslation();

  return (
    <div
      className='ds-card'
      data-color='info'
      data-variant='tinted'
    >
      {isLoading ? (
        <DsSkeleton
          variant='rectangle'
          height={150}
          width='100%'
        />
      ) : (
        <DsDetails>
          <DsDetails.Summary className={classes.landingPageAlertSummary}>
            {isOrganization
              ? t('landing_page.alert_heading')
              : t('landing_page.alert_heading_priv')}
          </DsDetails.Summary>
          <DsDetails.Content>
            <div className={classes.landingPageAlert}>
              <DsParagraph data-size='sm'>{t('landing_page.alert_body')}</DsParagraph>
              <DsParagraph data-size='sm'>{t('landing_page.alert_body_p2')}</DsParagraph>
              <DsParagraph data-size='sm'>{t('landing_page.alert_body_p3')}</DsParagraph>
              <DsLink
                href='https://info.altinn.no/hjelp/ny-tilgangsstyring/steg-for-steg-guider/'
                target='_blank'
                rel='noreferrer'
                data-size='sm'
              >
                {t('landing_page.alert_link')}
              </DsLink>
            </div>
          </DsDetails.Content>
        </DsDetails>
      )}
    </div>
  );
};
