import { describe, it, expect } from 'vitest';

import {
  AGENT_ROLE_REASON,
  AGENT_ROLE,
  ER_ROLE_REASON,
  getDeleteUserDialogModel,
  getDeleteUserDialogModelFromStatus,
  getNonDeletableReasons,
  getDeletionStatus,
  getTextKeysForDeletionStatus,
  OLD_ALTINN_REASON,
  DeletionTarget,
  DeletionLevel,
  RIGHTHOLDER_ROLE,
  type DeletionStatus,
  type DeletionI18nKeys,
} from './deletionModalUtils';
import { RolePermission } from '@/rtk/features/roleApi';
import { Entity } from '@/dataObjects/dtos/Common';

type rolePermissionSetting = {
  code: string;
  via: (string | null)[];
};

const defaultEntity: Entity = {
  id: 'entity-id',
  name: 'Entity Name',
  type: 'entity-type',
  variant: 'entity-variant',
};

const mockRolePermissions = (settings: rolePermissionSetting[]): RolePermission[] => {
  const mockedPerms: RolePermission[] = settings.map((setting, index) => ({
    role: {
      id: `role-id-${index}`,
      code: setting.code,
      name: `Role Name ${index}`,
      description: `Description for role ${index}`,
    },
    permissions:
      setting.via?.map((via, permIndex) => ({
        to: defaultEntity,
        from: defaultEntity,
        via: via ? { ...defaultEntity, id: `via-entity-id-${permIndex}` } : undefined,
        role: null,
      })) || [],
  }));
  return mockedPerms;
};

describe('getDeletionStatus', () => {
  const testCases: Array<{
    description: string;
    rolePermissions: RolePermission[] | undefined;
    viewingYourself: boolean;
    reporteeView: boolean;
    expected: DeletionStatus;
  }> = [
    // --- Target: Yourself ---
    {
      description:
        'viewing yourself, no rolePermissions, should target Yourself and allow No deletion',
      rolePermissions: undefined,
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.None },
    },
    {
      description:
        'viewing yourself, empty rolePermissions array, should target Yourself and allow Full deletion',
      rolePermissions: [],
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, connection with empty roles, should target Yourself and allow Full deletion',
      rolePermissions: mockRolePermissions([]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, connection with empty roles, should target Yourself and allow Full deletion',
      rolePermissions: mockRolePermissions([]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, only Rightholder roles, should target Yourself and allow Full deletion',
      rolePermissions: mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, mixed roles (Rightholder and other), should target Yourself and allow Limited deletion',
      rolePermissions: mockRolePermissions([
        { code: RIGHTHOLDER_ROLE, via: [null] },
        { code: AGENT_ROLE, via: [] },
      ]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Limited },
    },
    {
      description:
        'viewing yourself, only other roles (no Rightholder), should target Yourself and allow No deletion',
      rolePermissions: mockRolePermissions([{ code: 'dagl', via: [null] }]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.None },
    },

    // --- Target: Reportee ---
    {
      description:
        'reportee view, no rolePermissions, should target Reportee and allow No deletion',
      rolePermissions: undefined,
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.None },
    },
    {
      description:
        'reportee view, only Rightholder roles, should target Reportee and allow Full deletion',
      rolePermissions: mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]),
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.Full },
    },
    {
      description: 'reportee view, mixed roles, should target Reportee and allow Limited deletion',
      rolePermissions: mockRolePermissions([
        { code: RIGHTHOLDER_ROLE, via: [null] },
        { code: AGENT_ROLE, via: [] },
      ]),
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.Limited },
    },
    {
      description: 'reportee view, only other roles, should target Reportee and allow No deletion',
      rolePermissions: mockRolePermissions([{ code: 'dagl', via: [null] }]),
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.None },
    },

    // --- Target: User (User) ---
    {
      description: 'user view, no rolePermissions, should target User and allow No deletion',
      rolePermissions: undefined,
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.None },
    },
    {
      description: 'user view, only Rightholder roles, should target User and allow Full deletion',
      rolePermissions: mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Full },
    },
    {
      description: 'user view, mixed roles, should target User and allow Limited deletion',
      rolePermissions: mockRolePermissions([
        { code: RIGHTHOLDER_ROLE, via: [null] },
        { code: AGENT_ROLE, via: [] },
      ]),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Limited },
    },
    {
      description: 'user view, only agent role, should target User and allow No deletion',
      rolePermissions: mockRolePermissions([{ code: AGENT_ROLE, via: [null] }]),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.None },
    },
    {
      description: 'user view, only other roles, should target User and allow No deletion',
      rolePermissions: mockRolePermissions([{ code: 'dagl', via: [] }]),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.None },
    },
    {
      description:
        'all roles are Rightholder across multiple rolePermissions, should allow Full deletion (user view)',
      rolePermissions: [
        ...mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]),
        ...mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [] }]),
      ],
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Full },
    },
    {
      description:
        'some roles are Rightholder, some are agent, across multiple rolePermissions, should allow Limited deletion (user view)',
      rolePermissions: [
        ...mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]),
        ...mockRolePermissions([{ code: AGENT_ROLE, via: [] }]),
      ],
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Limited },
    },
  ];

  it.each(testCases)(
    '$description',
    ({ rolePermissions, viewingYourself, reporteeView, expected }) => {
      const result = getDeletionStatus(rolePermissions, viewingYourself, reporteeView);
      expect(result).toEqual(expected);
    },
  );
});

