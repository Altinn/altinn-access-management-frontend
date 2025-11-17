import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import { Role, useGetRoleConnectionsQuery, useGetRoleResourcesQuery } from '@/rtk/features/roleApi';
import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { DsHeading, DsLink, DsParagraph, DsSearch } from '@altinn/altinn-components';
import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  ExternalLinkIcon,
} from '@navikt/aksel-icons';
import statusClasses from '../StatusSection.module.css';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useFetchRecipientInfo } from '@/resources/hooks/useFetchRecipientInfo';
import { getRedirectToServicesAvailableForUserUrl } from '@/resources/utils';
import { getHostUrl } from '@/resources/utils/pathUtils';
import { Link } from 'react-router';
import { useResourceList } from '../AccessPackages/useResourceList';
import { List } from '../../List';
import { isInherited } from '../../AccessPackageList/useAreaPackageList';

export interface PackageInfoProps {
  role: Role;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';

  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const shouldSkipRoleRefs = !role?.code || !fromParty?.variant;
  const { data: roleResources, isLoading: roleResourcesIsLoading } = useGetRoleResourcesQuery(
    { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
    { skip: shouldSkipRoleRefs },
  );
  const { data: roleConnections } = useGetRoleConnectionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    { skip: !actingParty?.partyUuid },
  );
  const { userID, partyID } = useFetchRecipientInfo(toParty?.partyUuid ?? '', null);
  const oldSolutionUrl =
    userID && partyID
      ? getRedirectToServicesAvailableForUserUrl(userID, partyID)
      : `${getHostUrl()}ui/profile/`;

  const { hasInheritedRole, inheritedRoleOrgName } = useMemo(() => {
    if (!roleConnections || !role?.id) {
      return { hasInheritedRole: false, inheritedRoleOrgName: undefined as string | undefined };
    }
    const matchingConnection = roleConnections.find((connection) => connection.role.id === role.id);
    if (!matchingConnection) {
      return { hasInheritedRole: false, inheritedRoleOrgName: undefined };
    }
    const inheritedPermission = matchingConnection.permissions.find((permission) =>
      isInherited(permission, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? ''),
    );
    if (!inheritedPermission) {
      return { hasInheritedRole: false, inheritedRoleOrgName: undefined };
    }
    const inheritedFromOrg =
      inheritedPermission.via?.name ?? inheritedPermission.from.name ?? fromParty?.name;

    return {
      hasInheritedRole: true,
      inheritedRoleOrgName: inheritedFromOrg,
    };
  }, [roleConnections, role?.id, toParty?.partyUuid, fromParty?.partyUuid, fromParty?.name]);

  const roleResourceList = useMemo<PackageResource[]>(() => {
    if (!roleResources) {
      return [];
    }

    return roleResources.map((resource) => {
      const provider = resource.provider;
      return {
        id: resource.id,
        name: resource.name,
        title: resource.name,
        description: resource.description ?? '',
        provider: {
          id: provider?.id ?? resource.providerId,
          name: provider?.name ?? '',
          refId: provider?.refId ?? resource.refId ?? '',
          logoUrl: provider?.logoUrl ?? '',
          code: provider?.code ?? '',
          typeId: provider?.typeId ?? resource.typeId ?? '',
        },
        resourceOwnerName: provider?.name ?? '',
        resourceOwnerLogoUrl: provider?.logoUrl ?? '',
        resourceOwnerOrgcode: provider?.code ?? '',
        resourceOwnerOrgNumber: provider?.refId ?? '',
        resourceOwnerType: provider?.type?.name ?? resource.type?.name ?? '',
      };
    });
  }, [roleResources]);

  const filteredRoleResources = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return roleResourceList;
    }

    return roleResourceList.filter((resource) => {
      const resourceName = (resource.name || resource.title || '').toLowerCase();
      const providerName = (resource.provider?.name || '').toLowerCase();

      return resourceName.includes(normalizedSearch) || providerName.includes(normalizedSearch);
    });
  }, [roleResourceList, searchValue]);

  const resources = useResourceList(filteredRoleResources);

  const searchLabel = t('role.resources_search_placeholder', {
    defaultValue: String(t('common.search')),
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <DsHeading
          level={2}
          data-size='sm'
        >
          {role?.name}
        </DsHeading>
      </div>

      {isLegacyRole && (
        <div className={statusClasses.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={statusClasses.warningIcon}
          />
          <DsParagraph data-size='xs'>{t('a2Alerts.legacyRoleContent')}</DsParagraph>
        </div>
      )}
      {isExternalRole && (
        <div className={statusClasses.infoLine}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={statusClasses.inheritedInfoIcon}
          />
          <DsParagraph data-size='xs'>
            {t('role.provider_status')}
            {role?.provider?.name}
          </DsParagraph>
        </div>
      )}
      {hasInheritedRole && (
        <div className={statusClasses.infoLine}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={statusClasses.inheritedInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.inherited_role_org_message'
              values={{
                user_name: toParty?.name,
                org_name: inheritedRoleOrgName ?? fromParty?.name,
              }}
            />
          </DsParagraph>
        </div>
      )}
      <DsParagraph>{role?.description}</DsParagraph>
      <DsParagraph className={classes.oldRolesDisclaimer}>
        {t('role.resources_disclaimer')}{' '}
        <DsLink asChild>
          <Link to={oldSolutionUrl}>
            {t('role.resources_disclaimer_link')}
            <ExternalLinkIcon aria-hidden />
          </Link>
        </DsLink>
      </DsParagraph>
      <DsHeading
        level={3}
        data-size='xs'
      >
        {t('role.resources_title', {
          count: filteredRoleResources.length,
        })}
      </DsHeading>
      {!shouldSkipRoleRefs && (
        <div className={classes.resourcesSection}>
          <DsSearch className={classes.searchBar}>
            <DsSearch.Input
              aria-label={searchLabel}
              placeholder={searchLabel}
              onChange={handleSearchChange}
            />
            <DsSearch.Clear
              onClick={() => {
                setSearchValue('');
              }}
            />
          </DsSearch>
          <div className={classes.service_list}>
            <div className={classes.services}>
              <List>{resources}</List>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
