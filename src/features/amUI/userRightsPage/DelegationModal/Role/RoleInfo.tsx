import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { Button, Header, Icon, PageHeader } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useSnackbar } from '@/features/amUI/common/Snackbar';
import { useDelegateMutation, type Role } from '@/rtk/features/roleApi';
import { SnackbarDuration } from '@/features/amUI/common/Snackbar/SnackbarProvider';

import classes from './RoleInfo.module.css';

export interface PackageInfoProps {
  role: Role;
  toParty: Party;
  onDelegate?: () => void;
}

export const RoleInfo = ({ role, toParty, onDelegate }: PackageInfoProps) => {
  console.log('🚀 ~ RoleInfo ~ role:', role);
  const { t } = useTranslation();

  const [delegateRole, { isLoading }] = useDelegateMutation();
  const { openSnackbar } = useSnackbar();

  //   const { data: activeDelegations, isFetching } = useGetRightHolderDelegationsQuery(
  //     toParty.partyUuid,
  //   );

  //   const userHasPackage = React.useMemo(() => {
  //     if (activeDelegations && !isFetching) {
  //       return Object.values(activeDelegations)
  //         .flat()
  //         .some((delegation) => delegation.accessPackageId === accessPackage.id);
  //     }
  //     return false;
  //   }, [activeDelegations, isFetching, accessPackage.id]);

  const handleDelegate = async () => {
    try {
      delegateRole({ to: toParty.partyUuid, roleId: role.id });
      openSnackbar({
        message: t('access_packages.package_delegation_success', {
          name: toParty.name,
          accessPackage: role.name,
        }),
      });
      if (onDelegate) {
        onDelegate();
      }
    } catch (e) {
      console.log(e);
      openSnackbar({
        message: t('access_packages.package_delegation_error', {
          name: toParty.name,
          accessPackage: role.name,
        }),
        duration: SnackbarDuration.infinite,
      });
    }
  };

  return (
    <div className={classes.container}>
      <PageHeader
        title={role?.name}
        icon='package'
      />
      <Paragraph>{role?.description}</Paragraph>

      <div className={classes.actions}>
        <Button
          onClick={handleDelegate}
          disabled={isLoading}
        >
          {t('common.give_poa')}
        </Button>
      </div>
    </div>
  );
};
