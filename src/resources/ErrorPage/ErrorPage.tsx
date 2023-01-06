import { useRouteError, useNavigate } from 'react-router-dom';
import { Page, PageContent, PageHeader } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ApiIcon } from '../../assets/Cancel.svg';

import classes from './ErrorPage.module.css'; // fixme: trim superflous css in file

export const ErrorPage = () => {
  // error Docs: https://reactrouter.com/en/main/hooks/use-route-error
  const error = useRouteError(); // fixme: error har ikke Type ennå
  const { t } = useTranslation('common'); // "t" is the (ugly) convention of "translate"
  const navigate = useNavigate(); // use upper left icon as HOME button

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon onClick={() => navigate('/api-delegations')} />}>
            {t('api_delegation.error_page_header')}
          </PageHeader>
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
