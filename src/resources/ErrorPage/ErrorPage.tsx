import { useRouteError, useNavigate } from 'react-router-dom';
import { Page, PageContent, PageHeader } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/reusables/PageContainer';

import { ReactComponent as MaakeIcon } from '../../assets/Maake.svg';

import classes from './ErrorPage.module.css';

export const ErrorPage = () => {
  // error Docs: https://reactrouter.com/en/main/hooks/use-route-error
  // const error = useRouteError(); // fixme: error har ikke Type ennå
  // FixMe: Hook broken: "history.ts:480 Uncaught Error:
  // useRouteError must be used within a data router.
  // See https://reactrouter.com/routers/picking-a-router."

  const { t } = useTranslation('common'); // "t" is the (ugly) convention of "translate"

  return (
    <PageContainer>
      <Page>
        <PageContent>
          <div className={classes.errorPageWrapper}>
            <table>
              <tbody>
                <tr>
                  <td className={classes.tabellKolonne1}>
                    <p className={classes.errorParagraph}>
                      {t('api_delegation.error_page404_type')}
                    </p>

                    <h1>{t('api_delegation.error_page404_header')}</h1>

                    <p>{t('api_delegation.error_page404_upper_text')}</p>

                    <p>
                      <a href='https://www.altinn.no/ui/MessageBox'>
                        {t('api_delegation.error_page404_link1_messages')}
                      </a>
                    </p>

                    <p>
                      <a href='https://www.altinn.no/ui/Profile'>
                        {t('api_delegation.error_page404_link2_profile')}
                      </a>
                    </p>

                    <p>
                      <a href='https://www.altinn.no/skjemaoversikt/'>
                        {t('api_delegation.error_page404_link3_forms')}
                      </a>
                    </p>

                    <p>{t('api_delegation.error_page404_lower_text')}</p>
                  </td>

                  <td className={classes.tabellKolonne2}>
                    <MaakeIcon />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
