import { Accordion, AccordionHeader, AccordionContent } from '@altinn/altinn-design-system';
import { useState } from 'react';
import classNames from 'classnames';

import classes from './NewApiDelegationAccordion.module.css';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { ReactComponent as AddIcon } from '@/assets/add--circle.svg';
import { useAppDispatch } from '@/rtk/app/hooks';
import { softAdd, softRemove } from '@/rtk/features/delegableApi/delegableApiSlice';
import { ReactComponent as MinusIcon } from '@/assets/minus--circle.svg';

export enum AccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewApiDelegationAccordionProps {
  delegableApi: DelegableApi;
  buttonType: AccordionButtonType;
}

export const NewApiDelegationAccordion = ({ delegableApi, buttonType }: NewApiDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleSoftAdd = (delegableApi: DelegableApi) => {
    dispatch(softAdd(delegableApi));
  };

  const handleSoftRemove = (delegableApi: DelegableApi) => {
    dispatch(softRemove(delegableApi));
  };

  const actions = (
    <>
      {buttonType === AccordionButtonType.Add && AccordionButtonType.Add && (
        <AddIcon onClick={() => handleSoftAdd(delegableApi)}></AddIcon>
      )}
      {buttonType === AccordionButtonType.Remove && (
        <MinusIcon onClick={() => handleSoftRemove(delegableApi)}></MinusIcon>
      )}
    </>
  );

  return (
    <div className={classes.accordionContainer}>
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
        <AccordionContent>{delegableApi.description}</AccordionContent>
      </Accordion>
    </div>
  );
};
