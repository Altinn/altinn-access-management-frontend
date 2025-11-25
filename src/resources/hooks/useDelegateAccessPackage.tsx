import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useDelegatePackageMutation } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

export interface ValidationErrorDetail {
  code: string;
  description?: string;
  context?: Record<string, string>;
}

export interface DelegationErrorDetails {
  title?: string;
  detail?: string;
  traceId?: string;
  errorCode?: string;
  validationContext?: Record<string, string>;
  validationErrors?: ValidationErrorDetail[];
}

export const useDelegateAccessPackage = () => {
  const [delegate, { isLoading }] = useDelegatePackageMutation();

  const delegatePackage = (
    toParty: Party,
    fromParty: Party,
    actingParty: Party,
    resource: AccessPackage,
    onSuccess?: () => void,
    onError?: (status: string | number, details?: DelegationErrorDetails) => void,
  ) => {
    delegate({
      to: toParty.partyUuid,
      packageId: resource.id,
      from: fromParty.partyUuid,
      party: actingParty.partyUuid,
    })
      .unwrap()
      .then(() => {
        onSuccess?.();
      })
      .catch((response) => {
        onError?.(response.status, response.data);
      });
  };

  return { delegatePackage, isLoading };
};
