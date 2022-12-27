import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  ButtonVariant,
  ButtonColor,
  Button,
} from '@altinn/altinn-design-system';
import { useState } from 'react';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import classes from './NewDelegationAccordion.module.css';

export enum NewDelegationAccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewDelegationAccordionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonType: NewDelegationAccordionButtonType;
  addRemoveClick: () => void;
}

export const NewDelegationAccordion = ({
  title = 'No info',
  subtitle = 'No info',
  description,
  buttonType,
  addRemoveClick,
}: NewDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);

  const actions = (
    <>
      {buttonType === NewDelegationAccordionButtonType.Add && (
        <Button
          icon={<AddCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={addRemoveClick}
          aria-label={'soft-add'}
        ></Button>
      )}
      {buttonType === NewDelegationAccordionButtonType.Remove && (
        <Button
          icon={<MinusCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={addRemoveClick}
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
          subtitle={subtitle}
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
