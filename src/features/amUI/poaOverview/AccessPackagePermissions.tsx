import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { Link } from 'react-router';
import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';
import { DsLink, DsParagraph, DsPopover } from '@altinn/altinn-components';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';
import classes from './AccessPackagePermissions.module.css';

export const AccessPackagePermissions = () => {
  const { t, i18n } = useTranslation();

  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  return (
    <>
      <DsParagraph className={classes.description}>
        {t('poa_overview_page.packages_tab.description')}
        <span>
          <DsPopover.TriggerContext>
            <DsPopover.Trigger
              icon
              variant='tertiary'
              data-size={'xs'}
            >
              <QuestionmarkCircleIcon
                aria-label={t('poa_overview_page.packages_tab.info_box_icon_label')}
              />
            </DsPopover.Trigger>
            <DsPopover className={classes.popover}>
              <div className={classes.infoBox}>
                <DsParagraph>{t('poa_overview_page.packages_tab.info_box_p1')}</DsParagraph>
                <DsLink
                  href={getHelpPagesUrl(i18n.language)}
                  target='_blank'
                >
                  {t('poa_overview_page.packages_tab.info_box_link')}
                </DsLink>
              </div>
            </DsPopover>
          </DsPopover.TriggerContext>
        </span>
      </DsParagraph>
      <DebouncedSearchField
        placeholder={t('access_packages.search_label')}
        setDebouncedSearchString={setDebouncedSearchString}
      />
      <AccessPackageList
        searchString={debouncedSearchString}
        minimizeAvailablePackages={false}
        showAvailableToggle={false}
        showPermissions
        showAllPackages
        showAllAreas
        showPackagesCount={false}
        packageAs={(props) => (
          <Link
            to={`/poa-overview/access-package/${props.packageId}?tab=packages`}
            {...props}
          />
        )}
        noPackagesText={t('access_packages.no_packages')}
      />
    </>
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
