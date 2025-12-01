import { describe, it, expect } from 'vitest';

import {
  getDeletionStatus,
  getTextKeysForDeletionStatus,
  DeletionTarget,
  DeletionLevel,
  RIGHTHOLDER_ROLE,
  type DeletionStatus,
  type DeletionI18nKeys,
} from './deletionModalUtils';
import { Connection } from '@/rtk/features/connectionApi';
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
        { code: 'dagl', via: [] },
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
        { code: 'dagl', via: [] },
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
        { code: 'dagl', via: [] },
      ]),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Limited },
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
        'some roles are Rightholder, some are not, across multiple rolePermissions, should allow Limited deletion (user view)',
      rolePermissions: [
        ...mockRolePermissions([{ code: RIGHTHOLDER_ROLE, via: [null] }]),
        ...mockRolePermissions([{ code: 'dagl', via: [] }]),
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
        messageKey: 'delete_user.yourself_message',
        triggerButtonKey: 'delete_user.yourself_trigger_button',
      },
    },
    {
      description: 'Yourself - Limited deletion',
      status: { target: DeletionTarget.Yourself, level: DeletionLevel.Limited },
      expected: {
        headingKey: 'delete_user.yourself_limited_deletion_heading',
        messageKey: 'delete_user.yourself_limited_deletion_message',
        triggerButtonKey: 'delete_user.yourself_trigger_button',
      },
    },
    {
      description: 'Yourself - No deletion',
      status: { target: DeletionTarget.Yourself, level: DeletionLevel.None },
      expected: {
        headingKey: 'delete_user.yourself_deletion_not_allowed_heading',
        messageKey: 'delete_user.yourself_deletion_not_allowed_message',
        triggerButtonKey: 'delete_user.yourself_trigger_button',
      },
    },

    // Target: Reportee
    {
      description: 'Reportee - Full deletion',
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.Full },
      expected: {
        headingKey: 'delete_user.reportee_heading',
        messageKey: 'delete_user.reportee_message',
        triggerButtonKey: 'delete_user.reportee_trigger_button',
      },
    },
    {
      description: 'Reportee - Limited deletion',
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.Limited },
      expected: {
        headingKey: 'delete_user.reportee_limited_deletion_heading',
        messageKey: 'delete_user.reportee_limited_deletion_message',
        triggerButtonKey: 'delete_user.reportee_trigger_button',
      },
    },
    {
      description: 'Reportee - No deletion',
      status: { target: DeletionTarget.Reportee, level: DeletionLevel.None },
      expected: {
        headingKey: 'delete_user.reportee_deletion_not_allowed_heading',
        messageKey: 'delete_user.reportee_deletion_not_allowed_message',
        triggerButtonKey: 'delete_user.reportee_trigger_button',
      },
    },

    // Target: User
    {
      description: 'User - Full deletion',
      status: { target: DeletionTarget.User, level: DeletionLevel.Full },
      expected: {
        headingKey: 'delete_user.user_heading',
        messageKey: 'delete_user.user_message',
        triggerButtonKey: 'delete_user.user_trigger_button',
      },
    },
    {
      description: 'User - Limited deletion',
      status: { target: DeletionTarget.User, level: DeletionLevel.Limited },
      expected: {
        headingKey: 'delete_user.user_limited_deletion_heading',
        messageKey: 'delete_user.user_limited_deletion_message',
        triggerButtonKey: 'delete_user.user_trigger_button',
      },
    },
    {
      description: 'User - No deletion',
      status: { target: DeletionTarget.User, level: DeletionLevel.None },
      expected: {
        headingKey: 'delete_user.user_deletion_not_allowed_heading',
        messageKey: 'delete_user.user_deletion_not_allowed_message',
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
