import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { DsHeading, DsParagraph, DsLink } from '@altinn/altinn-components';

import classes from '../ErrorPage.module.css';

import SeagullIcon from '@/assets/Seagull.svg?react';

export const UnknownError = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.errorContent}>
      <DsHeading
        data-size='lg'
        className={classes.header}
      >
        {t('error_page.unknown_error_header')}
      </DsHeading>
      <div className={classes.flexContainer}>
        <div className={classes.leftContainer}>
          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            {t('error_page.unknown_error_description')}
          </DsParagraph>

          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            {t('error_page.if_persistent_contact_service')}
          </DsParagraph>

          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            <DsLink href='https://www.altinn.no/help'>{t('error_page.go_to_help')}</DsLink>
          </DsParagraph>
        </div>
        <div className={classes.rightContainer}>
          <SeagullIcon />
        </div>
      </div>
    </div>
  );
};
