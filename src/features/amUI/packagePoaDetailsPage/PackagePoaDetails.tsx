import { useState } from 'react';
import classes from './PackagePoaDetailsPage.module.css';
import {
  DsHeading,
  DsParagraph,
  DsTabs,
  List,
  ResourceListItem,
  Skeleton,
  UserListItem,
} from '@altinn/altinn-components';
import { useParams } from 'react-router';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { useTranslation } from 'react-i18next';
import {
  getRoleCodesForKeyRoleCodes,
  getRoleCodesForKeyRoles,
} from '../common/UserRoles/roleUtils';

export const PackagePoaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();
  const { data: accessPackage, isLoading } = useGetPackagePermissionDetailsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      packageId: id || '',
    },
    { skip: !id },
  );
  const [chosenTab, setChosenTab] = useState('users');
  return (
    <div>
      <Skeleton loading={isLoading}>
        <DsHeading
          level={1}
          data-size='lg'
        >
          {t('package_poa_details_page.heading', { package: accessPackage?.name || '' })}
        </DsHeading>
        <DsParagraph variant='long'>{accessPackage?.description}</DsParagraph>
      </Skeleton>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={chosenTab}
        onChange={setChosenTab}
      >
        <DsTabs.List>
          <DsTabs.Tab value='users'>{t('package_poa_details_page.users_tab_title')}</DsTabs.Tab>
          <DsTabs.Tab value='services'>
            {t('package_poa_details_page.services_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel
          className={classes.tabContent}
          value='users'
        >
          <List>
            {accessPackage?.permissions?.map((permission) => (
              <UserListItem
                key={permission.to.id}
                name={permission.to.name}
                type={permission.to.type === 'Organisasjon' ? 'company' : 'person'}
                roleNames={getRoleCodesForKeyRoleCodes(permission.roleCodes).map((r) => t(`${r}`))}
                titleAs={'h3'}
                loading={isLoading}
                id={permission.to.id}
              />
            ))}
          </List>
        </DsTabs.Panel>
        <DsTabs.Panel
          className={classes.tabContent}
          value='services'
        >
          <List>
            {accessPackage?.resources.map((resource) => (
              <ResourceListItem
                key={resource.id}
                id={resource.id}
                as='button'
                titleAs='h3'
                size='md'
                ownerLogoUrl={resource.resourceOwnerLogoUrl}
                ownerLogoUrlAlt={resource.resourceOwnerName ?? ''}
                ownerName={resource.resourceOwnerName ?? ''}
                resourceName={resource.title ?? ''}
              />
            ))}
          </List>
        </DsTabs.Panel>
      </DsTabs>
    </div>
  );
};
