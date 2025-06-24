import { useTranslation } from 'react-i18next';
import type { ListItemProps } from '@altinn/altinn-components';
import { Button, DsSkeleton, Heading, List } from '@altinn/altinn-components';

import classes from './RightsTabs.module.css';

const skeletonListItems = [
  {
    id: '1',
    size: 'md',
    loading: true,
    title: 'xxx xxxx xxxxx',
    description: 'xxxxxx xxxxxxx xxxxxxx xx',
    icon: { iconUrl: '...', type: 'company' },
  },
  {
    id: '2',
    size: 'md',
    loading: true,
    title: 'xxx xxxx xxxxx xxxx xxxxx',
    description: 'xxxxxxx xx',
    icon: { iconUrl: '...', type: 'company' },
  },
  {
    id: '3',
    size: 'md',
    loading: true,
    title: 'xxx xxxxx',
    description: 'xxxxxx xxxxxxx xx',
    icon: { iconUrl: '...', type: 'company' },
  },
] as ListItemProps[];

export const RightsTabsSkeleton = () => {
  const { t } = useTranslation();

  const { displayLimitedPreviewLaunch, displayResourceDelegation } = window.featureFlags;

  return (
    <>
      <div className='skeletonTabs'>
        <Button
          variant='text'
          disabled
        >
          <DsSkeleton>{t('user_rights_page.access_packages_title')}</DsSkeleton>
        </Button>
        {displayResourceDelegation && (
          <Button
            variant='text'
            disabled
          >
            <DsSkeleton>{t('user_rights_page.single_rights_title')}</DsSkeleton>
          </Button>
        )}
        {!displayLimitedPreviewLaunch && (
          <Button
            variant='text'
            disabled
          >
            <DsSkeleton>{t('user_rights_page.roles_title')}</DsSkeleton>
          </Button>
        )}
      </div>
      <div className={classes.tabContent}>
        <Heading size='lg'>
          <DsSkeleton>xxxxx xxx xxxxxxxx</DsSkeleton>
        </Heading>
        <List items={skeletonListItems} />
      </div>
    </>
  );
};
