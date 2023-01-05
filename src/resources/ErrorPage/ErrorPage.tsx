import { useRouteError } from 'react-router-dom';
import {
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Select,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
} from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ApiIcon } from '../../assets/Cancel.svg';

import classes from './ErrorPage.module.css'; // fixme: trim superflous css in file

export const ErrorPage = () => {
  // use when completing this page
  const error = useRouteError(); // NB error har ikke Type ennå
  const { t } = useTranslation('common');

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon />}> {t('api_delegation.error_page_header')} </PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <p>
                <i>Vennligst gå tilbake i nettleseren eller refresh siden</i>
                <br />
                <br />
                Error status : {error.status}
                <br />
                Error statusText : {error.statusText}
                <br />
                Error data : {error.data}
              </p>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};
