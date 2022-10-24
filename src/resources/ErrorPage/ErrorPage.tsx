import { useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ErrorPage = () => {
  // use when completing this page
  const error = useRouteError();

  return (
    <div>
      <h1>Det skjedde en feil</h1>
      <p>
        <i>Vennligst gå tilbake i nettleseren eller refresh siden</i>
      </p>
    </div>
  );
};
