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
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import classes from './NewDelegationAccordion.module.css';

export enum NewDelegationAccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewDelegationAccordionProps {
  title: string;
  subtitle: string;
  hasOrgNr?: boolean;
  description: string;
  buttonType: NewDelegationAccordionButtonType;
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
      {buttonType === NewDelegationAccordionButtonType.Add && (
        <Button
          icon={<AddCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={callback}
          aria-label={'soft-add'}
        ></Button>
      )}
      {buttonType === NewDelegationAccordionButtonType.Remove && (
        <Button
          icon={<MinusCircle />}
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
      return hasOrgNr && t('api_delegation.org_nr') + ' ' + subtitle;
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
