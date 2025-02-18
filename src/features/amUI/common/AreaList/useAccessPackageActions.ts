import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

interface useAccessPackageActionsProps {
  toUuid: string;
  onDelegateSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onDelegateError?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, toParty: Party) => void;
}

export const useAccessPackageActions = ({
  toUuid,
  onDelegateSuccess,
  onDelegateError,
  onRevokeSuccess,
  onRevokeError,
}: useAccessPackageActionsProps) => {
  const delegatePackage = useDelegateAccessPackage();
  const revokePackage = useRevokeAccessPackage();

  const { data: toParty } = useGetPartyByUUIDQuery(toUuid ?? '');

  const onDelegate = async (accessPackage: AccessPackage) => {
    if (!toParty) {
      return;
    }
    delegatePackage(
      toParty,
      accessPackage,
      () => {
        onDelegateSuccess?.(accessPackage, toParty);
      },
      () => {
        onDelegateError?.(accessPackage, toParty);
      },
    );
  };

  const onRevoke = async (accessPackage: AccessPackage) => {
    if (!toParty) {
      return;
    }
    revokePackage(
      toParty,
      accessPackage,
      () => {
        onRevokeSuccess?.(accessPackage, toParty);
      },
      () => {
        onRevokeError?.(accessPackage, toParty);
      },
    );
  };
  return { onDelegate, onRevoke };
};

// const { t } = useTranslation();
// const { openSnackbar } = useSnackbar();

// const delegate = useDelegateAccessPackage();
// const revoke = useRevokeAccessPackage();

// const onDelegate = async (accessPackage: AccessPackage) => {
//   delegate(
//     toParty,
//     accessPackage,
//     () => {
//       openSnackbar({
//         message: t('access_packages.package_delegation_success', {
//           name: toParty.name,
//           accessPackage: accessPackage.name,
//         }),
//       });
//     },
//     () => {
//       openSnackbar({
//         message: t('access_packages.package_delegation_error', {
//           name: toParty.name,
//           accessPackage: accessPackage.name,
//         }),
//         duration: SnackbarDuration.infinite,
//       });
//     },
//   );
// };

// const onRevoke = async (accessPackage: AccessPackage) => {
//   revoke(
//     toParty,
//     accessPackage,
//     () => {
//       openSnackbar({
//         message: t('access_packages.package_deletion_success', {
//           name: toParty.name,
//           accessPackage: accessPackage.name,
//         }),
//       });
//     },
//     () => {
//       openSnackbar({
//         message: t('access_packages.package_deletion_error', {
//           name: toParty.name,
//           accessPackage: accessPackage.name,
//         }),
//         duration: SnackbarDuration.infinite,
//       });
//     },
//   );
// };
