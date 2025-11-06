import { useTranslation } from 'react-i18next';

const footerLinks = [
  { href: 'https://info.altinn.no/om-altinn/', resourceId: 'footer.about_altinn' },
  {
    href: 'https://info.altinn.no/om-altinn/driftsmeldinger/',
    resourceId: 'footer.service_messages',
  },
  { href: 'https://info.altinn.no/om-altinn/personvern/', resourceId: 'footer.privacy_policy' },
  { href: 'https://info.altinn.no/om-altinn/tilgjengelighet/', resourceId: 'footer.accessibility' },
];

export const useFooter = () => {
  const { t } = useTranslation();

  const footer = {
    address: 'Postboks 1382 Vika, 0114 Oslo.',
    address2: 'Org.nr. 991 825 827',
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
