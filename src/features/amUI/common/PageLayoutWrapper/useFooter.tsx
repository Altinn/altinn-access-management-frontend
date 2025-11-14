import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import { useTranslation } from 'react-i18next';

const infoPortalUrl = getAltinnStartPageUrl();

const footerLinks = [
  { href: infoPortalUrl + 'hjelp/', resourceId: 'footer.help' },
  {
    href: infoPortalUrl + 'om-altinn/',
    resourceId: 'footer.about_altinn',
  },
  { href: infoPortalUrl + 'om-altinn/personvern/', resourceId: 'footer.privacy_policy' },
  { href: infoPortalUrl + 'om-altinn/tilgjengelighet/', resourceId: 'footer.accessibility' },
];

export const useFooter = () => {
  const { t } = useTranslation();

  const footer = {
    address: t('common.digdir'),
    address2: t('footer.digdir_address'),
    menu: {
      items: footerLinks.map((link) => ({
        href: link.href,
        id: link.resourceId,
        title: t(link.resourceId),
      })),
    },
  };

  return footer;
};