describe('getNonDeletableReasons', () => {
  it('returns no reasons when all access is deletable', () => {
    const rolePermissions = mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]);
    expect(getNonDeletableReasons(rolePermissions)).toEqual([]);
  });

  it('returns old Altinn reason when rightholder access is only via inherited/delegated paths', () => {
    const rolePermissions = mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: ['via-org'] }]);
    expect(getNonDeletableReasons(rolePermissions)).toEqual([OLD_ALTINN_REASON]);
  });

  it('returns ER role reason for non-rightholder, non-agent roles', () => {
    const rolePermissions = mockRolePermissions([{ code: 'dagl', via: ['via-org'] }]);
    expect(getNonDeletableReasons(rolePermissions)).toEqual([ER_ROLE_REASON]);
  });

  it('returns agent role reason for agent role access', () => {
    const rolePermissions = mockRolePermissions([{ code: AGENT_ROLE, via: ['via-org'] }]);
    expect(getNonDeletableReasons(rolePermissions)).toEqual([AGENT_ROLE_REASON]);
  });

  it('returns all matching reasons in stable order', () => {
    const rolePermissions = mockRolePermissions([
      { code: RIGHTHOLDER_ROLE, via: ['via-org'] },
      { code: 'dagl', via: ['via-org'] },
      { code: AGENT_ROLE, via: ['via-org'] },
    ]);
    expect(getNonDeletableReasons(rolePermissions)).toEqual([
      OLD_ALTINN_REASON,
      ER_ROLE_REASON,
      AGENT_ROLE_REASON,
    ]);
  });
});

describe('getTextKeysForDeletionStatus', () => {
  const testCases: Array<{
    description: string;
    status: DeletionStatus;
    expected: DeletionI18nKeys;
  }> = [
    // Target: Yourself
    {
      description: 'Yourself - Full deletion',
      status: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
      expected: {
        headingKey: 'delete_user.yourself_heading',
        fullDeletionMessageKey: 'delete_user.yourself_message',
        triggerButtonKey: 'delete_user.yourself_trigger_button',
      },
    },
    {
      description: 'Yourself - Limited deletion',
      status: { target: DeletionTarget.Yourself, level: DeletionLevel.Limited },
      expected: {
        headingKey: 'delete_user.yourself_limited_deletion_heading',
        fullDeletionMessageKey: null,
        triggerButtonKey: 'delete_user.yourself_trigger_button',
      },
    },
    {
      description: 'Yourself - No deletion',
      status: { target: DeletionTarget.Yourself, level: DeletionLevel.None },
      expected: {
        headingKey: 'delete_user.yourself_deletion_not_allowed_heading',
        fullDeletionMessageKey: null,
        triggerButtonKey: 'delete_user.yourself_trigger_button',
      },
    },

    // Target: Reportee
    {
      description: 'Reportee - Full deletion',
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.Full },
      expected: {
        headingKey: 'delete_user.reportee_heading',
        fullDeletionMessageKey: 'delete_user.reportee_message',
        triggerButtonKey: 'delete_user.reportee_trigger_button',
      },
    },
    {
      description: 'Reportee - Limited deletion',
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.Limited },
      expected: {
        headingKey: 'delete_user.reportee_limited_deletion_heading',
        fullDeletionMessageKey: null,
        triggerButtonKey: 'delete_user.reportee_trigger_button',
      },
    },
    {
      description: 'Reportee - No deletion',
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.None },
      expected: {
        headingKey: 'delete_user.reportee_deletion_not_allowed_heading',
        fullDeletionMessageKey: null,
        triggerButtonKey: 'delete_user.reportee_trigger_button',
      },
    },

    // Target: User
    {
      description: 'User - Full deletion',
      status: { target: DeletionTarget.User, level: DeletionLevel.Full },
      expected: {
        headingKey: 'delete_user.user_heading',
        fullDeletionMessageKey: 'delete_user.user_message',
        triggerButtonKey: 'delete_user.user_trigger_button',
      },
    },
    {
      description: 'User - Limited deletion',
      status: { target: DeletionTarget.User, level: DeletionLevel.Limited },
      expected: {
        headingKey: 'delete_user.user_limited_deletion_heading',
        fullDeletionMessageKey: null,
        triggerButtonKey: 'delete_user.user_trigger_button',
      },
    },
    {
      description: 'User - No deletion',
      status: { target: DeletionTarget.User, level: DeletionLevel.None },
      expected: {
        headingKey: 'delete_user.user_deletion_not_allowed_heading',
        fullDeletionMessageKey: null,
        triggerButtonKey: 'delete_user.user_trigger_button',
      },
    },
  ];

  it.each(testCases)(
    'should return correct keys for $description (target $status.target, level $status.level)',
    ({ status, expected }) => {
      const result = getTextKeysForDeletionStatus(status);
      expect(result).toEqual(expected);
    },
  );
});

