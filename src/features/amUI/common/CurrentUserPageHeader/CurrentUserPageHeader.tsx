import { UserListItem } from '@altinn/altinn-components';

import type { Connection } from '@/rtk/features/connectionApi';
import {
  getFormattedDateOfBirthLabel,
  formatEntityDisplayName,
} from '@/resources/utils/reporteeUtils';

import classes from './CurrentUserPageHeader.module.css';

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
        name={formatEntityDisplayName(currentUser?.party)}
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
