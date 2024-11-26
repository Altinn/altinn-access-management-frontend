import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import type { ListItemProps } from '@altinn/altinn-components';
import { Avatar, List } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import type { Party } from '@/rtk/features/lookupApi';

import type { SelectedPackageProps } from '../DelegationModalContext';

import classes from './AccessPackageInfo.module.css';

export interface PackageInfoProps {
  accessPackage: SelectedPackageProps;
  toParty: Party;
  onDelegate?: () => void;
}

const services = [
  {
    name: 'RF-0002 - Alminnelig omsetningsoppgave',
    owner: 'Skatteetaten',
    logo: 'https://altinncdn.no/orgs/skd/skd.png',
  },
  {
    name: 'RF-1304 - Klage på vedtak',
    owner: 'Skatteetaten',
    logo: 'https://altinncdn.no/orgs/skd/skd.png',
  },
  {
    name: 'Sykemelding - oppgi nærmeste leder Nav',
    owner: 'Nav',
    logo: 'https://altinncdn.no/orgs/nav/nav.png',
  },
  {
    name: 'Sykemelding - oppgi nærmeste leder Helsedir',
    owner: 'HelseDir',
    logo: 'https://altinncdn.no/orgs/hdir/helsedirektoratet.png',
  },
  {
    name: 'Sykemelding - oppgi nærmeste leder Brønnøysundregistrene',
    owner: 'Brønnøysundregistrene',
    logo: 'https://altinncdn.no/orgs/brg/brreg.png',
  },
  {
    name: 'A-ordningen - Rapportering av ansettelsesforhold',
    owner: 'Skatteetaten',
    logo: 'https://altinncdn.no/orgs/skd/skd.png',
  },
  {
    name: 'Melding om flytting til utlandet',
    owner: 'Skatteetaten',
    logo: 'https://altinncdn.no/orgs/skd/skd.png',
  },
  {
    name: 'Søknad om foreldrepenger',
    owner: 'Nav',
    logo: 'https://altinncdn.no/orgs/nav/nav.png',
  },
  {
    name: 'Søknad om sykepenger',
    owner: 'Nav',
    logo: 'https://altinncdn.no/orgs/nav/nav.png',
  },
  {
    name: 'Søknad om arbeidsavklaringspenger',
    owner: 'Nav',
    logo: 'https://altinncdn.no/orgs/nav/nav.png',
  },
  {
    name: 'Søknad om dagpenger',
    owner: 'Nav',
    logo: 'https://altinncdn.no/orgs/nav/nav.png',
  },
  {
    name: 'Melding om dødsfall',
    owner: 'HelseDir',
    logo: 'https://altinncdn.no/orgs/hdir/helsedirektoratet.png',
  },
  {
    name: 'Søknad om helseattest',
    owner: 'HelseDir',
    logo: 'https://altinncdn.no/orgs/hdir/helsedirektoratet.png',
  },
  {
    name: 'Registrering av ny virksomhet',
    owner: 'Brønnøysundregistrene',
    logo: 'https://altinncdn.no/orgs/brg/brreg.png',
  },
  {
    name: 'Endring av foretaksnavn',
    owner: 'Brønnøysundregistrene',
    logo: 'https://altinncdn.no/orgs/brg/brreg.png',
  },
  {
    name: 'Årsregnskap',
    owner: 'Brønnøysundregistrene',
    logo: 'https://altinncdn.no/orgs/brg/brreg.png',
  },
];

export const AccessPackageInfo = ({ accessPackage, onDelegate }: PackageInfoProps) => {
  const { t } = useTranslation();
  const [showAllServices, setShowAllServices] = React.useState(false);

  const page = useMemo(
    () => [
      ...services.slice(0, showAllServices ? services.length : 5).map((service) => ({
        key: `service-${service.name}`,
        id: `service-${service.name}`,
        title: service.name,
        description: service.owner,
        avatar: {
          imageUrl: service.logo,
          imageAlt: service.owner,
          type: 'company',
          name: service.owner,
        },
        as: 'div' as React.ElementType,
      })),
      {
        key: 'pagination',
        id: 'pagination',
        title: t(showAllServices ? 'common.show_less' : 'common.show_more'),
        description: '',
        onClick: () => setShowAllServices(!showAllServices),
        icon: 'menu-elipsis-horizontal',
        as: 'button' as React.ElementType,
      },
    ],
    [showAllServices],
  );

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Avatar
          imageUrl={accessPackage?.area?.iconUrl ?? undefined}
          name={accessPackage?.name}
          type='company'
          size='lg'
        />
        <Heading
          size='md'
          level={1}
        >
          {accessPackage?.name}
        </Heading>
      </div>
      <Paragraph variant='long'>{accessPackage?.description}</Paragraph>

      <Heading
        size='sm'
        level={2}
      >
        {t('delegation_modal.package_services', {
          count: services.length,
          name: accessPackage?.name,
        })}
      </Heading>
      <div className={classes.service_list}>
        <List
          size='xs'
          items={page as ListItemProps[]}
          spacing='none'
        />
      </div>
      <div className={classes.actions}>
        <Button onClick={onDelegate}>{t('common.give_poa')}</Button>
        <Button onClick={onDelegate}>{t('common.give_poa')}</Button>
      </div>
    </div>
  );
};
