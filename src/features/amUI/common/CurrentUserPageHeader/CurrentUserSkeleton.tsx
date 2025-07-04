import { ListItem } from '@altinn/altinn-components';

export const CurrentUserSkeleton = () => {
  return (
    <ListItem
      interactive={false}
      loading
      size='xl'
      title='xxxxxxxx xxxxxxxx'
      description='xxxxxxx, xxxxxxx'
      avatar={{
        type: 'person',
        name: '',
      }}
    />
  );
};
