export const RIGHTHOLDER_ROLE = 'Rettighetshaver';

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

export const getDeletionStatus = (
  connections: { roles: string[] }[] | undefined,
  viewingYourself: boolean,
  reporteeView: boolean,
): DeletionStatus => {
  const target = viewingYourself
    ? DeletionTarget.Yourself
    : reporteeView
      ? DeletionTarget.Reportee
      : DeletionTarget.User;

  const allRoles = connections?.flatMap((connection) => connection.roles) ?? [];
  let level: DeletionLevel;

  if (allRoles.length === 0 || allRoles.every((r) => r === RIGHTHOLDER_ROLE)) {
    level = DeletionLevel.Full;
  } else if (allRoles.some((r) => r === RIGHTHOLDER_ROLE)) {
    level = DeletionLevel.Limited;
  } else {
    level = DeletionLevel.None;
  }

  return { target, level };
};

export interface DeletionI18nKeys {
  headingKey: string;
  messageKey: string;
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
    messageKey: `delete_user.${targetPrefix}${levelSuffix}message`,
    triggerButtonKey,
  };
};
