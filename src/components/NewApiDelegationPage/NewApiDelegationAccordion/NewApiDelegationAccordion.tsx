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

  const handleSoftAdd = (delegableApi: DelegableApi) => {
    dispatch(softAdd(delegableApi));
  };

  const handleSoftRemove = (delegableApi: DelegableApi) => {
    dispatch(softRemove(delegableApi));
  };

  const actions = (
    <>
      {buttonType === AccordionButtonType.Add && AccordionButtonType.Add && (
        <Button
          iconName={'AddCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={() => handleSoftAdd(delegableApi)}
        ></Button>
      )}
      {buttonType === AccordionButtonType.Remove && (
        <Button
          iconName={'MinusCircle'}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={() => handleSoftRemove(delegableApi)}
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
        <AccordionContent>{delegableApi.description}</AccordionContent>
      </Accordion>
    </div>
  );
};
