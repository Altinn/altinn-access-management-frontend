import { UserListItem } from '@altinn/altinn-components';

export const CurrentUserSkeleton = () => {
  return (
    <UserListItem
      interactive={false}
      loading
      size='xl'
      name='xxxxxxxx xxxxxxxx'
      description='xxxxxxx, xxxxxxx'
      type='person'
      id='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    />
  );
};
