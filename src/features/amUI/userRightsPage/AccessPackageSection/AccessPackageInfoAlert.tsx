import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';

export const AccessPackageInfoAlert = () => {
  const { i18n } = useTranslation();

  // Resolve locale-specific link target
  const lang = i18n.resolvedLanguage || i18n.language;
  const linkMap: Record<string, string> = {
    en: 'https://info.altinn.no/en/help/profile/access-packages/',
    no_nb: 'https://info.altinn.no/hjelp/profil/tilgangspakker/',
    no_nn: 'https://info.altinn.no/nn/hjelp/profil/tilgangspakker/',
  };
  const href = linkMap[lang] ?? linkMap.no_nb;

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
                href={href}
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
