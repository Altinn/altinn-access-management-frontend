import { Accordion, AccordionHeader, AccordionContent } from '@altinn/altinn-design-system';
import { useState } from 'react';

import { ReactComponent as AddIcon } from '../../../assets/add--circle.svg';

export interface NewApiDelegationsAccordionsProps {
  headerTitle: string;
  content?: string;
}

export const NewApiDelegationsAccordion = ({ headerTitle, content }: NewApiDelegationsAccordionsProps) => {
  const [open, setOpen] = useState(false);

  const addToApiList = (api: any) => {
    // Redux add to
    console.log('click');
  };
  const addButton = (
    <>
      <AddIcon onClick={() => addToApiList}></AddIcon>
    </>
  );
  return (
    <Accordion
      open={open}
      onClick={() => setOpen(!open)}
    >
      <AccordionHeader actions={addButton}>{headerTitle}</AccordionHeader>
      <AccordionContent>{content}</AccordionContent>
    </Accordion>
  );
};
