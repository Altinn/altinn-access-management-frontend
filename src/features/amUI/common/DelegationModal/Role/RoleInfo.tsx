import { Trans, useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import { Role, useGetRolePermissionsQuery, useGetRoleResourcesQuery } from '@/rtk/features/roleApi';
import { DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';
import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  ExternalLinkIcon,
} from '@navikt/aksel-icons';
import statusClasses from '../StatusSection.module.css';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';
import { Link } from 'react-router';
import { useInheritedRoleInfo } from './useInheritedRoleInfo';
import { RoleResourcesSection } from './RoleResourcesSection';

export interface PackageInfoProps {
  role: Role;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  const { t } = useTranslation();

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';

  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const shouldSkipRoleRefs = !role?.code || !fromParty?.variant;
  const { data: roleResources } = useGetRoleResourcesQuery(
    { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
    { skip: shouldSkipRoleRefs },
  );
  const { data: rolePermissions } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    { skip: !actingParty?.partyUuid },
  );

  const sectionId = fromParty?.partyUuid === actingParty?.partyUuid ? 9 : 8;
  const oldSolutionUrl = getRedirectToA2UsersListSectionUrl(sectionId);

  const { hasInheritedRole, inheritedRoleOrgName } = useInheritedRoleInfo({
    rolePermissions,
    role,
    toParty,
    fromParty,
  });

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
              i18nKey='role.inherited_role_org_message'
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
      {!shouldSkipRoleRefs && <RoleResourcesSection roleResources={roleResources} />}
    </div>
  );
};
