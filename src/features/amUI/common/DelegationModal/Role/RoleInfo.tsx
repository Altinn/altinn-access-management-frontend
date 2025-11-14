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
  onDelegate?: () => void;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  console.log('role: ', role);
  const { t } = useTranslation();

  const isExternalRole = role?.provider?.code === 'sys-ccr';
  const isLegacyRole = role?.provider?.code === 'sys-altinn2';
  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  console.log('actingParty: ', actingParty);
  console.log('fromParty: ', fromParty);
  console.log('toParty: ', toParty);

  const shouldSkipRoleRefs = !role?.code || !fromParty?.variant;
  const { data: rolePackages, isLoading: rolePackagesIsLoading } = useGetRolePackagesQuery(
    { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
    { skip: shouldSkipRoleRefs },
  );
  console.log('rolePackages: ', rolePackages);
  const { data: roleResources, isLoading: roleResourcesIsLoading } = useGetRoleResourcesQuery(
    { roleCode: role.code ?? '', variant: fromParty?.variant || '' },
    { skip: shouldSkipRoleRefs },
  );
  console.log('roleResources: ', roleResources);

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
