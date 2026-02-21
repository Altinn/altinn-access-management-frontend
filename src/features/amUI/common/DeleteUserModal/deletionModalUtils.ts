import { RolePermission } from '@/rtk/features/roleApi';
import {
  A2_PROVIDER_CODE,
  CRA_PROVIDER_CODE,
  ECC_PROVIDER_CODE,
} from '../UserRoles/useRoleMetadata';

export const RIGHTHOLDER_ROLE = 'rettighetshaver';
export const AGENT_ROLE = 'agent';

export const ER_ROLE_REASON = 'er_roles';
export const OLD_ALTINN_REASON = 'old_altinn';
export const AGENT_ROLE_REASON = 'agent_role';
export const GUARDIANSHIP_ROLE_REASON = 'guardianship_role';

export type NonDeletableReason =
  | typeof ER_ROLE_REASON
  | typeof OLD_ALTINN_REASON
  | typeof AGENT_ROLE_REASON
  | typeof GUARDIANSHIP_ROLE_REASON;

export enum DeletionTarget {
  Yourself = 'yourself',
  Reportee = 'reportee',
  User = 'user',
}

export enum DeletionLevel {
  Full = 'full',
  Limited = 'limited',
  None = 'none',
}

export interface DeletionStatus {
  target: DeletionTarget;
  level: DeletionLevel;
}

export interface DeleteUserDialogModel {
  status: DeletionStatus;
  textKeys: DeletionI18nKeys;
  nonDeletableReasons: NonDeletableReason[];
  partialConfirmationMessageKey: string | null;
}

export interface DeleteUserDialogStateInput {
  status: DeletionStatus;
  nonDeletableReasons?: NonDeletableReason[];
}

export const hasDeletableRights = (rolePermissions: RolePermission[] | undefined): boolean => {
  if (!rolePermissions) {
    return false;
  }

  return rolePermissions.some((rolePermission) => {
    if (rolePermission.role?.code !== RIGHTHOLDER_ROLE) {
      return false;
    }
    if (rolePermission.permissions?.length === 0) {
      return true;
    }
    return rolePermission.permissions.some((permission) => !permission?.via);
  });
};

export const hasNonDeletableRights = (rolePermissions: RolePermission[] | undefined): boolean => {
  if (!rolePermissions) {
    return false;
  }

  return rolePermissions.some((rolePermission) => {
    if (rolePermission?.role?.code !== RIGHTHOLDER_ROLE) {
      return true;
    }
    return rolePermission.permissions.some((permission) => !!permission.via);
  });
};

export const getNonDeletableReasons = (
  rolePermissions: RolePermission[] | undefined,
): NonDeletableReason[] => {
  if (!rolePermissions?.length) {
    return [];
  }

  const hasOldAltinnAccess = rolePermissions.some(
    (rolePermission) => rolePermission?.role?.provider?.code === A2_PROVIDER_CODE,
  );

  const hasERRoles = rolePermissions.some(
    (rolePermission) => rolePermission?.role?.provider?.code === ECC_PROVIDER_CODE,
  );

  const hasAgentRole = rolePermissions.some(
    (rolePermission) => rolePermission?.role?.code === AGENT_ROLE,
  );

  const hasGuardianshipRole = rolePermissions.some(
    (rolePermission) => rolePermission?.role?.provider?.code === CRA_PROVIDER_CODE,
  );

  const reasons: NonDeletableReason[] = [];
  if (hasOldAltinnAccess) {
    reasons.push(OLD_ALTINN_REASON);
  }
  if (hasERRoles) {
    reasons.push(ER_ROLE_REASON);
  }
  if (hasAgentRole) {
    reasons.push(AGENT_ROLE_REASON);
  }
  if (hasGuardianshipRole) {
    reasons.push(GUARDIANSHIP_ROLE_REASON);
  }

  return reasons;
};

export const getDeletionStatus = (
  rolePermissions: RolePermission[] | undefined,
  viewingYourself: boolean,
  reporteeView: boolean,
): DeletionStatus => {
  const target = viewingYourself
    ? DeletionTarget.Yourself
    : reporteeView
      ? DeletionTarget.Reportee
      : DeletionTarget.User;

  if (!rolePermissions) {
    return { target, level: DeletionLevel.None };
  }

  if (rolePermissions.length === 0) {
    return { target, level: DeletionLevel.Full };
  }

  const hasDeletable = hasDeletableRights(rolePermissions);
  const hasNonDeletable = hasNonDeletableRights(rolePermissions);

  let level: DeletionLevel = DeletionLevel.None;
  if (hasDeletable && hasNonDeletable) {
    level = DeletionLevel.Limited;
  } else if (hasDeletable) {
    level = DeletionLevel.Full;
  }

  return { target, level };
};

export interface DeletionI18nKeys {
  headingKey: string;
  fullDeletionMessageKey: string | null;
  triggerButtonKey: string;
}

export const getTextKeysForDeletionStatus = (status: DeletionStatus): DeletionI18nKeys => {
  const { target, level } = status;

  const targetPrefix = `${target}_`;

  let levelSuffix = '';
  if (level === DeletionLevel.Limited) {
    levelSuffix = 'limited_deletion_';
  } else if (level === DeletionLevel.None) {
    levelSuffix = 'deletion_not_allowed_';
  }

  const triggerButtonKey = `delete_user.${target}_trigger_button`;

  return {
    headingKey: `delete_user.${targetPrefix}${levelSuffix}heading`,
    fullDeletionMessageKey:
      level === DeletionLevel.Full ? `delete_user.${targetPrefix}message` : null,
    triggerButtonKey,
  };
};

export const getPartialConfirmationMessageKey = (target: DeletionTarget): string => {
  if (target === DeletionTarget.Yourself) {
    return 'delete_user.yourself_partial_confirmation_message';
  }
  if (target === DeletionTarget.Reportee) {
    return 'delete_user.reportee_partial_confirmation_message';
  }
  return 'delete_user.user_partial_confirmation_message';
};

export const getDeleteUserDialogModelFromStatus = ({
  status,
  nonDeletableReasons = [],
}: DeleteUserDialogStateInput): DeleteUserDialogModel => ({
  status,
  textKeys: getTextKeysForDeletionStatus(status),
  nonDeletableReasons,
  partialConfirmationMessageKey:
    status.level === DeletionLevel.Limited ? getPartialConfirmationMessageKey(status.target) : null,
});

export const getDeleteUserDialogModel = ({
  rolePermissions,
  viewingYourself,
  reporteeView,
}: {
  rolePermissions: RolePermission[] | undefined;
  viewingYourself: boolean;
  reporteeView: boolean;
}): DeleteUserDialogModel => {
  const status = getDeletionStatus(rolePermissions, viewingYourself, reporteeView);
  const nonDeletableReasons = getNonDeletableReasons(rolePermissions);

  return getDeleteUserDialogModelFromStatus({
    status,
    nonDeletableReasons,
  });
};
