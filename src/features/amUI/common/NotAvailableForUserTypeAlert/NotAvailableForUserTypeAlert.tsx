import { DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import classes from './NotAvailableForUserTypeAlert.module.css';
import { getHostUrl } from '@/resources/utils/pathUtils';

export const NotAvailableForUserTypeAlert = () => {
  const { t } = useTranslation();
  return (
    <div className={classes.notAvailableContainer}>
      <DsHeading
        level={1}
        data-size='sm'
      >
        {t('page_not_available.title')}
      </DsHeading>
      <DsParagraph>{t('page_not_available.text')}</DsParagraph>
      <DsLink href={`${getHostUrl()}ui/profile`}>{t('page_not_available.link_text')}</DsLink>
    </div>
  );
};
