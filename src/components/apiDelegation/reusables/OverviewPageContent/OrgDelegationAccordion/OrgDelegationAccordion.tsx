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
import * as React from 'react';

import type { OverviewOrg } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { softDelete, softRestore } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';
import { DeletableListItem } from '@/components/Reusables/DeletableListItem';

import classes from './OrgDelegationAccordion.module.css';

export interface OrgDelegationAccordionProps {
  organization: OverviewOrg;
  isEditable: boolean;
  softRestoreAllCallback: () => void;
  softDeleteAllCallback: () => void;
  delegateToOrgCallback?: () => void;
}

export const OrgDelegationAccordion = ({
  organization,
  softRestoreAllCallback,
  softDeleteAllCallback,
  isEditable = false,
  delegateToOrgCallback,
}: OrgDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  const numberOfAccesses = organization.apiList.length.toString();
  const dispatch = useAppDispatch();

  const handleSoftDeleteAll = () => {
    softDeleteAllCallback();
    setOpen(true);
  };

  const actions = (
    <>
      <div
        className={cn(classes.accordionHeaderAction__isEditable, {
          [classes.accordionHeader__softDelete]: organization.isAllSoftDeleted,
        })}
      >
        {numberOfAccesses} {t('api_delegation.api_accesses')}
      </div>
      {delegateToOrgCallback && (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Primary}
          icon={<AddCircle />}
          size={ButtonSize.Small}
          onClick={delegateToOrgCallback}
        >
          {t('api_delegation.delegate_new_api')}
        </Button>
      )}
      {isEditable &&
        (organization.isAllSoftDeleted ? (
          <Button
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Secondary}
            size={ButtonSize.Small}
            icon={<Cancel />}
            onClick={softRestoreAllCallback}
          >
            {t('api_delegation.undo')}
          </Button>
        ) : (
          <div className={classes.accordionDeleteButtonContainer}>
            <Button
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Danger}
              icon={<MinusCircle />}
              size={ButtonSize.Small}
              onClick={handleSoftDeleteAll}
            >
              {t('api_delegation.delete')}
            </Button>
          </div>
        ))}
    </>
  );

  const listItems = organization.apiList.map((item, i) => (
    <DeletableListItem
      key={i}
      softDeleteCallback={() => dispatch(softDelete([organization.id, item.id]))}
      softRestoreCallback={() => dispatch(softRestore([organization.id, item.id]))}
      item={item}
      isEditable={isEditable}
    ></DeletableListItem>
  ));

  return (
    <Accordion
      onClick={() => setOpen(!open)}
      open={open}
    >
      <AccordionHeader
        actions={actions}
        subtitle={t('api_delegation.org_nr') + ' ' + organization.orgNr}
      >
        <div
          className={cn({
            [classes.accordionHeader__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {organization.orgName}
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
