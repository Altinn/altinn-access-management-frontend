import { formatDisplayName, UserListItem } from '@altinn/altinn-components';

import classes from './CurrentUserPageHeader.module.css';

import type { Connection } from '@/rtk/features/connectionApi';
import { getFormattedDateOfBirthLabel } from '@/resources/utils/reporteeUtils';

interface CurrentUserPageHeaderProps {
  currentUser?: Connection;
  as: React.ElementType;
  loading: boolean;
  roleNames?: string[];
}

export const CurrentUserPageHeader = ({
  currentUser,
  as,
  loading,
  roleNames,
}: CurrentUserPageHeaderProps) => {
  return (
    <div className={classes.currentUser}>
      <UserListItem
        id={currentUser?.party?.id || ''}
        name={formatDisplayName({
          fullName: currentUser?.party?.name || '',
          type: currentUser?.party?.type === 'Person' ? 'person' : 'company',
        })}
        description={getFormattedDateOfBirthLabel(currentUser?.party?.dateOfBirth)}
        roleNames={roleNames}
        type='person'
        as={as}
        titleAs='div'
        size='lg'
        loading={loading}
        containerAs='div'
      />
    </div>
  );
};
