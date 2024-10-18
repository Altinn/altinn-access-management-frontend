import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { Paragraph, Heading, Link } from '@digdir/designsystemet-react';

import SeagullIcon from '@/assets/Seagull.svg?react';

import classes from '../ErrorPage.module.css';

export const UnknownError = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Heading
        size='xl'
        className={classes.header}
      >
        {t('error_page.unknown_error_header')}
      </Heading>
      <div className={classes.flexContainer}>
        <div className={classes.leftContainer}>
          <Paragraph
            size='lg'
            variant='long'
            className={classes.contentText}
          >
            {t('error_page.unknown_error_description')}
          </Paragraph>

          <Paragraph
            size='lg'
            variant='long'
            className={classes.contentText}
          >
            {t('error_page.if_persistent_contact_service')}
          </Paragraph>

          <Paragraph
            size='lg'
            variant='long'
            className={classes.contentText}
          >
            <Link href='https://www.altinn.no/help'>{t('error_page.go_to_help')}</Link>
          </Paragraph>
        </div>
        <div className={classes.rightContainer}>
          <SeagullIcon />
        </div>
      </div>
    </div>
  );
};
