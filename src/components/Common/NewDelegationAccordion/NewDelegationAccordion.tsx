import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  ButtonVariant,
  ButtonColor,
  Button,
} from '@altinn/altinn-design-system';
import { useState } from 'react';
import { t } from 'i18next';

import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';

import classes from './NewDelegationAccordion.module.css';

export enum AccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewDelegationAccordionProps {
  title: string;
  subtitle: string;
  hasOrgNr?: boolean;
  description: string;
  buttonType: AccordionButtonType;
  callback: () => { payload: DelegableOrg | DelegableApi; type: string };
}

export const NewDelegationAccordion = ({
  title,
  subtitle,
  hasOrgNr = false,
  description,
  buttonType,
  callback,
}: NewDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);

  const actions = (
    <>
      {buttonType === AccordionButtonType.Add && (
        <Button
          iconName={'AddCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={callback}
          aria-label={'soft-add'}
        ></Button>
      )}
      {buttonType === AccordionButtonType.Remove && (
        <Button
          iconName={'MinusCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={callback}
          aria-label={'soft-remove'}
        ></Button>
      )}
    </>
  );

  const getSubtitle = () => {
    if (hasOrgNr) {
      return hasOrgNr && t('api_delegation.orgNr') + ' ' + subtitle;
    }
    return subtitle;
  };

  return (
    <div>
      <Accordion
        open={open}
        onClick={() => setOpen(!open)}
      >
        <AccordionHeader
          subtitle={getSubtitle()}
          actions={actions}
        >
          {title}
        </AccordionHeader>
        <AccordionContent>
          <div className={classes.newApiAccordionContent}>{description}</div>
        </AccordionContent>
      </Accordion>
    </div>
  );
};
