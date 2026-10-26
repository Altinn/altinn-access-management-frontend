import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import classes from './UserList.module.css';

export const EditPoasHint = () => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  if (isSmall) {
    return null;
  }
  return <DsParagraph className={classes.editPoasHint}>{t('common.edit_poas')}</DsParagraph>;
};
