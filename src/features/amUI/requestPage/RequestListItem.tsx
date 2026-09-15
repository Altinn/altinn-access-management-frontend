import React from 'react';
import { UserListItem } from '@altinn/altinn-components';

import { useRestoreFocusTarget } from '../common/RestoreFocus';

export const RequestListItem = (props: React.ComponentProps<typeof UserListItem>) => {
  useRestoreFocusTarget(props.id);
  return <UserListItem {...props} />;
};
