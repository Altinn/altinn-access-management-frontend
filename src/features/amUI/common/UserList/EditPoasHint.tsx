import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import classes from './UserList.module.css';

export const EditPoasHint = () => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  if (isSmall) {
    return null;
  }
  return <span className={classes.editPoasHint}>{t('common.edit_poas')}</span>;
};
