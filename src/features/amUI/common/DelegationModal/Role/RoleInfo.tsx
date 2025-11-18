import { useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import {
  Role,
  useGetRoleByIdQuery,
  useGetRolePackagesQuery,
  useGetRoleResourcesQuery,
} from '@/rtk/features/roleApi';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { ExclamationmarkTriangleFillIcon, InformationSquareFillIcon } from '@navikt/aksel-icons';
import statusClasses from '../StatusSection.module.css';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

export interface PackageInfoProps {
  role: Role;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  const { t } = useTranslation();

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';

  // TODO: this is logic for fetching services and packages related to the role. This will be implemented in the next PR.
  // const { fromParty, toParty, actingParty } = usePartyRepresentation();
  // const shouldSkipRoleRefs = !role?.code || !fromParty?.variant;
  // const { data: rolePackages, isLoading: rolePackagesIsLoading } = useGetRolePackagesQuery(
  //   { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
  //   { skip: shouldSkipRoleRefs },
  // );
  // const { data: roleResources, isLoading: roleResourcesIsLoading } = useGetRoleResourcesQuery(
  //   { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
  //   { skip: shouldSkipRoleRefs },
  // );

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <DsHeading
          level={3}
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
      <DsParagraph>{role?.description}</DsParagraph>
    </div>
  );
};
