import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { Trans } from 'react-i18next';

export const AccessPackageInfoAlert = () => {
  return (
    <DsAlert
      data-color='info'
      data-size='sm'
    >
      <DsParagraph>
        <Trans
          i18nKey='access_packages.info_alert_text'
          components={{
            a: (
              <a
                href='https://info.altinn.no/hjelp/profil/tilgangspakker/'
                target='_blank'
                rel='noopener noreferrer'
              />
            ),
          }}
        />
      </DsParagraph>
    </DsAlert>
  );
};
