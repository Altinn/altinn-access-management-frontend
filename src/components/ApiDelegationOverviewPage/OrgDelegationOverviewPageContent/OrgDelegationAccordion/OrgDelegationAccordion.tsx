import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  Button,
  ButtonColor,
  ButtonVariant,
  List,
  BorderStyle,
  ButtonSize,
} from '@altinn/altinn-design-system';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import type { OverviewOrg } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { softAdd, toggleSoftDelete } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';

import classes from './OrgDelegationAccordion.module.css';
import { DeletableListItem } from './DeletableListItem';

export interface DelegationAccordionProps {
  name: string;
  organization: OverviewOrg;
}

export const OrgDelegationAccordion = ({ name, organization }: DelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const numberOfConnections = organization.listItems.length.toString();

  const action = (
    <>
      <div
        className={cn(classes.accordionHeaderAction, {
          [classes.accordionHeader__softDelete]: organization.isAllSoftDeleted,
        })}
      >
        {numberOfConnections} {t('api_delegation.api_accesses')}
      </div>
      <Button
        variant={ButtonVariant.Quiet}
        color={ButtonColor.Primary}
        iconName={'AddCircle'}
        size={ButtonSize.Small}
      >
        {t('api_delegation.delegate_new_api')}
      </Button>
      {organization.isAllSoftDeleted ? (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Secondary}
          size={ButtonSize.Small}
          iconName={'Cancel'}
        >
          {t('api_delegation.undo')}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          iconName={'MinusCircle'}
          size={ButtonSize.Small}
        >
          {t('api_delegation.delete')}
        </Button>
      )}
    </>
  );

  const listItems = organization.listItems.map((item, i) => (
    <DeletableListItem
      key={i}
      softDeleteCallback={() => dispatch(toggleSoftDelete([organization, item]))}
      softAddCallback={() => dispatch(softAdd([organization, item]))}
      overviewOrg={organization}
      item={item}
    ></DeletableListItem>
  ));

  return (
    <Accordion
      onClick={() => setOpen(!open)}
      open={open}
    >
      <AccordionHeader actions={action}>
        <div
          className={cn({
            [classes.accordionHeader__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {name}
        </div>
      </AccordionHeader>
      <AccordionContent>
        <div className={classes.accordionContent}>
          <List borderStyle={BorderStyle.Dashed}>{listItems}</List>
        </div>
      </AccordionContent>
    </Accordion>
  );
};
