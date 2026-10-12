import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useDelegatePackageMutation } from '@/rtk/features/accessPackageApi';
import type { PartyEntity } from '@/dataObjects/dtos/Party';

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
    toParty: PartyEntity,
    fromParty: PartyEntity,
    actingParty: PartyEntity,
    resource: AccessPackage,
    onSuccess?: () => void,
    onError?: (status: string | number, details?: DelegationErrorDetails) => void,
  ) => {
    delegate({
      to: toParty.id,
      packageId: resource.id,
      from: fromParty.id,
      party: actingParty.id,
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
