import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  ButtonVariant,
  ButtonColor,
  Button,
} from '@altinn/altinn-design-system';
import { useState } from 'react';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';

import classes from './NewApiDelegationAccordion.module.css';

export enum AccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewApiDelegationAccordionProps {
  delegableApi: DelegableApi;
  buttonType: AccordionButtonType;
  softAddCallback?: () => { payload: DelegableApi; type: 'delegableApi/softAdd' };
  softRemoveCallback?: () => { payload: DelegableApi; type: 'delegableApi/softRemove' };
}

export const NewApiDelegationAccordion = ({
  delegableApi,
  buttonType,
  softAddCallback,
  softRemoveCallback,
}: NewApiDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);

  const actions = (
    <>
      {buttonType === AccordionButtonType.Add && (
        <Button
          iconName={'AddCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={softAddCallback}
          aria-label={'soft-add'}
        ></Button>
      )}
      {buttonType === AccordionButtonType.Remove && (
        <Button
          iconName={'MinusCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={softRemoveCallback}
          aria-label={'soft-remove'}
        ></Button>
      )}
    </>
  );

  return (
    <div>
      <Accordion
        open={open}
        onClick={() => setOpen(!open)}
      >
        <AccordionHeader
          subtitle={delegableApi.orgName}
          actions={actions}
        >
          {delegableApi.name}
        </AccordionHeader>
        <AccordionContent>
          <div className={classes.newApiAccordionContent}>{delegableApi.description}</div>
        </AccordionContent>
      </Accordion>
    </div>
  );
};
