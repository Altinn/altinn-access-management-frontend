import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import { useTranslation } from 'react-i18next';

export const useFooter = () => {
  const { t, i18n } = useTranslation();
  const infoPortalUrl = getAltinnStartPageUrl(i18n.language);
  const langSpecificUrls = getLangSpecificUrls(i18n.language, infoPortalUrl);

  const footerLinks = [
    { href: langSpecificUrls.help, resourceId: 'footer.help' },
    {
      href: langSpecificUrls.about,
      resourceId: 'footer.about_altinn',
    },
    { href: langSpecificUrls.serviceAnnouncements, resourceId: 'footer.service_announcement' },
    { href: langSpecificUrls.privacy, resourceId: 'footer.privacy_policy' },
    { href: langSpecificUrls.accessibility, resourceId: 'footer.accessibility' },
  ];

  const footer = {
    address: t('common.digdir') + ',',
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

const getLangSpecificUrls = (languageCode: string, baseUrl: string) => {
  switch (languageCode) {
    case 'en':
      return {
        help: baseUrl + 'help/',
        about: baseUrl + 'about-altinn/',
        serviceAnnouncements: baseUrl + 'about-altinn/service-announcements/',
        privacy: baseUrl + 'about-altinn/privacy/',
        accessibility: baseUrl + 'about-altinn/tilgjengelighet/',
      };
    case 'no_nn':
      return {
        help: baseUrl + 'hjelp/',
        about: baseUrl + 'om-altinn/',
        serviceAnnouncements: baseUrl + 'om-altinn/driftsmeldingar/',
        privacy: baseUrl + 'om-altinn/personvern/',
        accessibility: baseUrl + 'om-altinn/tilgjengelighet/',
      };
    case 'no':
    default:
      return {
        help: baseUrl + 'hjelp/',
        about: baseUrl + 'om-altinn/',
        serviceAnnouncements: baseUrl + 'om-altinn/driftsmeldinger/',
        privacy: baseUrl + 'om-altinn/personvern/',
        accessibility: baseUrl + 'om-altinn/tilgjengelighet/',
      };
  }
};
