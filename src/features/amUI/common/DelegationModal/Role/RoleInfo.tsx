import { useTranslation } from 'react-i18next';
import classes from './RoleInfo.module.css';
import { Role, useGetRoleByIdQuery } from '@/rtk/features/roleApi';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { InformationSquareFillIcon } from '@navikt/aksel-icons';
import statusClasses from '../StatusSection.module.css';

export interface PackageInfoProps {
  role: Role;
  onDelegate?: () => void;
}

export const RoleInfo = ({ role }: PackageInfoProps) => {
  const { t } = useTranslation();

  const { data: roleData, isLoading: roleDataIsLoading } = useGetRoleByIdQuery(role.id);
  const isExternalRole = roleData?.provider?.code === 'sys-ccr';

  // These queries are currently not available from the backend API, but should be implemented in the future.
  // const { data: rolePackages, isLoading: rolePackagesIsLoading } = useGetRolePackagesQuery(role.id);
  // const { data: roleResources, isLoading: roleResourcesIsLoading } = useGetRoleResourcesQuery(role.id);

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
      {isExternalRole && (
        <div className={statusClasses.infoLine}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={statusClasses.inheritedInfoIcon}
          />
          <DsParagraph data-size='xs'>
            {t('role.provider_status')}
            {roleData?.provider?.name}
          </DsParagraph>
        </div>
      )}
      <DsParagraph>{role?.description}</DsParagraph>
    </div>
  );
};
