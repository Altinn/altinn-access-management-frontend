import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsListItem, DsListUnordered } from '@altinn/altinn-components';

import type { ProblemDetail, SystemUserAccessPackage } from '../../types';
import { mapErrorCodeToErrorMessage } from '../../errorHandling';

import classes from './DelegationCheckError.module.css';

import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface DelegationCheckErrorProps {
  defaultError: string;
  accessPackages: SystemUserAccessPackage[];
  resources: ServiceResource[];
  error: {
    data: ProblemDetail;
  };
}

export const DelegationCheckError = ({
  defaultError,
  accessPackages,
  resources,
  error,
}: DelegationCheckErrorProps): React.ReactNode => {
  const { t } = useTranslation();

  // Specifics forwarded from the backend (which access package/right and why). Shown in addition to
  // the headline so the user/support sees the actual reason without digging through logs.
  const reasons = parseDelegationReasons(error?.data.delegationReasons);

  // When the backend forwarded structured reasons we show a generic headline that reflects which
  // categories failed (services, access packages, or both) and let the itemized list carry the
  // per-item specifics. Without structured reasons we fall back to the mapped error code.
  const getErrorMessage = (): string => {
    if (reasons && reasons.length > 0) {
      const hasResources = reasons.some((reason) => reason.type === 'resource');
      const hasPackages = reasons.some((reason) => reason.type === 'package');
      if (hasResources && hasPackages) {
        return t('systemuser_delegation_errors.summary_both');
      }
      if (hasPackages) {
        return t('systemuser_delegation_errors.summary_accesspackages');
      }
      if (hasResources) {
        return t('systemuser_delegation_errors.summary_resources');
      }
    }
    return t(mapErrorCodeToErrorMessage(error?.data.code)) || t(defaultError);
  };

  return (
    <div className={classes.delegationCheckError}>
      <DsAlert
        data-color='danger'
        role='alert'
      >
        {getErrorMessage()}
        {reasons && reasons.length > 0 && (
          <div className={classes.delegationReasons}>
            <DelegationReasonDetails
              reasons={reasons}
              accessPackages={accessPackages}
              resources={resources}
            />
          </div>
        )}
      </DsAlert>
    </div>
  );
};

type ReasonErrorCode =
  | 'MissingRoleAccess'
  | 'MissingDelegationAccess'
  | 'MissingSrrRightAccess'
  | 'InsufficientAuthenticationLevel'
  | 'AccessListValidationFail'
  | 'MissingPackageAccess'
  | 'ResourceNotDelegable'
  | 'ResourceIsMaskinPortenSchema'
  | 'Unknown';

// Short, prefix-free reason phrases used in the itemized list. These deliberately omit the
// "Delegering av tjenester feilet:" lead-in that the top-level messages carry, since the headline
// and the group titles already provide that context — repeating it on every bullet was just noise.
const ReasonTextMap: Record<ReasonErrorCode, string> = {
  MissingRoleAccess: 'systemuser_delegation_errors.reason_missing_role_access',
  MissingDelegationAccess: 'systemuser_delegation_errors.reason_missing_delegation_access',
  MissingSrrRightAccess: 'systemuser_delegation_errors.reason_missing_srr_right_access',
  InsufficientAuthenticationLevel:
    'systemuser_delegation_errors.reason_insufficient_authentication_level',
  AccessListValidationFail: 'systemuser_delegation_errors.reason_access_list_validation_fail',
  MissingPackageAccess: 'systemuser_delegation_errors.reason_missing_package_access',
  ResourceNotDelegable: 'systemuser_delegation_errors.reason_resource_not_delegable',
  ResourceIsMaskinPortenSchema:
    'systemuser_delegation_errors.reason_resource_is_maskinporten_schema',
  Unknown: 'systemuser_delegation_errors.reason_unknown',
};

type Reason = {
  type: 'package' | 'resource';
  id: string;
  codes: ReasonErrorCode[];
};

// delegationReasons is forwarded verbatim from upstream as a JSON string; if it is missing or isn't
// a valid JSON array we return null so the caller degrades to just the mapped error message rather
// than crashing the alert.
const parseDelegationReasons = (delegationReasons?: string): Reason[] | null => {
  if (!delegationReasons) {
    return null;
  }
  let reasons: unknown;
  try {
    reasons = JSON.parse(delegationReasons);
  } catch {
    return null;
  }
  if (!Array.isArray(reasons)) {
    return null;
  }
  return reasons.filter((reason) => !!reason && typeof reason === 'object') as Reason[];
};

interface DelegationReasonDetailsProps {
  reasons: Reason[];
  accessPackages: SystemUserAccessPackage[];
  resources: ServiceResource[];
}

const DelegationReasonDetails = ({
  reasons,
  accessPackages,
  resources,
}: DelegationReasonDetailsProps) => {
  const { t } = useTranslation();

  // Group by type so we can show a title telling the user whether these are services (rights/resources)
  // or access packages. A single response can contain both (the backend aggregates them).
  const resourceReasons = reasons.filter((reason) => reason.type === 'resource');
  const packageReasons = reasons.filter((reason) => reason.type === 'package');

  return (
    <>
      {resourceReasons.length > 0 && (
        <>
          <div className={classes.delegationReasonsTitle}>
            {t('systemuser_delegation_errors.title_resources')}
          </div>
          <DsListUnordered>
            {resourceReasons.map((reason: Reason, index: number) => (
              <DsListItem key={`${reason.id}-${index}`}>
                {`${resources.find((x) => x.identifier === reason.id)?.title ?? reason.id}:`}
                <ResourceReasonDetails codes={reason.codes} />
              </DsListItem>
            ))}
          </DsListUnordered>
        </>
      )}
      {packageReasons.length > 0 && (
        <>
          <div className={classes.delegationReasonsTitle}>
            {t('systemuser_delegation_errors.title_accesspackages')}
          </div>
          <DsListUnordered>
            {packageReasons.map((reason: Reason, index: number) => (
              <DsListItem key={`${reason.id}-${index}`}>
                {accessPackages.find((x) => x.urn === reason.id)?.name ?? reason.id}
              </DsListItem>
            ))}
          </DsListUnordered>
        </>
      )}
    </>
  );
};

interface ResourceReasonDetailsProps {
  codes: ReasonErrorCode[];
}

const ResourceReasonDetails = ({ codes }: ResourceReasonDetailsProps) => {
  const { t } = useTranslation();

  if (Array.isArray(codes)) {
    if (codes.length > 1) {
      return (
        <DsListUnordered>
          {codes.map((code) => (
            <DsListItem key={code}>{t(ReasonTextMap[code] || ReasonTextMap.Unknown)}</DsListItem>
          ))}
        </DsListUnordered>
      );
    } else {
      return t(ReasonTextMap[codes[0]] || ReasonTextMap.Unknown);
    }
  }

  return '';
};
