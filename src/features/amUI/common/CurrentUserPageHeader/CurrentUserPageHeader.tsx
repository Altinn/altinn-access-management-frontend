import { formatDisplayName, UserListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Connection } from '@/rtk/features/connectionApi';

import classes from './CurrentUserPageHeader.module.css';
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
  const { t } = useTranslation();

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
