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

export const ErrorPage = () => {
  // use when completing this page
  const error = useRouteError(); // NB error har ikke Type ennå

  // import api_delegation.error_page_header from no_nb.json
  const { t } = useTranslation('common');

  return (
    <div>
      <Page>
        <PageHeader icon={<ApiIcon />}> {t('api_delegation.error_page_header')} </PageHeader>
        <PageContent>
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
        </PageContent>
      </Page>
    </div>
  );
};
