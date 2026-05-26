import { FloatingDropdown } from '@altinn/altinn-components';
import { ExternalLinkIcon, LeaveIcon, QuestionmarkIcon } from '@navikt/aksel-icons';

import { getAltinnStartPageUrl, getHostUrl } from '@/resources/utils/pathUtils';
import { hideA2Links } from '@/resources/utils/featureFlagUtils';
import { useTranslation } from 'react-i18next';

export const InfoModal = () => {
  const { t, i18n } = useTranslation();

  if (hideA2Links()) {
    return null;
  }

  const goToOldSolution = () => {
    window.location.assign(`${getHostUrl()}ui/profile`);
  };

  const goToHelpPages = () => {
    const route = i18n.language === 'en' ? 'help' : 'hjelp';
    window.location.assign(`${getAltinnStartPageUrl()}${route}`);
  };

  return (
    <FloatingDropdown
      icon={QuestionmarkIcon}
      iconAltText={t('info_modal.info_button')}
      color='company'
      items={[
        {
          icon: ExternalLinkIcon,
          title: t('info_modal.help_pages'),
          onClick: goToHelpPages,
        },
        {
          icon: LeaveIcon,
          title: t('info_modal.back_button'),
          onClick: goToOldSolution,
        },
      ]}
    />
  );
};
