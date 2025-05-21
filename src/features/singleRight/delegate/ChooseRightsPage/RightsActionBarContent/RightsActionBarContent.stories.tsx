import type { Meta, StoryObj } from '@storybook/react';

import { RightsActionBarContent } from './RightsActionBarContent';

import { ErrorCode } from '@/resources/utils/errorCodeUtils';

export default {
  title: 'Features/SingleRight/ChooseRightsPage/RightsActionBarContent',
  component: RightsActionBarContent,
} as Meta;

const defaultProps = (errorCode?: string) => ({
  toggleRight: (serviceIdentifier: string, action: string) => {
    console.log(serviceIdentifier, action);
  },
  serviceDescription: 'Service description',
  rightDescription: 'Right description',
  serviceIdentifier: 'serviceIdentifier',
  serviceType: 'ServiceType',
  serviceOwner: 'Servicedirektoratet',
  reportee: 'Best Buisness AS',
  rights: [
    {
      action: 'action A',
      rightKey: 'rightKey A',
      delegable: true,
      checked: true,
      resourceReference: [
        {
          id: 'id A',
          value: 'value A',
        },
      ],
      details: [
        {
          code: 'code',
          description: 'description',
        },
      ],
    },
    {
      action: 'action B',
      rightKey: 'rightKey B',
      delegable: true,
      checked: false,
    },
    errorCode
      ? {
          action: 'action C',
          rightKey: 'rightKey C',
          delegable: false,
          checked: false,
          details: [
            {
              code: errorCode,
              description: 'description',
            },
          ],
        }
      : {
          action: 'action C',
          rightKey: 'rightKey C',
          delegable: true,
          checked: false,
        },
  ],
});

export const Default: StoryObj = {
  args: defaultProps(),
};

export const Error_MissingSrrRightAccess: StoryObj = {
  args: defaultProps(ErrorCode.MissingSrrRightAccess),
};

export const Error_AccessListValidationFail: StoryObj = {
  args: defaultProps(ErrorCode.AccessListValidationFail),
};

export const Error_MissingRoleAccess: StoryObj = {
  args: defaultProps(ErrorCode.MissingRoleAccess),
};

export const Error_MissingDelegationAccess: StoryObj = {
  args: defaultProps(ErrorCode.MissingDelegationAccess),
};

export const Error_Unknown: StoryObj = {
  args: defaultProps(ErrorCode.Unknown),
};

export const HTTPError: StoryObj = {
  args: defaultProps(ErrorCode.HTTPError),
};

export const Unauthorized: StoryObj = {
  args: defaultProps(ErrorCode.Unauthorized),
};
export const InsufficientAuthenticationLevel: StoryObj = {
  args: defaultProps(ErrorCode.InsufficientAuthenticationLevel),
};
export const ErrorCodeUndefined: StoryObj = {
  args: defaultProps(undefined),
};

export const ErrorCodeEmpty: StoryObj = {
  args: defaultProps(''),
};
