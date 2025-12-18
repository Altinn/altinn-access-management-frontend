import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { DsHeading, DsParagraph, DsLink } from '@altinn/altinn-components';

import classes from '../ErrorPage.module.css';
import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';

export const UnknownError = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.errorContent}>
      <DsHeading
        className={classes.header}
        level={1}
        data-size='sm'
      >
        {t('error_page.unknown_error_header')}
      </DsHeading>
      <DsParagraph>{t('error_page.unknown_error_description')}</DsParagraph>

      <DsParagraph>{t('error_page.if_persistent_contact_service')}</DsParagraph>

      <DsParagraph>
        <DsLink href={getAltinnStartPageUrl() + 'hjelp'}>{t('error_page.go_to_help')}</DsLink>
      </DsParagraph>
    </div>
  );
};
