import type { Meta, StoryObj } from '@storybook/react';

import { OrgDelegationActionBar } from './OrgDelegationActionBar';

type OrgDelegationActionBarPropsAndCustomArgs = React.ComponentProps<typeof OrgDelegationActionBar>;

const exampleArgs: OrgDelegationActionBarPropsAndCustomArgs = {
  organization: {
    id: '1',
    name: 'Evry',
    orgNumber: '123456789',
    apiList: [
      {
        id: '1',
        apiName: 'Delegert API A',
        scopes: ['some-scope'],
        owner: 'Owner',
        description: `API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og`,
      },
      {
        id: '2',
        apiName: 'Delegert API B',
        scopes: ['some-other-scope'],
        owner: 'Owner',
        description: `API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og`,
      },
    ],
  },
  isEditable: false,
  softRestoreAllCallback: () => null,
  softDeleteAllCallback: () => null,
  softRestoreCallback: () => null,
  softDeleteCallback: () => null,
  delegateToOrgCallback: () => null,
  setScreenreaderMsg: () => null,
  checkIfItemIsSoftDeleted: () => false,
  checkIfAllItmesAreSoftDeleted: () => false,
};

export default {
  title: 'Features/Api Delegation/OrgDelegationActionBar',
  component: OrgDelegationActionBar,
} as Meta;

export const Default: StoryObj<OrgDelegationActionBarPropsAndCustomArgs> = {
  args: exampleArgs,
};
