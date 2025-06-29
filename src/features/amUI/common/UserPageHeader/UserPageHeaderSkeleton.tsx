import { ListItemHeader } from '@altinn/altinn-components';

export const UserPageHeaderSkeleton = () => {
  return (
    <ListItemHeader
      loading
      size='xl'
      avatar={{
        name: 'XXX',
        type: 'company',
      }}
      title={'Xxxxxxx Xxxxxxxx'}
      description='Xxxxxxx Xxxxxxxx Xxxxxxx Xxxxxxxx'
    />
  );
};
