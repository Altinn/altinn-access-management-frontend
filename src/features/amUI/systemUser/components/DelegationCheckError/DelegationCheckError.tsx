import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

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

const ReasonErrorMap = {
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

type ReasonErrorCode = keyof typeof ReasonErrorMap;

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
  const { t } = useTranslation();

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
    <>
      {reasons.map((reason: Reason) => {
        let reasonDetail: string | undefined = '';
        if (reason.type === 'package') {
          reasonDetail = accessPackages.find((x) => x.urn === reason.id)?.name;
        } else {
          const name = resources.find((x) => x.identifier === reason.id)?.title;
          reasonDetail = `${name ?? reason.id}: ${reason.codes.map((code) => t(mapErrorCodeToErrorMessage(ReasonErrorMap[code])) || '').join(', ')}`;
        }

        return <div key={reason.id}>{reasonDetail || ''}</div>;
      })}
    </>
  );
};
