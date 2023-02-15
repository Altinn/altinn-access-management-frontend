import { useTranslation } from 'react-i18next';
import { Page, PageContent } from '@altinn/altinn-design-system';
import { useRouteError } from 'react-router-dom';
import * as React from 'react';

import { PageContainer } from '@/components/reusables/PageContainer';
import { ReactComponent as MaakeIcon } from '@/assets/Maake.svg';

import classes from './NotFoundSite.module.css';

export const NotFoundSite = () => {
  const error = useRouteError(); // fixme: error har ikke Type ennå

  const { t } = useTranslation('common'); // "t" is the (ugly) convention of "translate"

  console.log(error);

  return (
    <PageContainer>
      <Page>
        <PageContent>
          <div className={classes.errorPageWrapper}>
            <div>
              <div className={classes.tabellKolonne1}>
                <p className={classes.errorParagraph}>{t('not_found_site_type')}</p>

                <h1>{t('not_found_site_header')}</h1>

                <p>{t('not_found_site_upper_text')}</p>

                <p>
                  <a href='https://www.altinn.no/ui/MessageBox'>
                    {t('api_delegation.go_to_inbox')}
                  </a>
                </p>

                <p>
                  <a href='https://www.altinn.no/ui/Profile'>{t('api_delegation.go_to_profile')}</a>
                </p>

                <p>
                  <a href='https://www.altinn.no/skjemaoversikt/'>
                    {t('api_delegation.find_and_submit_scheme')}
                  </a>
                </p>

                <p>{t('not_found_site_lower_text')}</p>
              </div>

              <td className={classes.tabellKolonne2}>
                <MaakeIcon />
              </td>
            </div>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
