import { Button, ButtonVariant, ListItem, ButtonColor } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';

import classes from './CompactDeletableListItem.module.css';

export interface DeletableListItemProps {
  removeCallback: () => void;
  firstText: string;
  secondText: string;
}

export const CompactDeletableListItem = ({
  removeCallback,
  firstText,
  secondText,
}: DeletableListItemProps) => {
  const { t } = useTranslation('common');

  return (
    <ListItem>
      <div
        className={classes.listItemTexts}
        data-testid='list-item-texts'
      >
        <div className={classes.firstText}>{firstText}</div>
        <div className={classes.secondText}>{secondText}</div>
        <div className={classes.deleteSection}>
          <Button
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Danger}
            icon={<MinusCircle />}
            onClick={removeCallback}
          >
            {t('api_delegation.delete')}
          </Button>
        </div>
      </div>
    </ListItem>
  );
};
