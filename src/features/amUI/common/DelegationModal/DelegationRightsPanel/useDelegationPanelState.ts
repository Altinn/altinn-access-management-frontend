import { useTranslation } from 'react-i18next';
import { formatDisplayName } from '@altinn/altinn-components';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type {
  DelegationCheckedRight,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { createErrorDetails } from '../../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { getMissingAccessMessage } from '../missingAccessUtils';
import { DelegationAction } from '../EditModal';
import type { ChipRight } from '../utils/rightsUtils';

export interface TechnicalErrorDetails {
  status: string;
  time: string;
  traceId?: string;
}

/** The parts of a party this hook needs — satisfied by both Party and DelegationRecipient. */
interface NamedParty {
  name: string;
  partyTypeName?: PartyType | string;
}

export interface UseDelegationPanelStateArgs {
  resource: ServiceResource;
  rights: ChipRight[];
  /** Whether the recipient already holds the resource, directly or inherited. */
  hasAccess: boolean;
  availableActions?: DelegationAction[];
  /** The recipient. Defaults to the toParty in PartyRepresentationContext. */
  toParty?: NamedParty;
  /** Recipient name override, for flows that have no toParty in context (single right requests). */
  toPartyName?: string;
  /** True while a delegate/update/revoke mutation is in flight. */
  isActionLoading: boolean;
  delegationError: 'delegate' | 'revoke' | 'edit' | null;
  /** Delegation check response, used to explain why the acting party cannot delegate. */
  delegationCheckedRights?: DelegationCheckedRight[];
  delegationCheckError?: FetchBaseQueryError | SerializedError;
  /** Error details from the data hook (rights meta, existing rights). Takes precedence. */
  errorDetails?: TechnicalErrorDetails | null;
}

/**
 * Derives the status, error and alert state shared by every rights-delegation panel
 * (single rights, instances). Owns the rules that used to be copy-pasted per panel.
 */
export const useDelegationPanelState = ({
  resource,
  rights,
  hasAccess,
  availableActions,
  toParty: toPartyProp,
  toPartyName,
  isActionLoading,
  delegationError,
  delegationCheckedRights,
  delegationCheckError,
  errorDetails,
}: UseDelegationPanelStateArgs) => {
  const { t } = useTranslation();
  const { actingParty, toParty: toPartyContext } = usePartyRepresentation();
  const toParty = toPartyProp ?? toPartyContext;

  const isRequest = availableActions?.includes(DelegationAction.REQUEST) ?? false;
  const canDelegate = availableActions?.includes(DelegationAction.DELEGATE) ?? false;
  const canApprove = availableActions?.includes(DelegationAction.APPROVE) ?? false;

  const toName =
    toPartyName ??
    formatDisplayName({
      fullName: toParty?.name ?? '',
      type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
    });

  const rawMissingAccess = delegationCheckedRights
    ? getMissingAccessMessage(
        delegationCheckedRights,
        t,
        resource?.resourceOwnerName,
        actingParty?.name,
      )
    : null;
  const missingAccess = isActionLoading || delegationError ? null : rawMissingAccess;

  // A failed delegation check only blocks the panel when the recipient has nothing yet — with
  // existing access the rights still need to be listed so they can be revoked.
  const delegationCheckErrorDetails =
    delegationCheckError && !hasAccess ? createErrorDetails(delegationCheckError) : null;
  const technicalErrorDetails = errorDetails ?? delegationCheckErrorDetails;

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus =
    !hasAccess && rights.length > 0 && !hasDelegableRights && !isRequest;
  const cannotDelegateHere = resource?.delegable === false && !isRequest;
  const cannotRequestRight = resource?.delegable === false && isRequest;

  const displayResourceAlert =
    (isRequest && resource?.delegable === false) ||
    !!technicalErrorDetails ||
    (canApprove && !hasAccess && !!missingAccess) ||
    ((canDelegate || canApprove) &&
      !hasAccess &&
      (!!delegationCheckError ||
        resource?.delegable === false ||
        (rights.length > 0 && !hasDelegableRights)));

  const screenReaderMessage = delegationError
    ? delegationError === 'revoke'
      ? t('delegation_modal.technical_error_message.revoke_failed')
      : t('delegation_modal.technical_error_message.message')
    : (missingAccess ?? '');

  return {
    toName,
    missingAccess,
    technicalErrorDetails,
    hasDelegableRights,
    showMissingRightsStatus,
    cannotDelegateHere,
    cannotRequestRight,
    displayResourceAlert,
    screenReaderMessage,
  };
};
