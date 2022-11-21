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
import {
  softUndoAll,
  softDeleteAll,
  softDelete,
  softUndo,
} from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import classes from './OrgDelegationAccordion.module.css';
import { DeletableListItem } from './DeletableListItem';

export interface OrgDelegationAccordionProps {
  organization: OverviewOrg;
  isEditable?: boolean;
  softUndoAllCallback: (organization: OverviewOrg) => void;
  softDeleteAllCallback: (organization: OverviewOrg) => void;
}

export const OrgDelegationAccordion = ({
  organization,
  softUndoAllCallback,
  softDeleteAllCallback,
  isEditable = false,
}: OrgDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const numberOfConnections = organization.listItems.length.toString();

  const readonlyActions = (
    <>
      <div className={cn(classes.accordionHeaderAction__isReadonly)}>
        {numberOfConnections} {t('api_delegation.api_accesses')}
      </div>
      <Button
        variant={ButtonVariant.Quiet}
        color={ButtonColor.Primary}
        svgIconComponent={<AddCircle />}
        size={ButtonSize.Small}
      >
        {t('api_delegation.delegate_new_api')}
      </Button>
    </>
  );

  const editActions = (
    <>
      <div
        className={cn(classes.accordionHeaderAction__isEditable, {
          [classes.accordionHeader__softDelete]: organization.isAllSoftDeleted,
        })}
      >
        {numberOfConnections} {t('api_delegation.api_accesses')}
      </div>
      <Button
        variant={ButtonVariant.Quiet}
        color={ButtonColor.Primary}
        svgIconComponent={<AddCircle />}
        size={ButtonSize.Small}
      >
        {t('api_delegation.delegate_new_api')}
      </Button>
      {organization.isAllSoftDeleted ? (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Secondary}
          size={ButtonSize.Small}
          svgIconComponent={<Cancel />}
          onClick={() => softUndoAllCallback(organization)}
        >
          {t('api_delegation.undo')}
        </Button>
      ) : (
        <div className={classes.accordionDeleteButtonContainer}>
          <Button
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Danger}
            svgIconComponent={<MinusCircle />}
            size={ButtonSize.Small}
            onClick={() => softDeleteAllCallback(organization)}
          >
            {t('api_delegation.delete')}
          </Button>
        </div>
      )}
    </>
  );

  const listItems = organization.listItems.map((item, i) => (
    <DeletableListItem
      key={i}
      softDeleteCallback={() => dispatch(softDelete([organization, item]))}
      softUndoCallback={() => dispatch(softUndo([organization, item]))}
      overviewOrg={organization}
      item={item}
      isEditable={isEditable}
    ></DeletableListItem>
  ));

  const handleActions = () => {
    console.log('hey');
    if (isEditable) {
      return editActions;
    } else if (!isEditable && !softDeleteAll) {
      return readonlyActions;
    }
    return editActions;
  };

  return (
    <Accordion
      onClick={() => setOpen(!open)}
      open={open}
    >
      <AccordionHeader
        actions={handleActions()}
        subtitle={t('api_delegation.orgNr') + ' ' + organization.orgNr}
      >
        <div
          className={cn({
            [classes.accordionHeader__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {organization.name}
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
