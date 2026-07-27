import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsListItem, DsListUnordered } from '@altinn/altinn-components';
import type { ProblemDetail, SystemUserAccessPackage } from '../../types';
import classes from './DelegationCheckError.module.css';
import { mapErrorCodeToErrorMessage } from '../../errorHandling';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

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

  const getErrorMessage = (): string => {
    return t(mapErrorCodeToErrorMessage(error?.data.code)) || t(defaultError);
  };

  // Specifics forwarded from the backend (which access package/right and why). Shown in addition to
  // the mapped message so the user/support sees the actual reason without digging through logs.
  const delegationReasons = error?.data.delegationReasons;

  return (
    <div className={classes.delegationCheckError}>
      <DsAlert
        data-color='danger'
        role='alert'
      >
        {getErrorMessage()}
        {delegationReasons && (
          <div className={classes.delegationReasons}>
            <DelegationReasonDetails
              delegationReasons={delegationReasons}
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

const ReasonErrorMap: Record<ReasonErrorCode, string> = {
  MissingRoleAccess: 'AMUI-00016',
  MissingDelegationAccess: 'AMUI-00018',
  MissingSrrRightAccess: 'AMUI-00019',
  InsufficientAuthenticationLevel: 'AMUI-00020',
  AccessListValidationFail: 'AMUI-00069',
  MissingPackageAccess: 'AMUI-00068',
  ResourceNotDelegable: 'AMUI-00070',
  ResourceIsMaskinPortenSchema: 'AMUI-00071',
  Unknown: 'AMUI-00014',
};

type Reason = {
  type: 'package' | 'resource';
  id: string;
  codes: ReasonErrorCode[];
};
interface DelegationReasonDetailsProps {
  delegationReasons: string;
  accessPackages: SystemUserAccessPackage[];
  resources: ServiceResource[];
}

const DelegationReasonDetails = ({
  delegationReasons,
  accessPackages,
  resources,
}: DelegationReasonDetailsProps) => {
  let reasons: Reason[];
  try {
    reasons = JSON.parse(delegationReasons);
  } catch {
    // delegationReasons is forwarded verbatim from upstream; if it isn't valid JSON we degrade to
    // showing just the mapped error message rather than crashing the alert.
    return null;
  }
  if (!Array.isArray(reasons)) {
    return null;
  }

  return (
    <DsListUnordered>
      {reasons
        .filter((reason) => !!reason && typeof reason === 'object')
        .map((reason: Reason, index: number) => {
          let reasonDetail: ReactNode | undefined = '';
          let name: string = '';
          if (reason.type === 'package') {
            const packageName = accessPackages.find((x) => x.urn === reason.id)?.name;
            name = packageName ?? reason.id;
          } else {
            name = `${resources.find((x) => x.identifier === reason.id)?.title ?? reason.id}:`;
            reasonDetail = <ResourceReasonDetails codes={reason.codes} />;
          }

          return (
            <DsListItem key={`${reason.id}-${index}`}>
              {name}
              {reasonDetail || ''}
            </DsListItem>
          );
        })}
    </DsListUnordered>
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
          {codes.map((code) => {
            const error = mapErrorCodeToErrorMessage(
              ReasonErrorMap[code] || ReasonErrorMap.Unknown,
            );
            return <DsListItem>{t(error) || ''}</DsListItem>;
          })}
        </DsListUnordered>
      );
    } else {
      return mapErrorCodeToErrorMessage(ReasonErrorMap[codes[0]] || ReasonErrorMap.Unknown);
    }
  }

  return '';
};
