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
import { useAppDispatch } from '@/rtk/app/hooks';
import { softAdd, softRemove } from '@/rtk/features/delegableApi/delegableApiSlice';

import classes from './NewApiDelegationAccordion.module.css';

export enum AccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewApiDelegationAccordionProps {
  delegableApi: DelegableApi;
  buttonType: AccordionButtonType;
}

export const NewApiDelegationAccordion = ({
  delegableApi,
  buttonType,
}: NewApiDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const actions = (
    <>
      {buttonType === AccordionButtonType.Add && (
        <Button
          iconName={'AddCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={() => dispatch(softAdd(delegableApi))}
        ></Button>
      )}
      {buttonType === AccordionButtonType.Remove && (
        <Button
          iconName={'MinusCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={() => dispatch(softRemove(delegableApi))}
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
