import { describe, it, expect } from 'vitest';

import type { Connection } from '@/rtk/features/userInfoApi';

import {
  getDeletionStatus,
  getTextKeysForDeletionStatus,
  DeletionTarget,
  DeletionLevel,
  RIGHTHOLDER_ROLE,
  type DeletionStatus,
  type DeletionI18nKeys,
} from './deletionModalUtils';

const mockConnection = (roleCodes: string[] | null): Connection[] => {
  return [
    {
      roles: roleCodes?.map((c: string) => ({ id: '123', code: c })) ?? [],
      party: {
        id: '',
        name: '',
        children: null,
        keyValues: null,
      },
      connections: [],
    },
  ];
};

describe('getDeletionStatus', () => {
  const testCases: Array<{
    description: string;
    connections: Connection[] | undefined;
    viewingYourself: boolean;
    reporteeView: boolean;
    expected: DeletionStatus;
  }> = [
    // --- Target: Yourself ---
    {
      description:
        'viewing yourself, no connections, should target Yourself and allow Full deletion',
      connections: undefined,
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, empty connections array, should target Yourself and allow Full deletion',
      connections: [],
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, connection with empty roles, should target Yourself and allow Full deletion',
      connections: mockConneciton([]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, connection with empty roles, should target Yourself and allow Full deletion',
      connections: mockConneciton(null),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, only Rightholder roles, should target Yourself and allow Full deletion',
      connections: mockConneciton([RIGHTHOLDER_ROLE]),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Full },
    },
    {
      description:
        'viewing yourself, mixed roles (Rightholder and other), should target Yourself and allow Limited deletion',
      connections: mockConneciton([RIGHTHOLDER_ROLE, 'dagl']),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.Limited },
    },
    {
      description:
        'viewing yourself, only other roles (no Rightholder), should target Yourself and allow No deletion',
      connections: mockConneciton(['dagl']),
      viewingYourself: true,
      reporteeView: false,
      expected: { target: DeletionTarget.Yourself, level: DeletionLevel.None },
    },

    // --- Target: Reportee ---
    {
      description: 'reportee view, no connections, should target Reportee and allow Full deletion',
      connections: undefined,
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.Full },
    },
    {
      description:
        'reportee view, only Rightholder roles, should target Reportee and allow Full deletion',
      connections: mockConneciton([RIGHTHOLDER_ROLE]),
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.Full },
    },
    {
      description: 'reportee view, mixed roles, should target Reportee and allow Limited deletion',
      connections: mockConneciton([RIGHTHOLDER_ROLE, 'dagl']),
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.Limited },
    },
    {
      description: 'reportee view, only other roles, should target Reportee and allow No deletion',
      connections: mockConneciton(['dagl']),
      viewingYourself: false,
      reporteeView: true,
      expected: { target: DeletionTarget.Reportee, level: DeletionLevel.None },
    },

    // --- Target: User (User) ---
    {
      description: 'user view, no connections, should target User and allow Full deletion',
      connections: undefined,
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Full },
    },
    {
      description: 'user view, only Rightholder roles, should target User and allow Full deletion',
      connections: mockConneciton([RIGHTHOLDER_ROLE]),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Full },
    },
    {
      description: 'user view, mixed roles, should target User and allow Limited deletion',
      connections: mockConneciton([RIGHTHOLDER_ROLE, 'dagl']),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Limited },
    },
    {
      description: 'user view, only other roles, should target User and allow No deletion',
      connections: mockConneciton(['dagl']),
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.None },
    },
    {
      description:
        'all roles are Rightholder across multiple connections, should allow Full deletion (user view)',
      connections: [...mockConneciton([RIGHTHOLDER_ROLE]), ...mockConneciton([RIGHTHOLDER_ROLE])],
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Full },
    },
    {
      description:
        'some roles are Rightholder, some are not, across multiple connections, should allow Limited deletion (user view)',
      connections: [...mockConneciton([RIGHTHOLDER_ROLE]), ...mockConneciton(['dagl'])],
      viewingYourself: false,
      reporteeView: false,
      expected: { target: DeletionTarget.User, level: DeletionLevel.Limited },
    },
  ];

  it.each(testCases)('$description', ({ connections, viewingYourself, reporteeView, expected }) => {
    const result = getDeletionStatus(connections, viewingYourself, reporteeView);
    expect(result).toEqual(expected);
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
