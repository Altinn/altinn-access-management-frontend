import { formatDisplayName, UserListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Connection } from '@/rtk/features/connectionApi';
import { formatDateToNorwegian } from '@/resources/utils';

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
  const { t } = useTranslation();

  const formattedBirthDate = formatDateToNorwegian(currentUser?.party?.dateOfBirth || undefined);

  return (
    <div className={classes.currentUser}>
      <UserListItem
        id={currentUser?.party?.id || ''}
        name={formatDisplayName({
          fullName: currentUser?.party?.name || '',
          type: currentUser?.party?.type === 'Person' ? 'person' : 'company',
        })}
        description={
          formattedBirthDate ? t('common.date_of_birth') + ` ${formattedBirthDate}` : undefined
        }
        roleNames={roleNames}
        type='person'
        as={as}
        titleAs='h2'
        size='xl'
        loading={loading}
      />
    </div>
  );
};
