import { Accordion, AccordionHeader, AccordionContent } from '@altinn/altinn-design-system';
import { useState } from 'react';

import type { DelegableOrgApi } from '@/rtk/features/delegableOrgApi/delegableOrgApiSlice';
import { ReactComponent as AddIcon } from '@/assets/add--circle.svg';
import { useAppDispatch } from '@/rtk/app/hooks';
import { softAdd, softRemove } from '@/rtk/features/delegableOrgApi/delegableOrgApiSlice';
import { ReactComponent as MinusIcon } from '@/assets/minus--circle.svg';

export enum AccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewApiDelegationsAccordionsProps {
  delegableApi: DelegableOrgApi;
  buttonType: AccordionButtonType;
}

export const NewApiDelegationsAccordion = ({
  delegableApi,
  buttonType,
}: NewApiDelegationsAccordionsProps) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleSoftAdd = (orgApi: DelegableOrgApi) => {
    dispatch(softAdd(orgApi));
  };

  const handleSoftRemove = (orgApi: DelegableOrgApi) => {
    dispatch(softRemove(orgApi));
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
