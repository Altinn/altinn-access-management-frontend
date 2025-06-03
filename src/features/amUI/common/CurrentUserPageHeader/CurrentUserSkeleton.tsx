import { ListItem } from '@altinn/altinn-components';

export const CurrentUserSkeleton = () => {
  return (
    <ListItem
      loading
      size='xl'
      title='xxxxxxxx xxxxxxxx'
      description='xxxxxxx, xxxxxxx'
      icon={{
        type: 'person',
        name: '',
      }}
    />
  );
};