describe('getDeleteUserDialogModel', () => {
  it('returns deletable state for fully deletable access', () => {
    const rolePermissions = mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]);
    const model = getDeleteUserDialogModel({
      rolePermissions,
      viewingYourself: false,
      reporteeView: false,
    });

    expect(model.status.level).toBe(DeletionLevel.Full);
    expect(model.partialConfirmationMessageKey).toBeNull();
    expect(model.nonDeletableReasons).toEqual([]);
    expect(model.textKeys.headingKey).toBe('delete_user.user_heading');
  });

  it('returns partially deletable state with reasons and partial confirmation key', () => {
    const rolePermissions = mockRolePermissions([
      { code: RIGHTHOLDER_ROLE, via: [null, 'via-org'] },
      { code: AGENT_ROLE, via: ['via-org'] },
      { code: 'dagl', via: ['via-org'] },
    ]);
    const model = getDeleteUserDialogModel({
      rolePermissions,
      viewingYourself: true,
      reporteeView: false,
    });

    expect(model.status.level).toBe(DeletionLevel.Limited);
    expect(model.partialConfirmationMessageKey).toBe(
      'delete_user.yourself_partial_confirmation_message',
    );
    expect(model.nonDeletableReasons).toEqual([
      OLD_ALTINN_REASON,
      ER_ROLE_REASON,
      AGENT_ROLE_REASON,
    ]);
    expect(model.textKeys.headingKey).toBe('delete_user.yourself_limited_deletion_heading');
  });

  it('returns not deletable state with no partial confirmation key', () => {
    const rolePermissions = mockRolePermissions([{ code: AGENT_ROLE, via: ['via-org'] }]);
    const model = getDeleteUserDialogModel({
      rolePermissions,
      viewingYourself: false,
      reporteeView: true,
    });

    expect(model.status.level).toBe(DeletionLevel.None);
    expect(model.partialConfirmationMessageKey).toBeNull();
    expect(model.nonDeletableReasons).toEqual([AGENT_ROLE_REASON]);
    expect(model.textKeys.headingKey).toBe('delete_user.reportee_deletion_not_allowed_heading');
  });
});

describe('getDeleteUserDialogModelFromStatus', () => {
  it('returns full deletion model without partial confirmation key', () => {
    const model = getDeleteUserDialogModelFromStatus({
      status: { target: DeletionTarget.User, level: DeletionLevel.Full },
      nonDeletableReasons: [],
    });

    expect(model.status).toEqual({
      target: DeletionTarget.User,
      level: DeletionLevel.Full,
    });
    expect(model.textKeys).toEqual({
      headingKey: 'delete_user.user_heading',
      fullDeletionMessageKey: 'delete_user.user_message',
      triggerButtonKey: 'delete_user.user_trigger_button',
    });
    expect(model.nonDeletableReasons).toEqual([]);
    expect(model.partialConfirmationMessageKey).toBeNull();
  });

  it('returns limited deletion model with partial confirmation key', () => {
    const model = getDeleteUserDialogModelFromStatus({
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.Limited },
      nonDeletableReasons: [ER_ROLE_REASON, AGENT_ROLE_REASON],
    });

    expect(model.status).toEqual({
      target: DeletionTarget.Reportee,
      level: DeletionLevel.Limited,
    });
    expect(model.textKeys).toEqual({
      headingKey: 'delete_user.reportee_limited_deletion_heading',
      fullDeletionMessageKey: null,
      triggerButtonKey: 'delete_user.reportee_trigger_button',
    });
    expect(model.nonDeletableReasons).toEqual([ER_ROLE_REASON, AGENT_ROLE_REASON]);
    expect(model.partialConfirmationMessageKey).toBe(
      'delete_user.reportee_partial_confirmation_message',
    );
  });
});
