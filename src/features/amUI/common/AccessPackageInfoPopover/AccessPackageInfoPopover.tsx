import { useTranslation } from 'react-i18next';
import { DsLink, DsParagraph } from '@altinn/altinn-components';
import { HelpText } from '../HelpText/HelpText';
import classes from './AccessPackageInfoPopover.module.css';

export const AccessPackageInfoPopover = () => {
  const { t, i18n } = useTranslation();

  return (
    <span>
      <HelpText
        aria-label={t('poa_overview_page.packages_tab.info_box_icon_label')}
        className={classes.popover}
      >
        <div className={classes.infoBox}>
          <DsParagraph>{t('poa_overview_page.packages_tab.info_box_p1')}</DsParagraph>
          <DsLink
            href={getHelpPagesUrl(i18n.language)}
            target='_blank'
          >
            {t('poa_overview_page.packages_tab.info_box_link')}
          </DsLink>
        </div>
      </HelpText>
    </span>
  );
};

const getHelpPagesUrl = (languageKey: string) => {
  switch (languageKey) {
    case 'en':
      return `https://info.altinn.no/en/news/altinn-rollene-erstattes-av-tilgangspakker--slik-handterer-du-overgangen/`;
    case 'no_nn':
      return `https://info.altinn.no/nn/nyheiter/altinn-rollene-blir-erstatta-av-tilgangspakker--sann-handterer-du-overgangen/`;
    default:
      return `https://info.altinn.no/nyheter/altinn-rollene-erstattes-av-tilgangspakker--slik-handterer-du-overgangen/`;
  }
};
