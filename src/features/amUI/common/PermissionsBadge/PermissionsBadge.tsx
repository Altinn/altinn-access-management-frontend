import {
  Avatar,
  AvatarGroup,
  type AvatarProps,
  DsParagraph,
  DsPopover,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import classes from './PermissionsBadge.module.css';

export const PermissionsBadge = ({ permissions }: { permissions: AvatarProps[] }) => {
  const { t } = useTranslation();

  if (permissions.length === 0) {
    return null;
  }

  return (
    <DsPopover.TriggerContext>
      <DsPopover.Trigger
        variant='tertiary'
        data-size='xs'
        aria-label={t('poa_overview_page.show_users_with_access')}
      >
        <AvatarGroup
          items={permissions}
          size='lg'
        />
      </DsPopover.Trigger>
      <DsPopover
        placement='top'
        data-size='sm'
      >
        <div className={classes.permissionsBadgePopoverContent}>
          {permissions.map((p) => (
            <div
              key={p.id}
              className={classes.permissionsBadgeItem}
            >
              <Avatar
                name={p.name}
                type={p.type}
                size='md'
              />
              <DsParagraph className={classes.permissionsBadgeItemName}>{p.name}</DsParagraph>
            </div>
          ))}
        </div>
      </DsPopover>
    </DsPopover.TriggerContext>
  );
};
