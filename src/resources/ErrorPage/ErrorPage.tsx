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

export const ErrorPage = () => {
  // use when completing this page
  const error = useRouteError(); // NB error har ikke Type ennå

  return (
    <div>
      <Page>
        <PageHeader>Det skjedde en feil</PageHeader>
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
