import { DsAlert, DsParagraph } from '@altinn/altinn-components';

export const AccessPackageInfoAlert = () => {
  return (
    <DsAlert
      data-color='info'
      data-size='sm'
    >
      <DsParagraph>
        Tilgangspakker vil etterhvert erstatte roller i Altinns tilgangstyring. De vil snart bli
        fylt opp med tjenester.
      </DsParagraph>
    </DsAlert>
  );
};
